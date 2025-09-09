import { pgTable, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const users = pgTable("users", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => createId()),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }),
    isVerified: boolean("is_verified").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const authProviders = pgTable("auth_providers", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 20 }).notNull(),
    providerUserId: varchar("provider_user_id", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("user_sessions", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    refreshTokenHash: varchar("refresh_token_hash", { length: 255 }).notNull(),
    deviceInfo: varchar("device_info", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});