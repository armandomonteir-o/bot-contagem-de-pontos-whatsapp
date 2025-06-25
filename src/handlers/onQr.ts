import { Client } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

export function initializeQrHandler(client: Client) {
  client.on("qr", (qr: string) => {
    console.log(
      " [Handler: QR CODE] QR Code foi recebido, escaneie com o celular"
    );
    qrcode.generate(qr, { small: true });
  });
}
