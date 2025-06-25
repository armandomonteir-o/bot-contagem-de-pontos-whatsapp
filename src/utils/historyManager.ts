import fs from "fs/promises";
import path from "path";

const historyFilePath = path.join(process.cwd(), "data", "history.json");

export type Winner = {
  name: string;
  points: number;
};

export type HistoryData = {
  // chave será ano-mes (ex: "2025-06")
  [month: string]: {
    reading?: Winner;
    running?: Winner; // uso do ? pois poderá ocorrer um empate
  };
};

export async function readHistory(): Promise<HistoryData> {
  try {
    const fileContent = await fs.readFile(historyFilePath, {
      encoding: "utf-8",
    });
    return JSON.parse(fileContent);
  } catch (error) {
    console.log(
      "[History Manager] Arquivo de histórico não encontrado, criando um novo."
    );
    return {};
  }
}

export async function saveHistory(data: HistoryData): Promise<void> {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(historyFilePath, jsonString, { encoding: "utf-8" });
    console.log("[History Manager] Histórico salvo com sucesso!");
  } catch (error) {
    console.error("[History Manager] Erro ao salvar o histórico:", error);
  }
}
