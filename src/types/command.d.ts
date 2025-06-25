import { Client, Message } from "whatsapp-web.js";

// future feature

export interface ICommand {
  name: string;
  description: string;
  execute: (client: Client, msg: Message, args: string[]) => Promise<void>;
}
