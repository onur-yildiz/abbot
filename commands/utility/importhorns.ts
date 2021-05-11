import { Command, Message, MessageAttachment } from "discord.js";
import { IncomingMessage } from "http";
import https from "https";
import { parse } from "yaml";
import { ERROR_EXECUTION_ERROR } from "../../constants/messages";
import DBHelper from "../../db/DBHelper";
import { logger } from "../../global/globals";

export = <Command>{
  name: "importhorn",
  aliases: ["imph"],
  description: "Import horns from attached yaml file.",
  usage: "",
  permissions: "MOVE_MEMBERS",
  args: Args.none,
  isGuildOnly: true,
  cooldown: 5,
  async execute(message: Message) {
    const attachment: MessageAttachment = message.attachments
      .values()
      .next().value;

    const fileURL = attachment.attachment.toString();
    if (fileURL.endsWith(".yaml") || fileURL.endsWith(".yml")) {
      const req = https.get(fileURL);
      req.on("response", (res: IncomingMessage) => {
        if (res.statusCode != 200) return;
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", async () => {
          const parsedData: object = parse(data);
          const horns: [string, string][] = Object.entries(parsedData);
          for (const horn of horns) {
            await DBHelper.saveGuildSettings(message.guild, {
              $set: { [`audioAliases.${horn[0]}`]: horn[1] },
            });
          }
          logger.info(
            `${horns.length} horns imported. @${message.guild.name}<${message.guild.id}>`
          );
        });
      });

      req.on("error", (error) => {
        logger.error(error);
        message.reply(ERROR_EXECUTION_ERROR);
      });
    }
  },
};
