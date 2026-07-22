import crypto from 'crypto';
import { env } from '../../config/env';

const OTP_SECRET = env.otp.secret || 'supersecret';

/**
 * Generate a random numeric OTP
 */
export const generate_otp = (length: number = 6): string => {
    const max = 10 ** length;
    const num = crypto.randomInt(0, max);
    return num.toString().padStart(length, '0');
};

/**
 * Hash the OTP using HMAC-SHA256 for secure storage in Redis
 */
export function hashing_otp(otp: string): string {
    const cleanOtp = String(otp).trim();
    return crypto.createHmac('sha256', OTP_SECRET).update(cleanOtp).digest('hex');
}

/**
 * Compare a plain OTP with its hashed version using timingSafeEqual to prevent timing attacks
 */
export function compare_otp(inputOtp: string, hashedOtp: string): boolean {
    if (!inputOtp || !hashedOtp) {
        return false;
    }

    const hashedInput = hashing_otp(inputOtp);

    // timingSafeEqual requires both buffers to have the same length
    const bufferA = Buffer.from(hashedInput, 'hex');
    const bufferB = Buffer.from(hashedOtp, 'hex');

    if (bufferA.length !== bufferB.length) {
        return false;
    }

    return crypto.timingSafeEqual(bufferA, bufferB);
}
