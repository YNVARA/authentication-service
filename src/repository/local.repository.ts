import { users } from "@database/schema";
import { eq } from "drizzle-orm";
import db from "@database/index";

export default class LocalAuthRepository {

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