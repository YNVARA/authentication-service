import crypto from "crypto";

const generate_token_hash = () => {
    // Token yang dikirim ke user
    const token = crypto.randomBytes(32).toString("hex");

    // Hash yang disimpan di database
    const hashed_token = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    // Masa berlaku token (misal 15 menit)
    const expires_at = new Date(Date.now() + 15 * 60 * 1000);

    return {
        hashed_token,
        expires_at
    };
}

export default generate_token_hash;