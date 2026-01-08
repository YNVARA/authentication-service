// import repositories
import AuthRepository from "../authentication/auth.repository";
import EmailVerificationRepository from "./email-verification.repository";

// import utils
import ResponseError from "../../utils/response-error";
import { hash_token, generate_token_hash } from "../../utils/token-hash";
import sendEmail from "../../utils/mailer";

// import config
import { APP_CONFIG } from "../../config";

// service for email verification
export default class EmailVerificationService {

    static async verify_email(data: { token: string }) {
        const hashed = hash_token(data.token);
        const tokenRecord = await EmailVerificationRepository.get_token_data(hashed);

        if (!tokenRecord) {
            throw new ResponseError({
                status: 400,
                code: "INVALID_TOKEN",
                message: "Invalid or expired verification token"
            });
        }

        if (tokenRecord.expires_at < new Date()) {
            throw new ResponseError({
                status: 400,
                code: "TOKEN_EXPIRED",
                message: "Verification token has expired"
            });
        }

        if (tokenRecord.used_at !== null) {
            throw new ResponseError({
                status: 400,
                code: "TOKEN_ALREADY_USED",
                message: "Verification token already used"
            });
        }

        const user = await EmailVerificationRepository.get_user_by_id(tokenRecord.user_id);
        if (!user) {
            throw new ResponseError({
                status: 404,
                code: "USER_NOT_FOUND",
                message: "User not found"
            });
        }

        if (user.email_verified_at !== null) {
            throw new ResponseError({
                status: 400,
                code: "EMAIL_ALREADY_VERIFIED",
                message: "Email already verified"
            });
        }

        await EmailVerificationRepository.verify_user_email(tokenRecord.user_id);
        await EmailVerificationRepository.mark_token_as_used(tokenRecord.id);

        return { success: true };
    }

    static async resend_verification_email(data: { email: string }) {
        const response = await EmailVerificationRepository.get_email(data.email);
        const token_hash = generate_token_hash();

        if (response) {
            await sendEmail({
                to: response.email,
                subject: "Resend Token Verifikasi Email",
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
                                    ${token_hash.token}
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
            return await AuthRepository.store_token_for_email_verification({
                user_id: response.id,
                token_hash: token_hash.hashed_token,
                expires_at: token_hash.expires_at
            });
        }
        else {
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
                                        ${token_hash.token}
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
            return null;
        }
    }

}