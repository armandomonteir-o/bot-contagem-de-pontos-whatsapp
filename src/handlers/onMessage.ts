import wweb from "whatsapp-web.js";
import { Client, Message } from "whatsapp-web.js";
import { readScore, saveScore } from "../utils/scoreManager";
import { getCustomName } from "../utils/nameManager";
import { activityDetails, ActivityType } from "../utils/activityManager";

export function initializeMessageHandler(client: Client) {
  client.on("message_create", async (msg: Message) => {
    /*if (msg.fromMe) {
        return;
      }*/

    if (msg.body.startsWith("!")) {
      const fullCommand = msg.body.substring(1);
      const args = fullCommand.split(" ");
      const command = args.shift()?.toLowerCase();

      console.log(`[COMANDO] | Comando: ${command} | Args: ${args.join(", ")}`);

      switch (command) {
        case "placar":
          try {
            const placar = await readScore();
            let response = "*🏆 PLACAR GERAL DA COMPETIÇÃO 🏆*\n\n";

            const sortedUsers = Object.values(placar).sort(
              (a, b) =>
                b.reading.points +
                b.running.points -
                (a.reading.points + a.running.points)
            );

            if (sortedUsers.length === 0) {
              response += "O placar ainda está zerado!";
            } else {
              sortedUsers.forEach((user, index) => {
                const total = user.reading.points + user.running.points;
                response += `${index + 1}º - *${
                  user.name
                }* - ${total} ponto(s)\n`;
                response += `   (${activityDetails.reading.emoji} ${activityDetails.reading.name}: ${user.reading.points} | ${activityDetails.running.emoji} ${activityDetails.running.name}: ${user.running.points})\n\n`;
              });
            }
            await msg.reply(response);
          } catch (error) {}
          break;

        case "euli":
        case "eucorri":
          try {
            const contact = await msg.getContact();
            const rawUserId = contact.id._serialized;
            const userId = rawUserId.includes(":")
              ? rawUserId.split(":")[0] + "@c.us"
              : rawUserId;
            const userName = getCustomName(userId);

            const placar = await readScore();
            const today = new Date().toISOString().slice(0, 10);

            const activity: ActivityType =
              command === "euli" ? "reading" : "running";
            const presentation = activityDetails[activity];

            if (!placar[userId]) {
              placar[userId] = {
                name: userName,
                reading: { points: 0, lastDate: "" },
                running: { points: 0, lastDate: "" },
              };
            }

            placar[userId].name = userName;

            if (placar[userId][activity].lastDate === today) {
              await msg.reply(
                `✋ Calma, *${userName}*! Você já registrou seu ponto de ${activity} hoje.`
              );
              return;
            }

            placar[userId][activity].points += 1;
            placar[userId][activity].lastDate = today;

            await saveScore(placar);

            await msg.reply(
              `${presentation.emoji} Ponto de ${presentation.name} registrado...`
            );
          } catch (error) {
            console.error(`[ERRO NO COMANDO ${command}]`, error);
            await msg.reply("😥 Ocorreu um erro ao registrar seu ponto.");
          }
          break;

        default:
          break;
      }
    }
  });
}
