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

    static async findUserById(userId: string) {
        const [user] = await db
            .select({ id: users.id, email: users.email, passwordHash: users.passwordHash })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);
        return user;
    }

    static async changePasswordById(userId: string, passwordHash: string) {
        const [user] = await db
            .update(users)
            .set({ passwordHash })
            .where(eq(users.id, userId))
            .returning({ id: users.id });
        return user;
    }

}