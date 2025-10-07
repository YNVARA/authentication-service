import { users } from "@database/schema";
import { eq } from "drizzle-orm";
import db from "@database/index";

export default class UserRepository {

    static async isEmailTaken(email: string) {
        const [user] = await db
            .select({ email: users.email })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);;
        return !!user;
    }
}