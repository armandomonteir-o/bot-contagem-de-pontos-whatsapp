export const activityDetails = {
  reading: {
    name: "leitura",
    emoji: "📚",
  },
  running: {
    name: "corrida",
    emoji: "🏃‍♂️",
  },
};

export type ActivityType = keyof typeof activityDetails;
