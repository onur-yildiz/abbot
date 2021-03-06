import { Command, Message } from "discord.js";
import DBHelper from "../../db/DBHelper";
import getDefaultAudios from "../../util/media/getDefaultAudios";
import { logger } from "../../global/globals";
import fetchGuildData from "../../util/fetchGuildData";

export = <Command>{
  name: "annoy",
  aliases: ["prank"],
  description: "Annoy someone whenever they speak.",
  usage:
    "[@user] [alias]\nOR " +
    "reset [@user] (remove someone's annoy sound)\nOR " +
    "toggle (activate/deactivate)\nOR " +
    "reset (remove your annoy sound)\nOR " +
    "(un)block (change annoy permit for yourself)",
  permissions: "MOVE_MEMBERS",
  args: Args.required,
  isGuildOnly: true,
  cooldown: 5,
  argList: ["toggle", "block", "unblock", "reset"],
  async execute(message: Message, args: string[]) {
    let userId = extractMentionId(args[1]);
    let alias = args[2];

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
        if (args[2]) {
          userId = extractMentionId(args[2]);
          guildData.annoyanceList.delete(userId);
        } else guildData.annoyanceList.delete(message.member.id);
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

      const botAliases = getDefaultAudios();
      const guildSettings = await DBHelper.getGuildSettings(message.guild, {
        audioAliases: { $elemMatch: { name: alias } },
      });

      if (botAliases.includes(alias)) {
        guildData.annoyanceList.set(userId, `./assets/audio/${alias}.mp3`);
      }
      if (
        guildSettings.audioAliases.some(
          (audioAlias) => audioAlias.name == alias
        )
      ) {
        guildData.annoyanceList.set(
          userId,
          guildSettings.audioAliases.find(
            (audioAlias) => audioAlias.name == alias
          ).url
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

// <@!userId> alias
const extractMentionId = (mention: string) => {
  if (mention.startsWith("<@") && mention.endsWith(">")) {
    mention = mention.slice(2, -1);

    if (mention.startsWith("!")) {
      mention = mention.slice(1);
    }
  }
  return mention;
};
