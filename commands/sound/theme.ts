import { Command, Message } from "discord.js";
import { saveUserSettings } from "../../db/dbHelper";
import { UpdateQuery } from "mongoose";
import { IUserSettings } from "../../db/dbModels";
import { ERROR_SAVE_THEME } from "../../constants/messages";
import { getDefaultAudios } from "../../util/getDefaultAudios";
import { guilds } from "../../global/globals";

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
    const guildData = guilds.get(message.guild.id);
    const botAliases = getDefaultAudios();
    const guildAliases = Array.from(guildData.audioAliases.keys());

    let query: UpdateQuery<IUserSettings>;
    if (botAliases.includes(alias))
      query = {
        $set: { [`themes.${message.guild.id}`]: `./assets/audio/${alias}.mp3` },
      };
    else if (guildAliases.includes(alias))
      query = {
        $set: {
          [`themes.${message.guild.id}`]: guildData.audioAliases.get(alias),
        },
      };
    else {
      return message.reply(
        `there is no aliases named ${alias.toInlineCodeBg()}!`
      );
    }

    try {
      await saveUserSettings(message.author, query);
      message.react("✅");
    } catch (error) {
      message.reply(ERROR_SAVE_THEME);
      console.log(error);
    }
  },
};
