import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./auth";
import { Id } from "./_generated/dataModel";

export const send = mutation({
  args: {
    chatId: v.id("chats"),
    message: v.string(),
    messageType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("video"),
      v.literal("audio"),
      v.literal("file"),
      v.literal("location"),
      v.literal("todo"),
      v.literal("link"),
      v.literal("internal"),
      v.literal("sticker"),
      v.literal("poll"),
      v.literal("contact"),
      v.literal("reaction"),
      v.literal("gif")
    ),
    media: v.optional(
      v.array(
        v.object({
          storageId: v.string(),
          type: v.string(),
          metadata: v.optional(v.any()),
        })
      )
    ),
    metadata: v.optional(v.any()),
    replyToId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const chat = await ctx.db.get(args.chatId);
    
    if (!chat) throw new Error("Chat not found");
    if (!chat.members.includes(user._id)) throw new Error("Not a member of this chat");

    const now = Date.now();
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      senderId: user._id,
      message: args.message,
      messageType: args.messageType,
      media: args.media,
      metadata: args.metadata,
      messageTime: now,
      messageId: `${now}_${user._id}`,
      replyToId: args.replyToId,
      isEdited: false,
      isDeleted: false,
      isPinned: false,
      isForwarded: false,
      isSeen: false,
      isDelivered: false,
      createdAt: now,
      updatedAt: now,
    });

    // Update chat's last message
    await ctx.db.patch(args.chatId, {
      lastMessage: args.message,
      lastMessageSender: user.name,
      lastMessageTime: now,
      lastMessageType: args.messageType,
      lastMessageStatus: "sent",
    });

    // Update unread counts for other members
    if (chat.unreadCounts) {
      const updatedCounts = chat.unreadCounts.map(count => {
        if (count.userId !== user._id) {
          return { ...count, count: count.count + 1 };
        }
        return count;
      });
      await ctx.db.patch(args.chatId, { unreadCounts: updatedCounts });
    }

    return messageId;
  },
}); 