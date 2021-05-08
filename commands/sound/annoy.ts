import { Command, Message } from "discord.js";
import DBHelper from "../../db/DBHelper";
import getDefaultAudios from "../../util/getDefaultAudios";
import { logger } from "../../global/globals";
import { fetchGuildData } from "../../util/guildActions";

export = <Command>{
  name: "annoy",
  aliases: ["prank"],
  description: "Annoy someone whenever they speak.",
  usage:
    "[@user] [horn alias]\nOR " +
    "[@user] reset\nOR " +
    "toggle\nOR " +
    "reset\nOR " +
    "(un)block" +
    "\n'toggle' to activate/deactivate, '(un)block' to change annoy permit for yourself or 'reset' to delete your annoy sound",
  permissions: "MOVE_MEMBERS",
  args: Args.required,
  isGuildOnly: true,
  cooldown: 5,
  async execute(message: Message, args: string[]) {
    const commandWords = args[1].split(" ");

    // <@!userId> alias
    let userId = commandWords[0].slice(3, commandWords[0].length - 1);
    let alias = commandWords[1];

    try {
      const guildData = await fetchGuildData(message.guild, message.channel);

      if (args[1] === "toggle") {
        if (guildData.annoyanceList) guildData.annoyanceList = null;
        else guildData.annoyanceList = new Map<string, string>();
        return message.react("✅");
      }

      if (!guildData.annoyanceList) {
        return message.reply(
          `annoy disabled. type ` +
            `${guildData.prefix}annoy toggle`.toInlineCodeBg() +
            ` to activate.`
        );
      }

      if (args[1] === "block") {
        guildData.annoyanceList.set(message.member.id, "");
        return message.react("✅");
      }

      if (args[1] === "unblock") {
        if (guildData.annoyanceList.get(message.member.id)?.length === 0) {
          guildData.annoyanceList.delete(message.member.id);
          return message.react("✅");
        } else return message.react("💤");
      }

      if (args[1] === "reset") {
        guildData.annoyanceList.delete(message.member.id);
        return message.react("✅");
      }

      if (guildData.annoyanceList.get(userId)?.length === 0) {
        return message.reply(`this user is annoyed enough. 🙂`);
      }

      try {
        if (userId === message.guild.me.id) throw null;
        await message.guild.members.fetch(userId);
      } catch (_) {
        return message.reply(`user not valid or does not exist in the server.`);
      }

      if (alias === "reset") {
        guildData.annoyanceList.delete(userId);
        return message.react("✅");
      }

      const botAliases = getDefaultAudios();
      const guildSettings = await DBHelper.getGuildSettings(message.guild, {
        audioAliases: 1,
      });
      const guildAliases = Array.from(guildSettings.audioAliases.keys());

      if (botAliases.includes(alias)) {
        guildData.annoyanceList.set(userId, `./assets/audio/${alias}.mp3`);
      }
      if (guildAliases.includes(alias)) {
        guildData.annoyanceList.set(
          userId,
          guildSettings.audioAliases.get(alias)
        );
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
