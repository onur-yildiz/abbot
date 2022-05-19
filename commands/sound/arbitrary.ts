import { Command, Message } from "discord.js";
import { logger } from "../../global/globals";
import fetchGuildData from "../../util/fetchGuildData";

export = <Command>{
  name: "arbitrary",
  aliases: ["arb"],
  description: "Bot will play sounds from saved horns at arbitrary moments",
  usage: "",
  permissions: "MOVE_MEMBERS",
  args: Args.none,
  isGuildOnly: true,
  cooldown: 5,
  async execute(message: Message) {
    try {
      const guildData = await fetchGuildData(message.guild, message.channel);

      guildData.isArbitrarySoundsEnabled = !guildData.isArbitrarySoundsEnabled;
      if (!guildData.isArbitrarySoundsEnabled) {
        guildData.arbitrarySoundsTimer &&
          clearTimeout(guildData.arbitrarySoundsTimer);
        guildData.arbitrarySoundsTimer = null;
        await message.react("🛑");
        logger.info(
          `Arbitrary Disabled ::: @${message.guild.name}<${message.guild.id}>`
        );
      } else {
        await message.react("⏱");
        logger.info(
          `Arbitrary Enabled ::: @${message.guild.name}<${message.guild.id}>`
        );
      }
    } catch (error) {
      message.reply(`an error occured during arbitrary command!`);
      logger.log(error);
    }
  },
};
