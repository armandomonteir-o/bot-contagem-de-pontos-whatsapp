import wweb from "whatsapp-web.js";
const { Client, LocalAuth } = wweb;

const bot = new Client({
  authStrategy: new LocalAuth({
    dataPath: ".session",
  }),
});

export default bot;
