// config
import { env } from '../config/env';
import { redisClient } from '../config/redis';

// core
import { HttpError } from '../core/errors/http.error';
import { getLogger } from '../core/logger/request-logger';

// type
import type { IAuthenticationRepository } from './auth.interface';
import type { IAuthenticationService } from './auth.interface';

// libs
import { send_email } from '../shared/libs/mailer';
import { compare_otp, generate_otp, hashing_otp } from '../shared/libs/otp';
import { generate_tokens, refresh_access_token } from '../shared/libs/jwt';
import { hashing_password, compare_password } from '../shared/libs/password';

export class AuthenticationService implements IAuthenticationService {
    private logger = getLogger({ layer: 'service', module: 'authentication' });

    constructor(
        private repo: IAuthenticationRepository,
        private container: any,
    ) {}

    async register(data: {
        identifier: {
            kind: 'EMAIL' | 'PHONE' | 'USERNAME' | 'CUSTOM';
            value: string;
            type: string;
        };
        password_hash: string;
        first_name?: string;
        last_name?: string;
        is_verified?: boolean;
    }): Promise<any> {
        const data_exists = await this.repo.exists_identifier(data.identifier);
        if (data_exists) {
            throw new HttpError(400, 'User already exists', 'USER_ALREADY_EXISTS', true);
        }

        const password_hash = await hashing_password(data.password_hash);
        data.password_hash = password_hash;

        const user = await this.repo.create_user(data);

        if (!data.is_verified && data.identifier.kind === 'EMAIL') {
            const otp = generate_otp(6);
            const hash_otp = hashing_otp(otp);
            const normalize_email = data.identifier.value.toLowerCase().trim();

            await redisClient.set(`email_verification:${normalize_email}`, hash_otp, 'EX', env.ttl.verification);

            await send_email({
                to: data.identifier.value,
                subject: 'Verify Your Email',
                html: `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    </head>
                    <body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#333333;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;background:#f5f7fb;">
                            <tr>
                                <td align="center">
                                    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);">
                                        <!-- Header -->
                                        <tr>
                                            <td style="background:#2563eb;padding:32px;text-align:center;">
                                                <h1 style="margin:0;color:#ffffff;font-size:28px;">
                                                    Email Verification
                                                </h1>
                                            </td>
                                        </tr>
                                        <!-- Body -->
                                        <tr>
                                            <td style="padding:40px;">
                                                <h2 style="margin-top:0;color:#111827;">
                                                    Verify your email address
                                                </h2>
                                                <p style="font-size:16px;line-height:1.7;color:#4b5563;">
                                                    Thank you for registering. Use the verification code below to complete your account verification.
                                                </p>
                                                <!-- OTP -->
                                                <table width="100%" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td align="center">
                                                            <div style="
                                                                display:inline-block;
                                                                background:#eff6ff;
                                                                border:2px dashed #2563eb;
                                                                color:#2563eb;
                                                                font-size:36px;
                                                                font-weight:bold;
                                                                letter-spacing:10px;
                                                                padding:18px 36px;
                                                                border-radius:10px;
                                                                margin:24px 0;">
                                                                ${otp}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </table>
                                                <p style="font-size:15px;color:#6b7280;text-align:center;">
                                                    This verification code will expire in
                                                    <strong>${env.ttl.verification / 3600} hours</strong>.
                                                </p>
                                                <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;" />
                                                <p style="font-size:14px;color:#6b7280;line-height:1.7;">
                                                    If you didn't request this verification, you can safely ignore this email.
                                                </p>
                                            </td>
                                        </tr>
                                        <!-- Footer -->
                                        <tr>
                                            <td style="background:#f9fafb;padding:24px;text-align:center;font-size:13px;color:#9ca3af;">
                                                © ${new Date().getFullYear()} Your Company.<br>
                                                This is an automated email, please do not reply.
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                    `,
            });
        }

        return user;
    }

    async login(
        data: {
            identifier: {
                kind: 'EMAIL' | 'PHONE' | 'USERNAME' | 'CUSTOM';
                value: string;
                type: string;
            };
            password_hash: string;
        },
        metadata?: { ip?: string; user_agent?: string },
    ): Promise<any> {
        const user = await this.repo.find_by_identifier(data.identifier);
        if (!user) {
            throw new HttpError(400, 'User not found', 'USER_NOT_FOUND', true);
        }

        const password_match = await compare_password(data.password_hash, user.password_hash);
        if (!password_match) {
            throw new HttpError(400, 'Invalid password', 'INVALID_PASSWORD', true);
        }

        if (!user.verified_at) {
            throw new HttpError(401, `${data.identifier.kind} not verified`, 'IDENTIFIER_NOT_VERIFIED', true);
        }

        const mfaMethods = await this.repo.get_multi_facator_methods(user.id);
        const activeMfa = mfaMethods.find((m) => m.is_enabled && m.verified_at);

        if (activeMfa) {
            const mfaToken = generate_otp(6);
            const mfaHash = hashing_otp(mfaToken);

            // Temporary MFA session using MFA TTL from env
            const mfaSessionId = crypto.randomUUID();
            await redisClient.set(`mfa_session:${mfaSessionId}`, JSON.stringify({ user_id: user.id, type: activeMfa.type, hash: mfaHash }), 'EX', env.ttl.mfa);

            if (activeMfa.type === 'EMAIL') {
                const profile = await this.repo.find_by_id(user.id);
                await send_email({
                    to: profile.email,
                    subject: 'Your Login Verification Code',
                    html: `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8" />
                            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                        </head>
                        <body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fb;padding:40px 20px;">
                                <tr>
                                    <td align="center">
                                        <table width="600" cellpadding="0" cellspacing="0"
                                            style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
                                            <!-- Header -->
                                            <tr>
                                                <td align="center" style="background:#2563eb;padding:32px 24px;color:#ffffff;">
                                                    <h1 style="margin:0;font-size:24px;font-weight:bold;">
                                                        🔐 Login Verification
                                                    </h1>
                                                    <p style="margin:10px 0 0;font-size:14px;opacity:.9;">
                                                        Secure Multi-Factor Authentication
                                                    </p>
                                                </td>
                                            </tr>
                                            <!-- Body -->
                                            <tr>
                                                <td style="padding:40px 32px;">
                                                    <p style="margin:0 0 16px;font-size:16px;">
                                                        Hello,
                                                    </p>
                                                    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#4b5563;">
                                                        We received a request to sign in to your account.
                                                        Please use the verification code below to complete your login.
                                                    </p>
                                                    <!-- OTP -->
                                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                                                        <tr>
                                                            <td align="center"
                                                                style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:24px;">
                                                                <div style="font-size:13px;color:#6b7280;margin-bottom:8px;">
                                                                    Verification Code
                                                                </div>
                                                                <div style="font-size:36px;font-weight:bold;letter-spacing:6px;color:#2563eb;">
                                                                    ${mfaToken}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <!-- Session -->
                                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                                                        <tr>
                                                            <td
                                                                style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;">
                                                                <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">
                                                                    MFA Session ID
                                                                </div>
                                                                <div
                                                                    style="font-size:14px;font-family:monospace;color:#111827;word-break:break-all;">
                                                                    ${mfaSessionId}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <!-- Expiration -->
                                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                                                        <tr>
                                                            <td style="background:#fff7ed;border-left:4px solid #f97316;padding:16px;">
                                                                <strong>Expires in:</strong>
                                                                ${env.ttl.mfa / 60} minutes
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <p style="margin:0;font-size:14px;line-height:1.7;color:#6b7280;">
                                                        If you did <strong>not</strong> attempt to sign in, you can safely ignore this email.
                                                        Never share your verification code with anyone.
                                                    </p>

                                                </td>
                                            </tr>

                                            <!-- Footer -->
                                            <tr>
                                                <td align="center" style="padding:24px;background:#f9fafb;border-top:1px solid #e5e7eb;">
                                                    <p style="margin:0;font-size:13px;color:#9ca3af;">
                                                        This is an automated security email. Please do not reply.
                                                    </p>

                                                    <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">
                                                        © ${new Date().getFullYear()} Your Company. All rights reserved.
                                                    </p>
                                                </td>
                                            </tr>

                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </body>
                        </html>
                `,
                });
            }

            return { mfa_required: true, mfa_session: mfaSessionId, mfa_type: activeMfa.type };
        }

        const { access_token, refresh_token, session_id } = await generate_tokens(user.id);
        const session_data = {
            user_id: user.id,
            ip: metadata?.ip,
            user_agent: metadata?.user_agent,
            created_at: new Date().toISOString(),
        };

        await redisClient.set(`session:${session_id}`, JSON.stringify(session_data), 'EX', env.ttl.session);
        await redisClient.sadd(`user_sessions:${user.id}`, session_id);

        return { user, access_token, refresh_token };
    }

    async generate_token(data: { refresh_token: string }): Promise<any> {
        const accessToken = await refresh_access_token(data.refresh_token);
        return { access_token: accessToken };
    }

    async me(user_id: string): Promise<any> {
        const user = await this.repo.find_by_id(user_id);
        if (!user) throw new HttpError(404, 'User not found', 'USER_NOT_FOUND', true);
        return user;
    }

    async logout(data: { sid: string; user_id?: string }): Promise<void> {
        const sessionData = await redisClient.get(`session:${data.sid}`);
        let user_id = data.user_id;

        if (sessionData && !user_id) {
            user_id = JSON.parse(sessionData).user_id;
        }

        await redisClient.del(`session:${data.sid}`);
        if (user_id) {
            await redisClient.srem(`user_sessions:${user_id}`, data.sid);
        }
    }

    async email_verification(data: { email: string; otp: string }): Promise<any> {
        const { email, otp } = data;
        const normalizedEmail = email.toLowerCase().trim();

        this.logger.info({ email: normalizedEmail }, 'EMAIL_VERIFICATION_ATTEMPT');

        const storedHash = await redisClient.get(`email_verification:${normalizedEmail}`);
        if (!storedHash) {
            this.logger.warn({ email: normalizedEmail }, 'VERIFICATION_HASH_NOT_FOUND_OR_EXPIRED');
            throw new HttpError(400, 'Verification code expired or invalid', 'VERIFICATION_EXPIRED', true);
        }

        const isValid = compare_otp(otp, storedHash);
        if (!isValid) {
            this.logger.warn({ email: normalizedEmail }, 'INVALID_VERIFICATION_CODE_MATCH_FAILED');
            throw new HttpError(400, 'Invalid verification code', 'INVALID_CODE', true);
        }

        const user = await this.repo.find_by_identifier({ kind: 'EMAIL', value: email, type: 'PRIMARY' });
        if (!user) {
            throw new HttpError(404, 'User not found', 'USER_NOT_FOUND', true);
        }

        await this.repo.verify_identifier({ user_id: user.id, kind: 'EMAIL', value: email });
        await redisClient.del(`email_verification:${normalizedEmail}`);

        return { message: 'Email verified successfully' };
    }

    async email_verification_resend(email: string): Promise<any> {
        const user = await this.repo.find_by_identifier({ kind: 'EMAIL', value: email, type: 'PRIMARY' });
        if (!user) {
            throw new HttpError(404, 'User not found', 'USER_NOT_FOUND', true);
        }

        if (user.verified_at) {
            throw new HttpError(400, 'Email already verified', 'EMAIL_ALREADY_VERIFIED', true);
        }

        const otp = generate_otp(6);
        const hash_otp = hashing_otp(otp);
        const normalizedEmail = email.toLowerCase().trim();

        await redisClient.set(`email_verification:${normalizedEmail}`, hash_otp, 'EX', env.ttl.verification);
        await send_email({
            to: email,
            subject: 'Verify Your Email',
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Verification</title>
            </head>
            <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:40px 20px;">
                    <tr>
                        <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0"
                                style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.08);">
                                <!-- Header -->
                                <tr>
                                    <td style="background:linear-gradient(135deg,#2563eb,#4f46e5);padding:40px;text-align:center;">
                                        <h1 style="margin:0;color:#ffffff;font-size:28px;">
                                            Email Verification
                                        </h1>
                                        <p style="margin-top:10px;color:#dbeafe;font-size:15px;">
                                            Confirm your email address
                                        </p>
                                    </td>
                                </tr>
                                <!-- Body -->
                                <tr>
                                    <td style="padding:40px;color:#374151;">
                                        <p style="font-size:16px;line-height:1.7;margin-top:0;">
                                            Hello,
                                        </p>
                                        <p style="font-size:16px;line-height:1.7;">
                                            Thank you for registering. To complete your verification,
                                            please use the following One-Time Password (OTP):
                                        </p>
                                        <div style="margin:35px 0;text-align:center;">
                                            <div style="
                                                display:inline-block;
                                                background:#eff6ff;
                                                border:2px dashed #2563eb;
                                                border-radius:10px;
                                                padding:18px 36px;
                                                font-size:36px;
                                                letter-spacing:10px;
                                                font-weight:bold;
                                                color:#2563eb;
                                            ">
                                                ${otp}
                                            </div>
                                        </div>
                                        <p style="font-size:15px;color:#6b7280;line-height:1.7;">
                                            This verification code will expire in
                                            <strong>${env.ttl.verification / 3600} hours</strong>.
                                        </p>
                                        <table width="100%" cellpadding="0" cellspacing="0" style="
                                            margin-top:30px;
                                            background:#fff7ed;
                                            border-left:4px solid #f59e0b;
                                            border-radius:6px;
                                        ">
                                            <tr>
                                                <td style="padding:18px;">
                                                    <strong>Security Notice</strong>
                                                    <p style="margin:8px 0 0;color:#6b7280;line-height:1.6;">
                                                        Never share this code with anyone. Our team will
                                                        never ask you for your verification code.
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <!-- Footer -->
                                <tr>
                                    <td style="
                                        padding:30px;
                                        background:#f9fafb;
                                        text-align:center;
                                        color:#9ca3af;
                                        font-size:13px;
                                        line-height:1.7;
                                    ">
                                        <strong>Your Application</strong><br>
                                        This is an automated email. Please do not reply.<br><br>

                                        © ${new Date().getFullYear()} Your Application.
                                        All rights reserved.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `,
        });

        return { message: 'Verification code resent' };
    }

    async email_verification_status(email: string): Promise<any> {
        const user = await this.repo.find_by_identifier({ kind: 'EMAIL', value: email, type: 'PRIMARY' });
        if (!user) {
            throw new HttpError(404, 'User not found', 'USER_NOT_FOUND', true);
        }
        return {
            verified: !!user.verified_at,
            verified_at: user.verified_at,
        };
    }

    async mfa_verify_session(data: { mfa_session: string; token: string }, metadata?: { ip?: string; user_agent?: string }): Promise<any> {
        const { mfa_session, token } = data;
        const sessionData = await redisClient.get(`mfa_session:${mfa_session}`);
        if (!sessionData) {
            throw new HttpError(401, 'MFA session expired', 'MFA_EXPIRED', true);
        }

        const { user_id, hash } = JSON.parse(sessionData);
        if (!compare_otp(token, hash)) {
            throw new HttpError(401, 'Invalid MFA token', 'INVALID_MFA', true);
        }

        await redisClient.del(`mfa_session:${mfa_session}`);

        const { access_token, refresh_token, session_id } = generate_tokens(user_id);
        const session_data = {
            user_id: user_id,
            ip: metadata?.ip,
            user_agent: metadata?.user_agent,
            created_at: new Date().toISOString(),
        };

        await redisClient.set(`session:${session_id}`, JSON.stringify(session_data), 'EX', env.ttl.session);
        await redisClient.sadd(`user_sessions:${user_id}`, session_id);

        return { access_token };
    }

    async mfa_setup_email(user_id: string): Promise<void> {
        await this.repo.upsert_multi_factor_method(user_id, { type: 'EMAIL', is_enabled: true });
        await this.repo.verify_multi_factor_method(user_id, 'EMAIL');
    }

    async mfa_toggle(user_id: string, type: string, enabled: boolean): Promise<void> {
        await this.repo.upsert_multi_factor_method(user_id, { type: type as any, is_enabled: enabled });
    }
}
