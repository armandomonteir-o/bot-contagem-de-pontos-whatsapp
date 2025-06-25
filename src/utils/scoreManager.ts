import fs from "fs/promises";
import path from "path";

const scoreFilePath = path.join(process.cwd(), "placar.json");

type UserScore = {
  name: string;
  leitura: {
    points: number;
    lastDate: string;
  };
  corrida: {
    points: number;
    lastDate: string;
  };
};

export type ScoreData = {
  [userId: string]: UserScore;
};

export async function readScore(): Promise<ScoreData> {
  try {
    const fileContent = await fs.readFile(scoreFilePath, { encoding: "utf-8" });
    return JSON.parse(fileContent);
  } catch (error) {
    console.log(
      "[Score Manager] Arquivo de placar não encontrado, criando um novo."
    );
    return {};
  }
}

export async function saveScore(data: ScoreData): Promise<void> {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(scoreFilePath, jsonString, { encoding: "utf-8" });
    console.log("[Score Manager] Placar salvo com sucesso!");
  } catch (error) {
    console.error("[Score Manager] Erro ao salvar o placar:", error);
  }
}
