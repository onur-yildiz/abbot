import { Command, Message } from "discord.js";
import { saveGuildSettings } from "../../db/dbHelper";
import { getAndUpdateGuildData } from "../../util/getAndUpdateGuildData";

export = <Command>{
  name: "togglegreeting",
  aliases: ["greeting", "tg", "togglegreet", "greet"],
  description: "Clears the queue.",
  usage: "",
  args: Args.none,
  permissions: ["ADMINISTRATOR", "MOVE_MEMBERS"],
  guildOnly: true,
  async execute(message: Message) {
    const guildData = getAndUpdateGuildData(
      message.guild,
      message.channel,
      message.member.voice.channel
    );

    try {
      guildData.greetingEnabled = !guildData.greetingEnabled;
      await saveGuildSettings(message.guild, {
        greetingEnabled: guildData.greetingEnabled,
      });
      message.channel.send(
        `Greeting is ${
          guildData.greetingEnabled ? "enabled" : "disabled"
        }.`.toBold()
      );
    } catch (error) {
      console.error(error);
    }
  },
};
