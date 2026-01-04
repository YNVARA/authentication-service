import { createId } from "@paralleldrive/cuid2";

export default function generatePublicId() {
    return createId();
}