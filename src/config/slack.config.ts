import { IncomingWebhook } from "@slack/webhook";
import { env } from "./env.config";
import logger from "../utils/logger.util";

const webhook = new IncomingWebhook(env.slack_webhook);

export const loggerStream: { write: (message: string) => boolean } = {
  write: (message: string) => {
    webhook
      .send({ text: message })
      .catch((error) =>
        logger.error(`Error al enviar mensaje a Slack: ${error}`)
      );
    return true; // Retorna true para cumplir con el tipo requerido.
  },
};
