import { supabase } from "@/lib/supabase";
import { inviteUserToPrivateEvent } from "@/services/events";
import { getFollowers } from "@/services/followService";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import EventInviteUserList from "./EventInviteUserList";

export default function EventInviteStep({ eventId, inviterId, isPrivate }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invitedUserIds, setInvitedUserIds] = useState([]);

  useEffect(() => {
    if (!isPrivate) return;
    setLoading(true);
    getFollowers(inviterId).then(async (res) => {
      if (res.data && res.data.length > 0) {
        const followerIds = res.data.map((f) => f.follower_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, image_url, first_name, last_name")
          .in("id", followerIds);
        const { data: invitations } = await supabase
          .from("event_invitations")
          .select("user_id, status")
          .eq("event_id", eventId);
        const invitedIds = (invitations || [])
          .filter((inv) => inv.status === "pending")
          .map((inv) => inv.user_id);
        setInvitedUserIds(invitedIds);
        setUsers(profiles || []);
      } else {
        setUsers([]);
        setInvitedUserIds([]);
      }
      setLoading(false);
    });
  }, [inviterId, isPrivate, eventId]);

  const handleInvite = async (user) => {
    try {
      await inviteUserToPrivateEvent({
        eventId,
        inviteeId: user.id,
        inviterId,
      });
      setInvitedUserIds((ids) => [...ids, user.id]);
    } catch (e) {
      console.error("Error inviting user:", e);
    }
  };

  if (!isPrivate) return null;
  if (loading) return <ActivityIndicator />;
  return (
    <View>
      <Text
        style={{
          color: "#fff",
          fontWeight: "bold",
          fontSize: 18,
          marginBottom: 10,
        }}
      >
        Invite Users
      </Text>
      <EventInviteUserList
        users={users}
        onInvite={handleInvite}
        invitedUserIds={invitedUserIds}
      />
    </View>
  );
}
