import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";

export function useProfile() {
  const { user } = useUser();

  const clerkId = user?.id;

  if (!clerkId) {
    return null;
  }

  return useQuery(api.users.getUserByClerkId, { clerkId });
}
