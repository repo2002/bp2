export const GROUP_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEEAD",
  "#D4A5A5",
  "#9B59B6",
  "#3498DB",
  "#E67E22",
  "#2ECC71",
  "#E74C3C",
  "#1ABC9C",
  "#F1C40F",
  "#34495E",
  "#16A085",
  "#D35400",
  "#2980B9",
  "#8E44AD",
  "#27AE60",
  "#C0392B",
  "#F39C12",
  "#7F8C8D",
  "#BDC3C7",
  "#2C3E50",
  "#95A5A6",
];

// Utility to get a color for a user ID
export function getGroupMemberColor(userId) {
  const index =
    userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    GROUP_COLORS.length;
  return GROUP_COLORS[index];
}
