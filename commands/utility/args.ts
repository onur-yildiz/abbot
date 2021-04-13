import { Command, Message } from "discord.js";
import { ERROR_EXECUTION_ERROR } from "../../constants/messages";
import { getGuildSettings } from "../../db/dbHelper";

export = <Command>{
  name: "args",
  aliases: ["arg"],
  description:
    "Returns the list of saved arguments accepted by the entered command.",
  usage: "[command name]",
  guildOnly: true,
  args: Args.required,
  async execute(message: Message, args: string[]) {
    const commandContent = args[1];

    try {
      if (commandContent === "horn") {
        const data = [];
        const guildSettings = await getGuildSettings(message.guild);
        for (const key of guildSettings.audioAliases.keys()) data.push(key);

        return message.channel.send(data.join(", ").toInlineCodeBg());
      }
    } catch (error) {
      message.reply(ERROR_EXECUTION_ERROR.toBold());
      console.error(error);
    }
  },
};
