import { users, authProviders } from "@database/schema";
import { eq } from "drizzle-orm";
import db from "@database/index";

export default class AuthRepository {

    static async isEmailTaken(email: string) {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return !!user;
    }

    static async localRegister(email: string, password: string): Promise<{ id: string, email: string }> {
        const [user] = await db
            .insert(users)
            .values({ email, passwordHash: password })
            .returning({ id: users.id, email: users.email });
        return user!;
    }

    static async addOAuthProvider(userId: string, provider: string, providerUserId: string) {
        const [authProvider] = await db
            .insert(authProviders)
            .values({ userId, provider, providerUserId })
            .returning({ id: authProviders.userId });
        return authProvider;
    }

}