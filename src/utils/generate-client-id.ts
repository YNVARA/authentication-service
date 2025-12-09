import crypto from "crypto";

export default function generateClientId() {
    return "app_" + crypto.randomBytes(12).toString("base64url");
}
