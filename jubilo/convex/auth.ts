// convex/auth.ts
import { v } from "convex/values";
import { mutation, query, internalMutation, QueryCtx } from "./_generated/server";
import { getMediaUrl } from "./general";

// Create a new user in the DB (internal use only)
export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    phoneNumber: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    username: v.string(),
    firstname: v.string(),
    lastname: v.string(),
    dateOfBirth: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // First check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      console.log("User already exists, skipping creation");
      return existingUser._id;
    }

    const [existingUsername, existingEmail] = await Promise.all([
      ctx.db.query("users").withIndex("by_username", (q) => q.eq("username", args.username)).first(),
      ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", args.email)).first(),
    ]);

    if (existingUsername) throw new Error("Username already exists");
    if (existingEmail) throw new Error("Email already exists");

    const userId = await ctx.db.insert("users", {
      name: `${args.firstname} ${args.lastname}`,
      email: args.email,
      imageUrl: args.imageUrl,
      username: args.username,
      displayUsername: `@${args.username}`,
      firstname: args.firstname,
      lastname: args.lastname,
      phoneNumber: args.phoneNumber || "",
      dateOfBirth: args.dateOfBirth,
      lastSeen: now,
      isOnline: false,
      isVerified: false,
      isPrivate: false,
      isSuspended: false,
      role: "user",
      followers: [],
      following: [],
      bio: "",
      clerkId: args.clerkId,
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

// Check if username is available
export const checkUsername = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();
    return !user;
  },
});

// Get user by Clerk ID
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!user) return null; // Return null instead of throwing error

    if (!user.imageUrl || user.imageUrl.startsWith("http")) return user;
    const url = await getMediaUrl(ctx, user.imageUrl);
    return { ...user, imageUrl: url };
  },
});

// Auth helpers
export const getCurrentUser = async (ctx: QueryCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  return userByExternalId(ctx, identity.subject);
};

export const getCurrentUserOrThrow = async (ctx: QueryCtx) => {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("User not found");
  return user;
};

export const userByExternalId = async (ctx: QueryCtx, externalId: string) => {
  return await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", externalId))
    .unique();
};

// Delete user
export const deleteUser = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await ctx.db.delete(userId);
  },
});

export const updateUser = internalMutation({
  args: {
    userId: v.id("users"),
    fields: v.object({
      email: v.string(),
      phoneNumber: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      username: v.string(),
      firstname: v.string(),
      lastname: v.string(),
      updatedAt: v.number(),
    }),
  },
  handler: async (ctx, { userId, fields }) => {
    await ctx.db.patch(userId, {
      ...fields,
      name: `${fields.firstname} ${fields.lastname}`,
      updatedAt: Date.now(),
    });
  },
});