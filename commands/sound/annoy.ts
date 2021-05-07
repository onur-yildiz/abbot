import { Command, Message } from "discord.js";
import dbHelper from "../../db/dbHelper";
import getDefaultAudios from "../../util/getDefaultAudios";
import { logger } from "../../global/globals";
import { fetchGuildData } from "../../util/guildActions";

export = <Command>{
  name: "annoy",
  aliases: ["prank"],
  description:
    "Annoy someone whenever they speak. (toggle to activate/deactivate, blocktoggle to deactivate for yourself)",
  usage: "[@user] [horn alias]\nOR " + "[@user] reset\nOR " + "(un)block",
  permissions: "MOVE_MEMBERS",
  args: Args.required,
  guildOnly: true,
  cooldown: 5,
  async execute(message: Message, args: string[]) {
    const commandWords = args[1].split(" ");

    // <@!userId> alias
    let userId = commandWords[0].slice(3, commandWords[0].length - 1);
    let alias = commandWords[1];

    try {
      const guildData = await fetchGuildData(message.guild, message.channel);
      let annoyList = guildData.annoyanceList;

      if (args[1] === "toggle") {
        if (annoyList) annoyList = null;
        else annoyList = new Map<string, string>();
        return message.react("✅");
      }

      if (!annoyList) {
        return message.reply(
          `annoy disabled. type ` +
            `${guildData.prefix}annoy toggle`.toInlineCodeBg() +
            ` to activate.`
        );
      }

      if (args[1] === "block") {
        annoyList.set(message.member.id, "");
        return message.react("✅");
      }

      if (args[1] === "unblock") {
        if (annoyList.get(message.member.id)?.length === 0) {
          annoyList.delete(message.member.id);
          return message.react("✅");
        } else return message.react("💤");
      }

      if (annoyList.get(message.member.id)?.length === 0) {
        return message.reply(`this user is annoyed enough. 🙂`);
      }

      try {
        await message.guild.members.fetch(userId);
      } catch (error) {
        return message.reply(`user not valid or does not exist in the server.`);
      }

      if (alias === "reset") {
        annoyList.delete(userId);
        return message.react("✅");
      }

      const botAliases = getDefaultAudios();
      const guildSettings = await dbHelper.getGuildSettings(message.guild, {
        audioAliases: 1,
      });
      const guildAliases = Array.from(guildSettings.audioAliases.keys());

      if (botAliases.includes(alias))
        annoyList.set(userId, `./assets/audio/${alias}.mp3`);
      if (guildAliases.includes(alias)) {
        annoyList.set(userId, guildSettings.audioAliases.get(alias));
        message.react("✅");
      } else {
        return message.reply(
          `there is no aliases named ${alias.toInlineCodeBg()}!`
        );
      }
    } catch (error) {
      message.reply(`an error occured during annoy command!`);
      logger.log(error);
    }
  },
};
