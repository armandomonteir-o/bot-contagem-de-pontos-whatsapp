function normalizeId(userId: string): string {
  if (userId.includes(":")) {
    return userId.split(":")[0] + "@c.us";
  }
  return userId;
}

const nameMap: { [userId: string]: string } = {
  "5524999565630@c.us": "Armando",
  "5524998416823@c.us": "Jampa",
};

export function getCustomName(userId: string): string {
  const normalized = normalizeId(userId);
  return nameMap[normalized] || normalized;
}
