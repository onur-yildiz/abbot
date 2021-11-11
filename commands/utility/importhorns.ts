import { Command, Message, MessageAttachment } from "discord.js";
import { IncomingMessage } from "http";
import https from "https";
import { parse } from "yaml";
import {
  ERROR_COULD_NOT_DL_FILE,
  ERROR_DB_CONN,
  REPLY_ATTACH_YAML,
  ERROR_PARSE_YAML,
} from "../../constants/messages";
import DBHelper from "../../db/DBHelper";
import { logger } from "../../global/globals";
// import { isAudioOk } from "../../util/isAudioOk";

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
          let horns: [string, string][];
          try {
            const parsedData: object = parse(data);
            horns = Object.entries(parsedData);
          } catch (error) {
            logger.error(error.message);
            message.reply(ERROR_PARSE_YAML.toBold());
            return;
          }

          const audios = (await DBHelper.getGuildSettings(message.guild))
            .audioAliases;

          try {
            let importedHornCount = 0;
            const regexUrl = new RegExp(
              `(http(s)?:\\/\\/.)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&\\/\\/=]*).mp3`
            );
            const updateArray: AudioAlias[] = [];
            const conflictedArray: string[] = [];

            // filter out entries with duplicate URLs. Since YAML doesn't allow duplicate keys, we do not check for dup. names.
            let filteredHorns: [string, string][] = horns;
            for (const horn of horns) {
              if (!filteredHorns.includes(horn)) continue; // if already filtered out, skip
              filteredHorns = filteredHorns.filter(
                (hornVal) => !(hornVal[1] === horn[1] && hornVal[0] !== horn[0])
              );
            }

            for (const horn of filteredHorns) {
              regexUrl.lastIndex = 0;
              if (
                typeof horn[0] === "string" &&
                horn[0].length <= 25 &&
                horn[0].toLowerCase() != "reset" &&
                typeof horn[1] === "string" &&
                regexUrl.test(horn[1])
                // && (await isAudioOk(horn[1]))
              ) {
                updateArray.push(<AudioAlias>{ name: horn[0], url: horn[1] });
                importedHornCount++;

                // if conflicted (name or URL), save another array for deletion of conflicted values
                const conflictedAudio = audios.find(
                  (audio) => audio.name == horn[0] || audio.url == horn[1]
                );
                if (conflictedAudio) {
                  conflictedArray.push(conflictedAudio.name);
                }
              }
            }
            await DBHelper.saveGuildSettings(
              { guildId: message.guild.id },
              {
                $pull: { audioAliases: { name: { $in: conflictedArray } } },
              }
            );
            await DBHelper.saveGuildSettings(
              { guildId: message.guild.id },
              {
                $push: {
                  audioAliases: { $each: updateArray },
                },
              }
            );
            message.react("✅");
            logger.info(
              `${importedHornCount} horns imported. @${message.guild.name}<${message.guild.id}>`
            );
          } catch (error) {
            logger.error(error.message);
            message.reply(ERROR_DB_CONN.toBold());
          }
        });
      });

      req.on("error", (error) => {
        logger.error(error.message);
        message.reply(ERROR_COULD_NOT_DL_FILE.toBold());
      });
    } else {
      message.reply(REPLY_ATTACH_YAML.toBold());
    }
  },
};
