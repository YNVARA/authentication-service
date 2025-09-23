import { sessions } from "@database/schema";
import { eq, and } from "drizzle-orm";
import db from "@database/index";

export default class SessionRepository {

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