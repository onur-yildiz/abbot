import { Command, Message, MessageAttachment } from "discord.js";
import { IncomingMessage } from "http";
import https from "https";
import { UpdateQuery } from "mongoose";
import { parse } from "yaml";
import { ERROR_EXECUTION_ERROR } from "../../constants/messages";
import DBHelper from "../../db/DBHelper";
import { IGuildSettings } from "../../db/DBModels";
import { logger } from "../../global/globals";

export = <Command>{
  name: "importhorn",
  aliases: ["imph"],
  description: `Import horns from attached yaml file. (Aliases with the same name will be overwritten!)

  ---Example YAML format---
  example: https://www.example.com/media/sounds/media.mp3
  abc: https://www.example.com/some_sound.ogg
  newsound: https://www.example.com/media.mp3
  myhorn: https://www.example.com/media/sounds/horn.ogg
  ---END---`,
  usage:
    "(Attach your .yaml file to the message and add the command as comment)",
  permissions: "MOVE_MEMBERS",
  args: Args.none,
  isGuildOnly: true,
  cooldown: 5,
  execute(message: Message) {
    const attachment: MessageAttachment = message.attachments
      .values()
      .next().value;

    const fileURL = attachment.attachment.toString();
    if (fileURL.endsWith(".yaml") || fileURL.endsWith(".yml")) {
      const req = https.get(fileURL);
      req.on("response", (res: IncomingMessage) => {
        message.react("⏱");
        if (res.statusCode != 200) return;
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", async () => {
          const parsedData: object = parse(data);
          const horns: [string, string][] = Object.entries(parsedData);
          const updateQuery: UpdateQuery<IGuildSettings> = {
            $set: { audioAliases: new Map<string, string>() },
          };
          let importedHornCount = 0;
          horns.forEach((horn) => {
            if (typeof horn[0] === "string" && typeof horn[1] === "string") {
              updateQuery.$set.audioAliases.set(horn[0], horn[1]);
              importedHornCount++;
            }
          });

          try {
            await DBHelper.saveGuildSettings(message.guild, updateQuery);
          } catch (error) {
            logger.error(error);
          }

          message.react("✅");
          logger.info(
            `${importedHornCount} horns imported. @${message.guild.name}<${message.guild.id}>`
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
