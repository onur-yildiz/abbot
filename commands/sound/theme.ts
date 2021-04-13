import fs from "fs";
import { Command, Message } from "discord.js";
import { guilds } from "../../app";
import { saveUserSettings } from "../../db/dbHelper";
import { UpdateQuery } from "mongoose";
import { IUserSettings } from "../../db/dbModels";
import { ERROR_SAVE_THEME } from "../../constants/messages";

export = <Command>{
  name: "theme",
  aliases: ["settheme", "mytheme"],
  description: "Set your custom greeting theme from the saved horns.",
  usage: "[horn alias]",
  args: Args.required,
  guildOnly: true,
  cooldown: 5,
  async execute(message: Message, args: string[]) {
    const alias = args[1];
    const guildData = guilds.get(message.guild.id);
    const botAliases = fs
      .readdirSync("./assets/audio")
      .filter((audio) => audio.endsWith(".mp3"))
      .map((audio) => audio.slice(0, -4));
    const guildAliases = Array.from(guildData.audioAliases.keys());

    let query: UpdateQuery<IUserSettings>;
    if (botAliases.includes(alias))
      query = {
        $set: { [`themes.${message.guild.id}`]: `${alias}.mp3` },
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
