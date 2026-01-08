import crypto from "crypto";

export const generate_token_hash = () => {
    const token = crypto.randomBytes(32).toString("hex");                           // dikirim ke user
    const hashed_token = crypto.createHash("sha256").update(token).digest("hex");   // simpan di DB
    const expires_at = new Date(Date.now() + 15 * 60 * 1000);                       // expired (15 menit)
    return { token, hashed_token, expires_at };
};

export const hash_token = (token: string) => {
    return crypto.createHash("sha256").update(token).digest("hex");
}