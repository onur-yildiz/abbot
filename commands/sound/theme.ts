import { Command, Message } from "discord.js";
import { UpdateQuery } from "mongoose";
import { ERROR_SAVE_THEME } from "../../constants/messages";
import { IGuildSettings } from "../../db/DBModels";
import DBHelper from "../../db/DBHelper";
import getDefaultAudios from "../../util/getDefaultAudios";
import { logger } from "../../global/globals";

export = <Command>{
  name: "theme",
  aliases: ["settheme", "mytheme"],
  description: "Set your custom greeting theme from the saved horns.",
  usage: "[horn alias]\nOR reset (remove your theme)",
  args: Args.required,
  isGuildOnly: true,
  cooldown: 5,
  argList: ["reset"],
  async execute(message: Message, args: string[]) {
    let alias = args[1];
    if (args[1] === "reset") {
      await DBHelper.saveGuildSettings(
        { guildId: message.guild.id },
        {
          $unset: {
            [`themes.${message.member.id}`]: "",
          },
        }
      );
      return message.react("✅");
    }

    const botAliases = getDefaultAudios();
    try {
      let query: UpdateQuery<IGuildSettings>;
      if (botAliases.includes(alias))
        query = {
          $set: {
            [`themes.${message.member.id}`]: `./assets/audio/${alias}.mp3`,
          },
        };
      else {
        const guildSettings = await DBHelper.getGuildSettings(message.guild, {
          audioAliases: { $elemMatch: { name: alias } },
        });

        if (
          guildSettings.audioAliases.some(
            (audioAlias) => audioAlias.name == alias
          )
        ) {
          query = {
            $set: {
              [`themes.${message.member.id}`]: guildSettings.audioAliases.find(
                (audioAlias) => audioAlias.name == alias
              ).url,
            },
          };
        } else {
          return message.reply(
            `there is no aliases named ${alias.toInlineCodeBg()}!`
          );
        }
      }

      await DBHelper.saveGuildSettings({ guildId: message.guild.id }, query);
      message.react("✅");
    } catch (error) {
      message.reply(ERROR_SAVE_THEME);
      logger.log(error);
    }
  },
};
