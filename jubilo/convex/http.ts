import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal, api } from "./_generated/api";

const handleClerkWebhook = httpAction(async (ctx, request) => {
  const event = await request.json();
  console.log("📩 Clerk webhook received:", event);

  if (!event?.type || !event.data) {
    return new Response("Invalid webhook payload", { status: 400 });
  }

  switch (event.type) {
    case "user.created": {
      const user = event.data;
      try {
        await ctx.runMutation(internal.auth.createUser, {
          clerkId: user.id,
          email: user.email_addresses[0].email_address,
          phoneNumber: user.phone_numbers?.[0]?.phone_number ?? "",
          imageUrl: user.image_url,
          username: user.username ?? user.id,
          firstname: user.first_name ?? "",
          lastname: user.last_name ?? "",
          dateOfBirth: undefined,
        });
        console.log("✅ User created/updated in Convex");
      } catch (err) {
        console.error("❌ Failed to create/update user:", err);
        return new Response("Error creating user", { status: 500 });
      }
      break;
    }

    case "user.updated": {
      const user = event.data;
      try {
        const existing = await ctx.runQuery(api.auth.getUserByClerkId, {
          clerkId: user.id,
        });

        if (!existing) {
          console.log("User not found, creating new user");
          await ctx.runMutation(internal.auth.createUser, {
            clerkId: user.id,
            email: user.email_addresses[0].email_address,
            phoneNumber: user.phone_numbers?.[0]?.phone_number ?? "",
            imageUrl: user.image_url,
            username: user.username ?? user.id,
            firstname: user.first_name ?? "",
            lastname: user.last_name ?? "",
            dateOfBirth: undefined,
          });
        } else {
          console.log("Updating existing user");
          await ctx.runMutation(internal.auth.updateUser, {
            userId: existing._id,
            fields: {
              email: user.email_addresses[0].email_address,
              phoneNumber: user.phone_numbers?.[0]?.phone_number ?? "",
              imageUrl: user.image_url,
              username: user.username ?? user.id,
              firstname: user.first_name ?? "",
              lastname: user.last_name ?? "",
              updatedAt: Date.now(),
            },
          });
        }
        console.log("✅ User updated in Convex");
      } catch (err) {
        console.error("❌ Failed to update user:", err);
        return new Response("Error updating user", { status: 500 });
      }
      break;
    }

    case "user.deleted": {
      const clerkId = event.data.id;
      const existing = await ctx.runQuery(api.auth.getUserByClerkId, {
        clerkId,
      });

      if (existing?._id) {
        try {
          await ctx.runMutation(internal.auth.deleteUser, {
            userId: existing._id,
          });
          console.log("✅ User deleted from Convex");
        } catch (err) {
          console.error("❌ Failed to delete user:", err);
          return new Response("Error deleting user", { status: 500 });
        }
      } else {
        console.log("ℹ️ User not found in Convex, nothing to delete");
      }
      break;
    }

    default:
      console.log("ℹ️ Ignored event:", event.type);
      break;
  }

  return new Response("OK", { status: 200 });
});

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: handleClerkWebhook,
});

export default http;