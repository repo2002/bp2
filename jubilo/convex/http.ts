import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

// define the webhook handler
const handleClerkWebhook = httpAction(async (ctx, request) => {
  const event = await request.json();
  console.log("Clerk webhook received", event);
  if (!event) {
    return new Response("Error occurred", { status: 400 });
  }

  switch (event.type) {
    case "user.created": {
      const user = event.data;
      await ctx.runMutation(internal.users.createUser, {
        clerkId: user.id,
        email: user.email_addresses[0].email_address,
        phoneNumber: user.phone_numbers[0]?.phone_number ?? "",
        imageUrl: user.image_url,
        username: user.username ?? user.id,
        firstname: user.first_name ?? "",
        lastname: user.last_name ?? "",
        dateOfBirth: undefined,
      });
      break;
    }
    case "user.updated": {
      const user = event.data;
      await ctx.runMutation(internal.users.updateUser, {
        userId: user.id,
        fields: {
          email: user.email_addresses[0].email_address,
          phoneNumber: user.phone_numbers[0]?.phone_number ?? "",
          imageUrl: user.image_url,
          username: user.username ?? user.id,
          firstname: user.first_name ?? "",
          lastname: user.last_name ?? "",
          updatedAt: Date.now(),
        },
      });
      break;
    }
    case "user.deleted":
      await ctx.runMutation(internal.users.deleteUser, {
        userId: event.data.id,
      });
      break;
    default:
      console.log("Ignored Clerk webhook event:", event.type);
      break;
  }

  return new Response(null, { status: 200 });
});

// define the http router
const http = httpRouter();

// define the webhook route
http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: handleClerkWebhook,
});

export default http;
