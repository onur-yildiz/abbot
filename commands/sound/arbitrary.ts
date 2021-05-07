import { Command, Message } from "discord.js";
import dbHelper from "../../db/dbHelper";
import getDefaultAudios from "../../util/getDefaultAudios";
import { logger } from "../../global/globals";
import { fetchGuildData } from "../../util/guildActions";

export = <Command>{
  name: "arbitrary",
  aliases: ["randomwake"],
  description: "Bot will play sounds from saved horns at arbitrary moments",
  usage: "",
  permissions: "MOVE_MEMBERS",
  args: Args.none,
  guildOnly: true,
  cooldown: 5,
  async execute(message: Message) {
    try {
      const guildData = await fetchGuildData(message.guild, message.channel);
      guildData.arbitrarySoundsEnabled = !guildData.arbitrarySoundsEnabled;

      if (!guildData.arbitrarySoundsEnabled) {
        guildData.arbitrarySoundsTimer &&
          clearTimeout(guildData.arbitrarySoundsTimer);
      }

      message.react("✅");
    } catch (error) {
      message.reply(`an error occured during arbitrary command!`);
      logger.log(error);
    }
  },
};
