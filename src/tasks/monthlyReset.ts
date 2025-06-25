import { Client } from "whatsapp-web.js";
import { readScore, saveScore, ScoreData } from "../utils/scoreManager";
import { readHistory, saveHistory, Winner } from "../utils/historyManager";

function findWinner(
  scoreData: ScoreData,
  category: "reading" | "running"
): Winner | null {
  let winner: Winner | null = null;
  let maxPoints = 0;

  for (const userId in scoreData) {
    const user = scoreData[userId];
    const userPoints = user[category].points;

    if (userPoints > maxPoints) {
      maxPoints = userPoints;
      winner = { name: user.name, points: userPoints };
    } else if (userPoints === maxPoints && winner) {
      winner.name += ` & ${user.name}`;
    }
  }

  return maxPoints > 0 ? winner : null;
}

export async function runMonthlyReset(client: Client): Promise<void> {
  console.log("[RESET MENSAL] Iniciando processo de final de mês...");

  const groupId = process.env.GROUP_ID;
  if (!groupId) {
    console.error("[RESET MENSAL] GROUP_ID não definido!");
    return;
  }

  const currentScores = await readScore();
  if (Object.keys(currentScores).length === 0) {
    console.log(
      "[RESET MENSAL] Placar vazio. Nenhum vencedor a ser declarado."
    );
    return;
  }

  const readingWinner = findWinner(currentScores, "reading");
  const runningWinner = findWinner(currentScores, "running");

  let announcement = "🏆🎉 *Mês finalizado! Vencedores:!* 🎉🏆\n\n";
  announcement += "O placar foi resetado para um novo mês de competição!\n\n";
  announcement += "Parabéns aos grandes vencedores:\n\n";

  if (readingWinner) {
    announcement += `📚 *Campeão de leitura:* ${readingWinner.name} com ${readingWinner.points} pontos!\n`;
  } else {
    announcement += "📚 *Campeão de leitura:* Ninguém pontuou este mês!\n";
  }

  if (runningWinner) {
    announcement += `🏃‍♂️ *Campeão de corrida:* ${runningWinner.name} com ${runningWinner.points} pontos!\n`;
  } else {
    announcement += "🏃‍♂️ *Campeão de corrida:* Ninguém pontuou este mês!\n";
  }
  announcement += "\nPreparem-se para o próximo mês! A disputa recomeça agora!";

  const history = await readHistory();
  const currentMonthKey = new Date().toISOString().slice(0, 7); // Formato "AAAA-MM"
  history[currentMonthKey] = {
    reading: readingWinner ?? undefined,
    running: runningWinner ?? undefined,
  };
  await saveHistory(history);

  const resetScores = currentScores;
  for (const userId in resetScores) {
    resetScores[userId].reading.points = 0;
    resetScores[userId].running.points = 0;
  }
  await saveScore(resetScores);
  console.log("[RESET MENSAL] Placar resetado com sucesso.");

  const groupChat = await client.getChatById(groupId);
  await groupChat.sendMessage(announcement);
  console.log("[RESET MENSAL] Mensagem de vencedores enviada.");
}
