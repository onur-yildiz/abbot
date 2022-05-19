import { Command, Message } from "discord.js";
import DBHelper from "../../db/DBHelper";
import { logger } from "../../global/globals";
import fetchGuildData from "../../util/fetchGuildData";

export = <Command>{
  name: "togglethemes",
  aliases: ["togglegreeting", "tt", "toggletheme"],
  description: "Toggles the themes.",
  usage: "",
  args: Args.none,
  permissions: "ADMINISTRATOR",
  isGuildOnly: true,
  async execute(message: Message) {
    try {
      const guildData = await fetchGuildData(
        message.guild,
        message.channel,
        message.member.voice.channel
      );

      guildData.greetingEnabled = !guildData.greetingEnabled;
      await DBHelper.saveGuildSettings(
        { guildId: message.guild.id },
        {
          greetingEnabled: guildData.greetingEnabled,
        }
      );

      message.channel.send(
        `Themes are ${
          guildData.greetingEnabled
            ? "enabled :white_check_mark: "
            : "disabled :x:"
        }`.toBold()
      );

      logger.info(
        `Greeting ::: ` +
          (guildData.greetingEnabled ? "enabled" : "disabled") +
          ` @${message.guild.name}<${message.guild.id}`
      );
    } catch (error) {
      logger.error(error);
    }
  },
};
