import { v } from "convex/values";
import { internalMutation, query, QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getMediaUrl } from "./general";
import { queryGeneric } from "convex/server";

export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    phoneNumber: v.string(),
    imageUrl: v.optional(v.string()),
    username: v.string(),
    firstname: v.string(),
    lastname: v.string(),
    dateOfBirth: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const [existingUsername, existingEmail, existingPhone, existingClerkId] =
      await Promise.all([
        ctx.db
          .query("users")
          .withIndex("by_username", (q) => q.eq("username", args.username))
          .first(),
        ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", args.email))
          .first(),
        ctx.db
          .query("users")
          .withIndex("by_phoneNumber", (q) =>
            q.eq("phoneNumber", args.phoneNumber)
          )
          .first(),
        ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
          .first(),
      ]);

    if (existingUsername) throw new Error("Username already exists");
    if (existingEmail) throw new Error("Email already exists");
    if (existingPhone) throw new Error("Phone number already exists");
    if (existingClerkId) throw new Error("Clerk ID already exists");

    const userId = await ctx.db.insert("users", {
      name: `${args.firstname} ${args.lastname}`,
      email: args.email,
      imageUrl: args.imageUrl,
      username: args.username,
      firstname: args.firstname,
      lastname: args.lastname,
      phoneNumber: args.phoneNumber,
      dateOfBirth: args.dateOfBirth,

      // Defaults
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

export const updateUser = internalMutation({
  args: {
    userId: v.id("users"),
    fields: v.object({
      email: v.optional(v.string()),
      phoneNumber: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      username: v.optional(v.string()),
      firstname: v.optional(v.string()),
      lastname: v.optional(v.string()),
      dateOfBirth: v.optional(v.number()),
      bio: v.optional(v.string()),
      isPrivate: v.optional(v.boolean()),
      preferences: v.optional(v.any()),
      updatedAt: v.number(),
    }),
  },
  async handler(ctx, { userId, fields }) {
    await ctx.db.patch(userId, {
      ...fields,
      name:
        fields.firstname && fields.lastname
          ? `${fields.firstname} ${fields.lastname}`
          : undefined,
    });
  },
});

export const deleteUser = internalMutation({
  args: {
    userId: v.id("users"),
  },
  async handler(ctx, args) {
    await ctx.db.delete(args.userId);
  },
});

export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) throw new Error("User not found");

    if (!user.imageUrl || user.imageUrl.startsWith("http")) {
      return user;
    }

    const url = await getMediaUrl(ctx, user.imageUrl);

    return { ...user, imageUrl: url };
  },
});

export const getUserById = async (ctx: QueryCtx, userId: Id<"users">) => {
  const user = await ctx.db.get(userId);

  if (!user) throw new Error("User not found");

  if (!user.imageUrl || user.imageUrl.startsWith("http")) {
    return user;
  }

  const url = await getMediaUrl(ctx, user.imageUrl);

  return { ...user, imageUrl: url };
};

// testing
export const current = query({
  args: {},
  handler: async (ctx, args) => {
    return await getCurrentUser(ctx);
  },
});

export const getCurrentUser = async (ctx: QueryCtx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthorized");
  }
  return userByExternalId(ctx, identity.subject);
};

export const userByExternalId = async (ctx: QueryCtx, externalId: string) => {
  return await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", externalId))
    .unique();
};

export const getCurrentUserOrThrow = async (ctx: QueryCtx) => {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// viewerId: v.optional(v.id("users")), // the current viewer (can be null/undefined)

// if (user.isPrivate) {
//   // If no viewer or viewer is not a follower, return only public fields
//   if (!viewerId || !user.followers?.includes(viewerId)) {
//     return {
//       _id: user._id,
//       username: user.username,
//       imageUrl: user.imageUrl,
//       isPrivate: true,
//     };
//   }
// }
