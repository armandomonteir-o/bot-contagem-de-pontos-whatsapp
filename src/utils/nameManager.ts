import fs from "fs/promises";
import path from "path";

const namesFilePath = path.join(process.cwd(), "data", "names.json");

let nameMap: { [userId: string]: string } = {};

async function loadNames() {
  try {
    const fileContent = await fs.readFile(namesFilePath, { encoding: "utf-8" });
    nameMap = JSON.parse(fileContent);
    console.log("[Name Manager] Nomes carregados.");
  } catch (error) {
    console.error(
      "[Name Manager] Falha ao carregar nomes customizados:",
      error
    );
    nameMap = {};
  }
}

loadNames();

function normalizeId(userId: string): string {
  if (userId.includes(":")) {
    return userId.split(":")[0] + "@c.us";
  }
  return userId;
}

export function getCustomName(userId: string): string {
  const normalized = normalizeId(userId);
  return nameMap[normalized] || normalized;
}
