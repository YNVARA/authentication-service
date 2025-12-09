import crypto from "crypto";

export default function generateClientSecret() {
    return "app_secret_" + crypto.randomBytes(32).toString("base64url");
}