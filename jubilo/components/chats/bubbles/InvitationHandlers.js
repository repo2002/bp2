import { supabase } from "@/lib/supabase";

export async function handleAccept(invitationId, eventId, userId) {
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

export function handleDecline(invitationId) {
  return supabase
    .from("event_invitations")
    .update({ status: "rejected" })
    .eq("id", invitationId);
}
