import wweb from "whatsapp-web.js";
import { Client, Message } from "whatsapp-web.js";
import { readScore, saveScore } from "../utils/scoreManager";
import { getCustomName } from "../utils/nameManager";

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
                b.leitura.points +
                b.corrida.points -
                (a.leitura.points + a.corrida.points)
            );

            if (sortedUsers.length === 0) {
              response += "O placar ainda está zerado!";
            } else {
              // Este código JÁ FUNCIONARÁ, pois `user.name` agora terá o nome customizado
              // que foi salvo pelo comando !euli ou !eucorri.
              sortedUsers.forEach((user, index) => {
                const total = user.leitura.points + user.corrida.points;
                response += `${index + 1}º - *${
                  user.name
                }* - ${total} ponto(s)\n`;
                response += `   (📚 Leitura: ${user.leitura.points} | 🏃‍♂️ Corrida: ${user.corrida.points})\n\n`;
              });
            }
            await msg.reply(response);
          } catch (error) {
            /* ... */
          }
          break;

        case "euli":
        case "eucorri": // Ambos os comandos usarão uma lógica parecida
          try {
            const contact = await msg.getContact();
            const rawUserId = contact.id._serialized;
            const userId = rawUserId.includes(":")
              ? rawUserId.split(":")[0] + "@c.us"
              : rawUserId;
            const userName = getCustomName(userId);

            const placar = await readScore();
            const today = new Date().toISOString().slice(0, 10);

            // Define qual atividade estamos atualizando
            const activity = command === "euli" ? "leitura" : "corrida";
            const activityEmoji = command === "euli" ? "📚" : "🏃‍♂️";

            if (!placar[userId]) {
              placar[userId] = {
                name: userName,
                leitura: { points: 0, lastDate: "" },
                corrida: { points: 0, lastDate: "" },
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
              `${activityEmoji} Ponto de ${activity} registrado para *${userName}*!\nTotal de ${activity}: ${placar[userId][activity].points} pontos.`
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
