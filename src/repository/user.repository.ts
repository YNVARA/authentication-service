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

    static async register(email: string, password?: string): Promise<{ id: string }> {
        const [user] = await db
            .insert(users)
            .values({ email, passwordHash: password })
            .returning({ id: users.id });
        return user!;
    }

    static async login(email: string) {
        const [user] = await db
            .select({ id: users.id, email: users.email, passwordHash: users.passwordHash })
            .from(users)
            .where(eq(users.email, email));
        return user;
    }

}