import { Command, Message, MessageAttachment } from "discord.js";
import { IncomingMessage } from "http";
import https from "https";
import { parse } from "yaml";
import {
  ERROR_COULD_NOT_DL_FILE,
  ERROR_DB_CONN,
  REPLY_ATTACH_YAML,
} from "../../constants/messages";
import DBHelper from "../../db/DBHelper";
import { logger } from "../../global/globals";

export = <Command>{
  name: "importhorn",
  aliases: ["imph"],
  description: `Import horns from attached yaml file.\nAliases with the same name will be overwritten. \nDuplicate URLs won't rename alias.

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

    const fileURL = attachment?.url;
    if (fileURL?.endsWith(".yaml") || fileURL?.endsWith(".yml")) {
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

          let importedHornCount = 0;
          const regexUrl = new RegExp(
            `(http(s)?:\\/\\/.)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&\\/\\/=]*)`
          );
          const updateObj: object = {};
          horns.forEach((horn) => {
            regexUrl.lastIndex = 0;
            if (
              typeof horn[0] === "string" &&
              horn[0].length <= 25 &&
              horn[0].toLowerCase() != "reset" &&
              typeof horn[1] === "string" &&
              regexUrl.test(horn[1])
            ) {
              Object.defineProperty(updateObj, `audioAliases.${horn[0]}`, {
                value: horn[1],
                enumerable: true,
              });
              importedHornCount++;
            }
          });

          try {
            await DBHelper.saveGuildSettings(message.guild, {
              $set: updateObj,
            });
            message.react("✅");
            logger.info(
              `${importedHornCount} horns imported. @${message.guild.name}<${message.guild.id}>`
            );
          } catch (error) {
            logger.error(error);
            message.reply(ERROR_DB_CONN.toBold());
          }
        });
      });

      req.on("error", (error) => {
        logger.error(error);
        message.reply(ERROR_COULD_NOT_DL_FILE.toBold());
      });
    } else {
      message.reply(REPLY_ATTACH_YAML.toBold());
    }
  },
};
