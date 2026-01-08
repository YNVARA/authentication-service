// import dependencies
import argon2 from "argon2";

// import repository
import AuthRepository from "./auth.repository";

// import config
import { APP_CONFIG } from "../../config";

// import utils
import { generate_tokens, refreshAccessToken } from "../../utils/jwt";
import generate_token_hash from "../../utils/token-hash";
import ResponseError from "../../utils/response-error";
import sendEmail from "../../utils/mailer";
import { redis } from "../../utils/redis";

// service for handle authentication
export default class AuthService {

    static async register(data: {
        email: string,
        username: string,
        password: string,
        confirm_password: string
    }) {
        // check if email or username already exists
        const emailExists = await AuthRepository.count_email(data.email);
        const usernameExists = await AuthRepository.count_username(data.username);

        // throw error if exists
        if (emailExists > 0 || usernameExists > 0) {
            throw new ResponseError({
                status: 409,
                code: "ACCOUNT_ALREADY_EXISTS",
                message: "An account with the provided credentials already exists."
            });
        }

        // validate password match
        if (data.password !== data.confirm_password) {
            throw new ResponseError({
                status: 400,
                code: "PASSWORD_MISMATCH",
                message: "Passwords do not match."
            });
        }

        // hash password
        const hash_password = await argon2.hash(data.password);

        // create user
        const response = await AuthRepository.create_user({
            email: data.email,
            username: data.username,
            hash_password: hash_password
        });

        // generate token hash for email verification
        const token_hash = generate_token_hash();

        // store token for email verification in database
        await AuthRepository.store_token_for_email_verification({
            user_id: response.id,
            token_hash: token_hash.hashed_token,
            expires_at: token_hash.expires_at
        });

        await sendEmail({
            to: response.email,
            subject: "Verifikasi Akun",
            html: `
            <div style="background:#f1f5f9;padding:40px 0;font-family:Arial,Helvetica,sans-serif">
                <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05)">
                    
                    <div style="background:#020617;padding:28px;text-align:center">
                        <h1 style="color:#ffffff;margin:0;font-size:22px">${APP_CONFIG.NAME}</h1>
                    </div>

                    <div style="padding:36px;color:#0f172a">
                        <h2 style="margin-top:0">Verifikasi Email Anda</h2>

                        <p style="font-size:15px;line-height:1.7;color:#334155">
                            Terima kasih telah mendaftar di <strong>${APP_CONFIG.NAME}</strong>.
                            Untuk mengaktifkan akun Anda, silakan salin token verifikasi di bawah ini
                            lalu masukkan pada halaman verifikasi aplikasi.
                        </p>

                        <div style="background:#0f172a;border-radius:8px;padding:16px;margin:28px 0;text-align:center">
                            <p style="margin:0;font-size:12px;color:#94a3b8">TOKEN VERIFIKASI</p>
                            <p style="margin:8px 0 0 0;font-size:18px;letter-spacing:1px;font-weight:600;color:#e5e7eb">
                                ${token_hash.hashed_token}
                            </p>
                        </div>

                        <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-top:12px">
                            <p style="margin:0;font-size:13px;color:#475569">Token berlaku hingga:</p>
                            <p style="margin:6px 0 0 0;font-size:14px;font-weight:600;color:#020617">
                                ${token_hash.expires_at.toLocaleString("id-ID")}
                            </p>
                        </div>

                        <p style="margin-top:28px;font-size:13px;color:#475569;line-height:1.6">
                            Demi keamanan, jangan bagikan token ini kepada siapa pun. 
                            Jika Anda tidak merasa mendaftarkan akun ini, silakan abaikan email ini.
                        </p>

                        <p style="margin-top:32px;font-size:13px;color:#475569">
                            Salam,<br/>
                            <strong>Tim ${APP_CONFIG.NAME}</strong>
                        </p>
                    </div>

                    <div style="background:#f1f5f9;text-align:center;padding:16px;font-size:12px;color:#64748b">
                        © ${new Date().getFullYear()} ${APP_CONFIG.NAME} · All rights reserved
                    </div>
                </div>
            </div>
            `
        });

        return response;
    }

    static async login(data: {
        email_or_username: string,
        password: string,
        ip: string,
        ua: string
    }) {
        // find user
        const response = await AuthRepository.login(data);
        if (!response) throw new ResponseError({
            status: 401,
            code: "INVALID_CREDENTIALS",
            message: "Invalid email/username or password."
        });

        // validate password
        const is_password_valid = await argon2.verify(response.hash_password, data.password);
        if (!is_password_valid) throw new ResponseError({
            status: 401,
            code: "INVALID_CREDENTIALS",
            message: "Invalid email/username or password."
        });

        // validate status
        switch (response.status) {
            case "pending":
                throw new ResponseError({
                    status: 403,
                    code: "ACCOUNT_PENDING",
                    message: "Your account is pending verification. Please verify your email."
                });

            case "suspend":
                throw new ResponseError({
                    status: 403,
                    code: "ACCOUNT_SUSPENDED",
                    message: "Your account has been suspended. Please contact support."
                });

            case "inactive":
                throw new ResponseError({
                    status: 403,
                    code: "ACCOUNT_INACTIVE",
                    message: "Your account is inactive. Please contact support."
                });

            case "deleted":
                throw new ResponseError({
                    status: 401,
                    code: "INVALID_CREDENTIALS",
                    message: "Invalid email/username or password."
                });

            case "active":
                break;

            default:
                throw new ResponseError({
                    status: 403,
                    code: "ACCOUNT_INVALID_STATE",
                    message: "Account is in an invalid state."
                });
        }

        // validate email verification
        if (!response.email_verified_at) {
            throw new ResponseError({
                status: 403,
                code: "EMAIL_NOT_VERIFIED",
                message: "Please verify your email before logging in."
            });
        }

        // update last login
        await AuthRepository.update_last_login(response.id);

        // create token
        const token = generate_tokens(response.public_id);

        // create session
        const ttl = 60 * 60 * 24 * 7;
        const redis_payload = {
            sid: token.session_id,
            user_id: response.id,
            ip: data.ip,
            user_agent: data.ua
        }
        await redis.set(`session:${token.session_id}`, JSON.stringify(redis_payload), "EX", ttl);

        // return token
        return {
            access_token: token.access_token,
            refresh_token: token.refresh_token
        };
    }

    static async refresh_token(token: string) {
        const response = await refreshAccessToken(token);
        return response;
    }

    static async logout(sid: string) {
        const session = await redis.get(`session:${sid}`);

        if (!session) {
            throw new ResponseError({
                status: 401,
                code: "INVALID_SESSION",
                message: "Invalid session. Please login again."
            });
        }

        let payload: any;
        try {
            payload = JSON.parse(session);
        } catch {
            throw new ResponseError({
                status: 401,
                code: "INVALID_SESSION",
                message: "Invalid session. Please login again."
            });
        }

        await redis.del(`session:${sid}`);
        return payload;
    }

}