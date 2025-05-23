// convex/profile.ts
import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getMediaUrl } from "./general";

// Update existing user fields
export const updateUser = mutation({
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
  handler: async (ctx, { userId, fields }) => {
    console.log("Updating user:", { userId, fields });
    try {
      await ctx.db.patch(userId, {
        ...fields,
        name:
          fields.firstname && fields.lastname
            ? `${fields.firstname} ${fields.lastname}`
            : undefined,
      });
      console.log("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },
});

// Search users by query
export const searchUsers = query({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    const users = await ctx.db.query("users").collect();
    const lower = query.toLowerCase();
    return users.filter((u) =>
      u.username.toLowerCase().includes(lower) ||
      u.firstname.toLowerCase().includes(lower) ||
      u.lastname.toLowerCase().includes(lower)
    );
  },
});

// List all users (optional search filter)
export const list = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, { search }) => {
    const users = await ctx.db.query("users").collect();
    if (!search) return users;

    const lower = search.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(lower) ||
        user.username.toLowerCase().includes(lower) ||
        user.firstname.toLowerCase().includes(lower) ||
        user.lastname.toLowerCase().includes(lower)
    );
  },
});

// Get user by username
export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const user = await ctx.db.query("users").withIndex("by_username", (q) => q.eq("username", username)).unique();
    if (!user) throw new Error("User not found");
    return user;
  },
});

// Get user profile with extended fields
export const getUserProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    return {
      ...user,
      imageUrl: user.imageUrl || "",
      followers: user.followers || [],
      following: user.following || [],
      bio: user.bio || "",
      isPrivate: user.isPrivate || false,
    };
  },
});

// Follow another user
export const followUser = mutation({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, { followerId, followingId }) => {
    if (followerId === followingId) throw new Error("Cannot follow yourself");

    const follower = await ctx.db.get(followerId);
    const following = await ctx.db.get(followingId);
    if (!follower || !following) throw new Error("Invalid users");

    await ctx.db.patch(followerId, {
      following: [...(follower.following || []), followingId],
    });
    await ctx.db.patch(followingId, {
      followers: [...(following.followers || []), followerId],
    });
  },
});

// Unfollow a user
export const unfollowUser = mutation({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, { followerId, followingId }) => {
    const follower = await ctx.db.get(followerId);
    const following = await ctx.db.get(followingId);
    if (!follower || !following) throw new Error("Invalid users");

    await ctx.db.patch(followerId, {
      following: (follower.following || []).filter((id) => id !== followingId),
    });
    await ctx.db.patch(followingId, {
      followers: (following.followers || []).filter((id) => id !== followerId),
    });
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();
  },
});

export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await ctx.db.delete(userId);
  },
});