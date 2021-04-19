import { Command, Message } from "discord.js";
import { UpdateQuery } from "mongoose";
import { ERROR_SAVE_THEME } from "../../constants/messages";
import { IGuildSettings } from "../../db/dbModels";
import dbHelper from "../../db/dbHelper";
import getDefaultAudios from "../../util/getDefaultAudios";

const defaultAlias = "ww";

export = <Command>{
  name: "theme",
  aliases: ["settheme", "mytheme"],
  description: "Set your custom greeting theme from the saved horns.",
  usage: '[horn alias] OR "reset"',
  args: Args.required,
  guildOnly: true,
  cooldown: 5,
  async execute(message: Message, args: string[]) {
    let alias = args[1];
    if (args[1] === "reset") alias = defaultAlias;
    const botAliases = getDefaultAudios();
    const guildSettings = await dbHelper.getGuildSettings(message.guild, {
      audioAliases: 1,
    });
    const guildAliases = Array.from(guildSettings.audioAliases.keys());

    let query: UpdateQuery<IGuildSettings>;
    if (botAliases.includes(alias))
      query = {
        $set: {
          [`themes.${message.member.id}`]: `./assets/audio/${alias}.mp3`,
        },
      };
    else if (guildAliases.includes(alias))
      query = {
        $set: {
          [`themes.${message.member.id}`]: guildSettings.audioAliases.get(
            alias
          ),
        },
      };
    else {
      return message.reply(
        `there is no aliases named ${alias.toInlineCodeBg()}!`
      );
    }

    try {
      await dbHelper.saveGuildSettings(message.guild, query);
      message.react("✅");
    } catch (error) {
      message.reply(ERROR_SAVE_THEME);
      console.log(error);
    }
  },
};
