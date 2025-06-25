import "dotenv/config";
import bot from "./client/client.js";
import { initializeReadyHandler } from "./handlers/onReady.js";
import { initializeQrHandler } from "./handlers/onQr.js";
import { initializeMessageHandler } from "./handlers/onMessage.js";

console.log("[INDEX] Os handlers do bot estão sendo configurados...");
initializeReadyHandler(bot);
initializeQrHandler(bot);
initializeMessageHandler(bot);

console.log("[INDEX] Inicializando o bot...");
bot.initialize();

console.log(
  "[INDEX] O bot está em processo de inicialização. Aguardando eventos..."
);
