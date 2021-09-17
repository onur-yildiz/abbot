import { Command, Message } from "discord.js";
import DBHelper from "../../db/DBHelper";
import { logger } from "../../global/globals";
import { fetchGuildData } from "../../util/guildActions";

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
      await DBHelper.saveGuildSettings(message.guild, {
        greetingEnabled: guildData.greetingEnabled,
      });

      message.channel.send(
        `Greeting is ${
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
