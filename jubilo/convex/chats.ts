import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./auth";
import { Id } from "./_generated/dataModel";

export const createChat = mutation({
  args: {
    name: v.optional(v.string()),
    members: v.array(v.id("users")),
    isGroup: v.optional(v.boolean()),
    groupName: v.optional(v.string()),
    groupImage: v.optional(v.string()),
    groupDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const allMembers = [...new Set([...args.members, user._id])];

    if (!args.isGroup) {
      const existingChat = await ctx.db.query("chats")
        .filter((q) => 
          q.or(
            q.eq(q.field("combinedMemberKey"), allMembers.sort().join("_")),
            q.eq(q.field("combinedMemberKey"), allMembers.sort().reverse().join("_"))
          )
        )
        .first();

      if (existingChat) {
        return existingChat._id;
      }
    }

    const combinedUserIds = allMembers.sort().join("_");
    const chatId = await ctx.db.insert("chats", {
      name: args.name ?? "",
      members: allMembers,
      isGroup: args.isGroup ?? false,
      groupName: args.groupName,
      groupImage: args.groupImage ?? "",
      groupDescription: args.groupDescription,
      groupCreatedBy: user._id,
      groupCreatedAt: Date.now(),
      groupUpdatedAt: Date.now(),
      combinedMemberKey: combinedUserIds,
      unreadCounts: allMembers.map(memberId => ({
        userId: memberId,
        count: 0
      }))
    });

    return chatId;
  },
});

export const getChat = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    return chat;
  },
});

export const getUserChats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    const allChats = await ctx.db.query("chats").collect();
    return allChats.filter(chat => chat.members.includes(user._id));
  },
});

export const updateChat = mutation({
  args: {
    chatId: v.id("chats"),
    name: v.optional(v.string()),
    groupName: v.optional(v.string()),
    groupImage: v.optional(v.string()),
    groupDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const chat = await ctx.db.get(args.chatId);
    
    if (!chat) throw new Error("Chat not found");
    if (!chat.isGroup) throw new Error("Cannot update non-group chat");
    if (chat.groupCreatedBy !== user._id) throw new Error("Not authorized to update chat");

    await ctx.db.patch(args.chatId, {
      name: args.name,
      groupName: args.groupName,
      groupImage: args.groupImage,
      groupDescription: args.groupDescription,
      groupUpdatedAt: Date.now(),
    });

    return args.chatId;
  },
});

export const addMembers = mutation({
  args: {
    chatId: v.id("chats"),
    newMembers: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const chat = await ctx.db.get(args.chatId);
    
    if (!chat) throw new Error("Chat not found");
    if (!chat.isGroup) throw new Error("Cannot add members to non-group chat");
    if (chat.groupCreatedBy !== user._id) throw new Error("Not authorized to add members");

    const updatedMembers = [...new Set([...chat.members, ...args.newMembers])];
    const updatedUnreadCounts = [
      ...chat.unreadCounts ?? [],
      ...args.newMembers.map(memberId => ({
        userId: memberId,
        count: 0
      }))
    ];

    await ctx.db.patch(args.chatId, {
      members: updatedMembers,
      unreadCounts: updatedUnreadCounts,
      groupUpdatedAt: Date.now(),
    });

    return args.chatId;
  },
});

export const removeMember = mutation({
  args: {
    chatId: v.id("chats"),
    memberId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const chat = await ctx.db.get(args.chatId);
    
    if (!chat) throw new Error("Chat not found");
    if (!chat.isGroup) throw new Error("Cannot remove members from non-group chat");
    if (chat.groupCreatedBy !== user._id && user._id !== args.memberId) {
      throw new Error("Not authorized to remove members");
    }

    const updatedMembers = chat.members.filter(id => id !== args.memberId);
    const updatedUnreadCounts = (chat.unreadCounts ?? []).filter(
      count => count.userId !== args.memberId
    );

    // If removing the last member, delete the chat
    if (updatedMembers.length === 0) {
      await ctx.db.delete(args.chatId);
      return null;
    }

    // If removing the creator, assign a new creator
    let groupCreatedBy = chat.groupCreatedBy;
    if (groupCreatedBy === args.memberId) {
      groupCreatedBy = updatedMembers[0];
    }

    await ctx.db.patch(args.chatId, {
      members: updatedMembers,
      unreadCounts: updatedUnreadCounts,
      groupCreatedBy,
      groupUpdatedAt: Date.now(),
    });

    return args.chatId;
  },
});

export const updateGroupAdmins = mutation({
  args: {
    chatId: v.id("chats"),
    adminIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const chat = await ctx.db.get(args.chatId);
    
    if (!chat) throw new Error("Chat not found");
    if (!chat.isGroup) throw new Error("Not a group chat");
    if (chat.groupCreatedBy !== user._id) throw new Error("Not authorized to update admins");

    // Ensure all admins are members
    const invalidAdmins = args.adminIds.filter(id => !chat.members.includes(id));
    if (invalidAdmins.length > 0) {
      throw new Error("Some admin IDs are not members of the chat");
    }

    await ctx.db.patch(args.chatId, {
      groupAdmins: args.adminIds,
      groupUpdatedAt: Date.now(),
    });

    return args.chatId;
  },
});

export const leaveGroup = mutation({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const chat = await ctx.db.get(args.chatId);
    
    if (!chat) throw new Error("Chat not found");
    if (!chat.isGroup) throw new Error("Not a group chat");
    if (!chat.members.includes(user._id)) throw new Error("Not a member of this chat");

    const updatedMembers = chat.members.filter(id => id !== user._id);
    const updatedUnreadCounts = (chat.unreadCounts ?? []).filter(
      count => count.userId !== user._id
    );

    // If removing the last member, delete the chat
    if (updatedMembers.length === 0) {
      await ctx.db.delete(args.chatId);
      return null;
    }

    // If removing the creator, assign a new creator
    let groupCreatedBy = chat.groupCreatedBy;
    if (groupCreatedBy === user._id) {
      groupCreatedBy = updatedMembers[0];
    }

    await ctx.db.patch(args.chatId, {
      members: updatedMembers,
      unreadCounts: updatedUnreadCounts,
      groupCreatedBy,
      groupUpdatedAt: Date.now(),
    });

    return args.chatId;
  },
});

export const getChatMembers = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");

    const members = await Promise.all(
      chat.members.map(async (memberId) => {
        const user = await ctx.db.get(memberId);
        return {
          ...user,
          isAdmin: chat.groupAdmins?.includes(memberId) ?? false,
          isCreator: chat.groupCreatedBy === memberId,
        };
      })
    );

    return members;
  },
});

export const updateMessageStatus = mutation({
  args: {
    messageId: v.id("messages"),
    status: v.union(
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("read")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const message = await ctx.db.get(args.messageId);
    
    if (!message) throw new Error("Message not found");
    
    const chat = await ctx.db.get(message.chatId);
    if (!chat) throw new Error("Chat not found");
    if (!chat.members.includes(user._id)) throw new Error("Not a member of this chat");

    const now = Date.now();
    const updates: any = {};

    switch (args.status) {
      case "sent":
        updates.isDelivered = true;
        updates.isSeen = false;
        break;
      case "delivered":
        updates.isDelivered = true;
        updates.isSeen = false;
        break;
      case "read":
        updates.isSeen = true;
        // Update unread count
        if (chat.unreadCounts) {
          const updatedCounts = chat.unreadCounts.map(count => {
            if (count.userId === user._id) {
              return { ...count, count: Math.max(0, count.count - 1) };
            }
            return count;
          });
          await ctx.db.patch(chat._id, { unreadCounts: updatedCounts });
        }
        break;
    }

    await ctx.db.patch(args.messageId, updates);
    return args.messageId;
  },
});

export const markAllMessagesAsRead = mutation({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const chat = await ctx.db.get(args.chatId);
    
    if (!chat) throw new Error("Chat not found");
    if (!chat.members.includes(user._id)) throw new Error("Not a member of this chat");

    // Get all unread messages for this user in this chat
    const unreadMessages = await ctx.db
      .query("messages")
      .filter((q) => 
        q.and(
          q.eq(q.field("chatId"), args.chatId),
          q.eq(q.field("isSeen"), false)
        )
      )
      .collect();

    // Update each message
    for (const message of unreadMessages) {
      await ctx.db.patch(message._id, {
        isSeen: true,
      });
    }

    // Reset unread count for this user
    if (chat.unreadCounts) {
      const updatedCounts = chat.unreadCounts.map(count => {
        if (count.userId === user._id) {
          return { ...count, count: 0 };
        }
        return count;
      });
      await ctx.db.patch(chat._id, { unreadCounts: updatedCounts });
    }

    return args.chatId;
  },
});

export const getUnreadCount = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const chat = await ctx.db.get(args.chatId);
    
    if (!chat) throw new Error("Chat not found");
    if (!chat.members.includes(user._id)) throw new Error("Not a member of this chat");

    const userUnreadCount = chat.unreadCounts?.find(
      count => count.userId === user._id
    )?.count ?? 0;

    return userUnreadCount;
  },
});

export const getMessageStatus = query({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    return {
      isDelivered: message.isDelivered ?? false,
      isSeen: message.isSeen ?? false,
    };
  },
});

export const getChatStats = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const chat = await ctx.db.get(args.chatId);
    
    if (!chat) throw new Error("Chat not found");
    if (!chat.members.includes(user._id)) throw new Error("Not a member of this chat");

    // Single query to get all message stats
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat_and_messageTime", (q) => q.eq("chatId", args.chatId))
      .collect();

    const messageCount = messages.length;
    const mediaCount = messages.filter(msg => msg.media && msg.media.length > 0).length;
    const memberCount = chat.members.length;
    const userUnreadCount = chat.unreadCounts?.find(
      count => count.userId === user._id
    )?.count ?? 0;

    return {
      messageCount,
      mediaCount,
      memberCount,
      userUnreadCount,
      isGroup: chat.isGroup,
      createdAt: chat.groupCreatedAt,
      lastMessageTime: chat.lastMessageTime,
    };
  },
});

export const getChatHistory = query({
  args: {
    chatId: v.id("chats"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const chat = await ctx.db.get(args.chatId);
    
    if (!chat) throw new Error("Chat not found");
    if (!chat.members.includes(user._id)) throw new Error("Not a member of this chat");

    const limit = args.limit ?? 50;
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat_and_messageTime", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .take(limit + 1);

    const hasMore = messages.length > limit;
    const nextCursor = hasMore ? messages[messages.length - 1]._id.toString() : undefined;
    const messagesToReturn = hasMore ? messages.slice(0, -1) : messages;

    return {
      messages: messagesToReturn,
      nextCursor,
      hasMore,
    };
  },
});

export const searchChatMessages = query({
  args: {
    chatId: v.id("chats"),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const chat = await ctx.db.get(args.chatId);
    
    if (!chat) throw new Error("Chat not found");
    if (!chat.members.includes(user._id)) throw new Error("Not a member of this chat");

    const limit = args.limit ?? 50;
    const searchQuery = args.query.toLowerCase();

    // Use pagination to limit the number of messages we need to search through
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat_and_messageTime", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .take(limit * 2) // Fetch more than needed to account for filtered results
      .then(msgs => 
        msgs.filter(msg => 
          msg.message.toLowerCase().includes(searchQuery)
        ).slice(0, limit)
      );

    return messages;
  },
});

export const getChatMedia = query({
  args: {
    chatId: v.id("chats"),
    type: v.optional(v.union(
      v.literal("image"),
      v.literal("video"),
      v.literal("audio"),
      v.literal("file")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const chat = await ctx.db.get(args.chatId);
    
    if (!chat) throw new Error("Chat not found");
    if (!chat.members.includes(user._id)) throw new Error("Not a member of this chat");

    const limit = args.limit ?? 50;

    // Use pagination and filter in memory for better performance
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat_and_messageTime", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .take(limit * 2) // Fetch more than needed to account for filtered results
      .then(msgs => {
        const mediaMessages = msgs.filter(msg => 
          msg.media && msg.media.some(m => 
            !args.type || m.type === args.type
          )
        );
        return mediaMessages.slice(0, limit);
      });

    return messages;
  },
});

export const getChatLinks = query({
  args: {
    chatId: v.id("chats"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const chat = await ctx.db.get(args.chatId);
    
    if (!chat) throw new Error("Chat not found");
    if (!chat.members.includes(user._id)) throw new Error("Not a member of this chat");

    const limit = args.limit ?? 50;

    // Use pagination and filter in memory for better performance
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat_and_messageTime", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .take(limit * 2) // Fetch more than needed to account for filtered results
      .then(msgs => {
        const linkMessages = msgs.filter(msg => 
          msg.messageType === "link" || 
          (msg.message && msg.message.match(/https?:\/\/[^\s]+/))
        );
        return linkMessages.slice(0, limit);
      });

    return messages;
  },
});

export const updateGroupSettings = mutation({
  args: {
    chatId: v.id("chats"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    isPrivate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const chat = await ctx.db.get(args.chatId);
    
    if (!chat) throw new Error("Chat not found");
    if (!chat.isGroup) throw new Error("Not a group chat");
    if (chat.groupCreatedBy !== user._id && !chat.groupAdmins?.includes(user._id)) {
      throw new Error("Not authorized to update group settings");
    }

    await ctx.db.patch(args.chatId, {
      name: args.name,
      groupDescription: args.description,
      groupImage: args.imageUrl,
      isPrivate: args.isPrivate,
      groupUpdatedAt: Date.now(),
    });

    return args.chatId;
  },
});

export const addGroupAdmin = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const chat = await ctx.db.get(args.chatId);
    
    if (!chat) throw new Error("Chat not found");
    if (!chat.isGroup) throw new Error("Not a group chat");
    if (chat.groupCreatedBy !== user._id) throw new Error("Only group creator can add admins");
    if (!chat.members.includes(args.userId)) throw new Error("User is not a member of the group");

    const currentAdmins = chat.groupAdmins ?? [];
    if (currentAdmins.includes(args.userId)) {
      throw new Error("User is already an admin");
    }

    await ctx.db.patch(args.chatId, {
      groupAdmins: [...currentAdmins, args.userId],
      groupUpdatedAt: Date.now(),
    });

    return args.chatId;
  },
});

export const removeGroupAdmin = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const chat = await ctx.db.get(args.chatId);
    
    if (!chat) throw new Error("Chat not found");
    if (!chat.isGroup) throw new Error("Not a group chat");
    if (chat.groupCreatedBy !== user._id) throw new Error("Only group creator can remove admins");
    if (args.userId === chat.groupCreatedBy) throw new Error("Cannot remove group creator from admins");

    const currentAdmins = chat.groupAdmins ?? [];
    if (!currentAdmins.includes(args.userId)) {
      throw new Error("User is not an admin");
    }

    await ctx.db.patch(args.chatId, {
      groupAdmins: currentAdmins.filter(id => id !== args.userId),
      groupUpdatedAt: Date.now(),
    });

    return args.chatId;
  },
});

export const getGroupInfo = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const chat = await ctx.db.get(args.chatId);
    
    if (!chat) throw new Error("Chat not found");
    if (!chat.isGroup) throw new Error("Not a group chat");
    if (!chat.members.includes(user._id)) throw new Error("Not a member of this group");

    // Get admin information
    const admins = await Promise.all(
      (chat.groupAdmins ?? []).map(async (adminId) => {
        const admin = await ctx.db.get(adminId);
        return {
          ...admin,
          isCreator: adminId === chat.groupCreatedBy,
        };
      })
    );

    // Get member information
    const members = await Promise.all(
      chat.members.map(async (memberId) => {
        const member = await ctx.db.get(memberId);
        return {
          ...member,
          isAdmin: chat.groupAdmins?.includes(memberId) ?? false,
          isCreator: memberId === chat.groupCreatedBy,
        };
      })
    );

    return {
      ...chat,
      admins,
      members,
    };
  },
});

export const archiveGroup = mutation({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const chat = await ctx.db.get(args.chatId);
    
    if (!chat) throw new Error("Chat not found");
    if (!chat.isGroup) throw new Error("Not a group chat");
    if (!chat.members.includes(user._id)) throw new Error("Not a member of this group");

    // Only creator and admins can archive the group
    if (chat.groupCreatedBy !== user._id && !chat.groupAdmins?.includes(user._id)) {
      throw new Error("Not authorized to archive group");
    }

    await ctx.db.patch(args.chatId, {
      isArchived: true,
      groupUpdatedAt: Date.now(),
    });

    return args.chatId;
  },
});

export const unarchiveGroup = mutation({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const chat = await ctx.db.get(args.chatId);
    
    if (!chat) throw new Error("Chat not found");
    if (!chat.isGroup) throw new Error("Not a group chat");
    if (!chat.members.includes(user._id)) throw new Error("Not a member of this group");

    // Only creator and admins can unarchive the group
    if (chat.groupCreatedBy !== user._id && !chat.groupAdmins?.includes(user._id)) {
      throw new Error("Not authorized to unarchive group");
    }

    await ctx.db.patch(args.chatId, {
      isArchived: false,
      groupUpdatedAt: Date.now(),
    });

    return args.chatId;
  },
});

export const updateLastMessage = mutation({
  args: {
    chatId: v.id("chats"),
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");

    const sender = await ctx.db.get(message.senderId);
    if (!sender) throw new Error("Sender not found");

    await ctx.db.patch(args.chatId, {
      lastMessage: message.message,
      lastMessageSender: sender.name,
      lastMessageTime: message.messageTime,
      lastMessageType: message.messageType,
      lastMessageStatus: message.isSeen ? "read" : message.isDelivered ? "delivered" : "sent",
    });

    return args.chatId;
  },
}); 