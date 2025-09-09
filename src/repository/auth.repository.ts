import { users, authProviders, sessions } from "@database/schema";
import { eq, and } from "drizzle-orm";
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

    static async localLogin(email: string): Promise<{ id: string; email: string; passwordHash: string | null } | null> {
        const [user] = await db
            .select({ id: users.id, email: users.email, passwordHash: users.passwordHash })
            .from(users)
            .where(eq(users.email, email));
        return user ?? null;
    }

    static async getOAuthProvider(userId: string, provider: string) {
        const [authProvider] = await db
            .select({ id: authProviders.id, userId: authProviders.userId, provider: authProviders.provider, providerUserId: authProviders.providerUserId })
            .from(authProviders)
            .where(and(
                eq(authProviders.userId, userId),
                eq(authProviders.provider, provider)
            ));
        return authProvider;
    }

    static async checkSession(userId: string, userAgent: string, deviceInfo: string) {
        const [session] = await db
            .select({
                id: sessions.id,
                userId: sessions.userId,
                refreshTokenHash: sessions.refreshTokenHash,
                userAgent: sessions.userAgent,
                deviceInfo: sessions.deviceInfo
            })
            .from(sessions)
            .where(and(
                eq(sessions.userId, userId),
                eq(sessions.userAgent, userAgent),
                eq(sessions.deviceInfo, deviceInfo)
            ));
        return session
    }

    static async createSession(userId: string, refreshTokenHash: string, userAgent: string, deviceInfo: string): Promise<{ id: string }> {
        const [session] = await db
            .insert(sessions)
            .values({ userId, refreshTokenHash, userAgent, deviceInfo })
            .returning({ id: sessions.id });
        return session!;
    }

    static async deleteSession(userId: string, userAgent: string, deviceInfo: string) {
        const [session] = await db
            .delete(sessions)
            .where(and(
                eq(sessions.userId, userId),
                eq(sessions.userAgent, userAgent),
                eq(sessions.deviceInfo, deviceInfo)
            ))
            .returning({ id: sessions.id });
        return session;
    }

}