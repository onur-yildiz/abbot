import { Command, Message } from "discord.js";
import DBHelper from "../../db/dbHelper";
import { fetchGuildData } from "../../util/guildActions";

export = <Command>{
  name: "togglegreeting",
  aliases: ["greeting", "tg", "togglegreet", "greet"],
  description: "Clears the queue.",
  usage: "",
  args: Args.none,
  permissions: ["ADMINISTRATOR", "MOVE_MEMBERS"],
  guildOnly: true,
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
    } catch (error) {
      console.error(error);
    }
  },
};
