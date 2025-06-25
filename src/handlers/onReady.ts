import { Client } from "whatsapp-web.js";
import cron from "node-cron";
import { runMonthlyReset } from "../tasks/monthlyReset.js";
import { readScore } from "../utils/scoreManager.js";

export function initializeReadyHandler(client: Client): void {
  client.on("ready", () => {
    console.log(`[Handler: Ready] O bot está pronto e conectado!`);

    const groupId = process.env.GROUP_ID;
    if (!groupId) {
      console.error("[AGENDADOR] ERRO FATAL: GROUP_ID não definido no .env");
      return;
    }

    cron.schedule(
      "13 14 * * *",
      async () => {
        try {
          console.log(`[CRON] Enviando placar diário...`);
          const groupChat = await client.getChatById(groupId);
          const placar = await readScore();

          let response = "☀️ *Bom dia! Confira o placar da competição:* ☀️\n\n";

          const sortedUsers = Object.values(placar).sort(
            (a, b) =>
              b.reading.points +
              b.running.points -
              (a.reading.points + a.running.points)
          );

          if (sortedUsers.length === 0) {
            response +=
              "O placar ainda está zerado! Quem vai marcar o primeiro ponto hoje? Use `!euli` ou `!eucorri`!";
          } else {
            sortedUsers.forEach((user, index) => {
              const total = user.reading.points + user.running.points;
              response += `${index + 1}º - *${
                user.name
              }* - ${total} ponto(s)\n`;
              response += `   (📚 leitura: ${user.reading.points} | 🏃‍♂️ corrida: ${user.running.points})\n\n`;
            });
          }
          response += "Que vença o melhor";

          await groupChat.sendMessage(response);
        } catch (error) {
          console.error("[CRON] Falha ao enviar placar diário:", error);
        }
      },
      { timezone: "America/Sao_Paulo" }
    );

    cron.schedule(
      "50 23 L * *",
      async () => {
        try {
          await runMonthlyReset(client);
        } catch (error) {
          console.error(
            "[CRON - MENSAL] Falha ao executar o reset mensal:",
            error
          );
        }
      },
      { timezone: "America/Sao_Paulo" }
    );

    cron.schedule(
      "0 9 * * *",
      async () => {
        try {
          console.log("[CRON] Enviando lembrete diário de registro...");

          const reminderMessage = `
LEMBRETE DO DIA:

Você já registrou sua atividade de ONTEM? 🤔

Se você leu ou correu ontem, não se esqueça de pontuar.

Para registrar, use os comandos:
*!euli* - para marcar seu ponto de leitura 📚
*!eucorri* - para marcar seu ponto de corrida 🏃‍♂️

Pra cima deles
          `;

          const groupChat = await client.getChatById(groupId);

          await groupChat.sendMessage(reminderMessage.trim());

          console.log("[CRON] Lembrete diário enviado com sucesso!");
        } catch (error) {
          console.error("[CRON] Falha ao enviar lembrete diário:", error);
        }
      },
      { timezone: "America/Sao_Paulo" }
    );
  });
}
