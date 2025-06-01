import { supabase } from "@/lib/supabase";
import React, { createContext, useContext, useEffect, useState } from "react";

const PrivacyContext = createContext();

export const PrivacyProvider = ({ children }) => {
  const [isPrivate, setIsPrivate] = useState(null);
  const [userId, setUserId] = useState(null);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [followerIds, setFollowerIds] = useState(new Set());

  const fetchPrivacyData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setUserId(user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_private")
      .eq("id", user.id)
      .single();

    setIsPrivate(profile?.is_private ?? false);

    const { data: follows } = await supabase
      .from("followers")
      .select("follower_id, following_id, status")
      .or(`follower_id.eq.${user.id},following_id.eq.${user.id}`)
      .eq("status", "accepted");

    setFollowerIds(
      new Set(
        follows
          ?.filter((f) => f.following_id === user.id)
          .map((f) => f.follower_id)
      )
    );
    setFollowingIds(
      new Set(
        follows
          ?.filter((f) => f.follower_id === user.id)
          .map((f) => f.following_id)
      )
    );
  };

  useEffect(() => {
    fetchPrivacyData();
  }, []);

  const isMutualFollow = (targetId) =>
    followerIds.has(targetId) && followingIds.has(targetId);

  const canMessage = (targetId) => isMutualFollow(targetId);
  const canViewPost = (authorId, isPostPrivate) =>
    !isPostPrivate || isMutualFollow(authorId);

  return (
    <PrivacyContext.Provider
      value={{
        userId,
        isPrivate,
        followerIds,
        followingIds,
        isMutualFollow,
        canMessage,
        canViewPost,
        refresh: fetchPrivacyData,
      }}
    >
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = () => useContext(PrivacyContext);
