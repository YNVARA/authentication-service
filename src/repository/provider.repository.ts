import { providers } from "@database/schema";
import { eq, and } from "drizzle-orm";
import db from "@database/index";

export default class ProviderRepository {

    static async createProvider(userId: string, provider: string, providerUserId: string) {
        const [authProvider] = await db
            .insert(providers)
            .values({ userId, provider, providerUserId })
            .returning({ id: providers.userId });
        return authProvider;
    }

    static async getProvider(userId: string, provider: string) {
        const [authProvider] = await db
            .select({ id: providers.id, userId: providers.userId, provider: providers.provider, providerUserId: providers.providerUserId })
            .from(providers)
            .where(and(
                eq(providers.userId, userId),
                eq(providers.provider, provider)
            ));
        return authProvider;
    }


}