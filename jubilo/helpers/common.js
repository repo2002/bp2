import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export { SCREEN_HEIGHT, SCREEN_WIDTH };

const hp = (percentage) => (SCREEN_HEIGHT * percentage) / 100;
const wp = (percentage) => (SCREEN_WIDTH * percentage) / 100;

export { hp, wp };

// Returns a short version of HTML content, stripped of tags
function getShortContent(html, maxLen = 100) {
  const text = html.replace(/<[^>]*>/g, "").trim();
  return text.length > maxLen ? text.slice(0, maxLen) + "..." : text;
}

// Returns a human-readable time ago string
function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export { getShortContent, timeAgo };
