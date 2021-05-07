import { Command, Message } from "discord.js";
import dbHelper from "../../db/dbHelper";
import { logger } from "../../global/globals";
import { fetchGuildData } from "../../util/guildActions";

export = <Command>{
  name: "togglegreeting",
  aliases: ["greeting", "tg", "togglegreet", "greet"],
  description: "Clears the queue.",
  usage: "",
  args: Args.none,
  permissions: "ADMINISTRATOR",
  guildOnly: true,
  async execute(message: Message) {
    try {
      const guildData = await fetchGuildData(
        message.guild,
        message.channel,
        message.member.voice.channel
      );

      guildData.greetingEnabled = !guildData.greetingEnabled;
      await dbHelper.saveGuildSettings(message.guild, {
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
