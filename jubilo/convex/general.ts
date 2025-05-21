import { Id } from "./_generated/dataModel";
import { QueryCtx } from "./_generated/server";

export const getMediaUrl = async (ctx: QueryCtx, url: string) => {
  if (!url || !url.startsWith("http")) {
    return url;
  }

  const newUrl = await ctx.storage.getUrl(url as Id<"_storage">);
  return newUrl;
};
