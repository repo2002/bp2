import { supabase } from "@/lib/supabase";
import InvitationCard from "./InvitationCard";

async function handleAccept(invitationId, eventId, userId) {
  try {
    // 1. Accept the invitation
    const { error: inviteError } = await supabase
      .from("event_invitations")
      .update({ status: "accepted" })
      .eq("id", invitationId);

    if (inviteError) throw inviteError;

    // 2. Insert into event_participants
    const { error: participantError } = await supabase
      .from("event_participants")
      .upsert({
        event_id: eventId,
        user_id: userId,
        status: "going",
      });

    if (participantError) throw participantError;

    // 3. Refresh event details to update UI
    const { data: event } = await supabase
      .from("events")
      .select("*, participants:event_participants(*)")
      .eq("id", eventId)
      .single();

    return event;
  } catch (error) {
    console.error("Error accepting invitation:", error);
    throw error;
  }
}

function handleDecline(invitationId) {
  return supabase
    .from("event_invitations")
    .update({ status: "rejected" })
    .eq("id", invitationId);
}

export default function ChatMessageRenderer({ message }) {
  if (message.type === "invitation") {
    try {
      const eventData = JSON.parse(message.content);
      return (
        <InvitationCard
          event={eventData}
          status={eventData.status || "pending"}
          onAccept={() =>
            handleAccept(
              eventData.invitation_id,
              eventData.eventId,
              eventData.user_id
            )
          }
          onDecline={() => handleDecline(eventData.invitation_id)}
        />
      );
    } catch (error) {
      console.error("Error parsing invitation content:", error);
      return null;
    }
  }
  return null;
}
