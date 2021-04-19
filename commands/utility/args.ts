import { Command, Message } from "discord.js";
import { ERROR_EXECUTION_ERROR, NO_SAVED_ARGS } from "../../constants/messages";
import dbHelper from "../../db/dbHelper";
import { commands } from "../../global/globals";

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
      const data: string[] = [];
      if (
        commands.get("horn").aliases.includes(commandContent) ||
        commandContent === "horn"
      ) {
        const guildSettings = await dbHelper.getGuildSettings(message.guild);
        for (const key of guildSettings.audioAliases.keys()) data.push(key);
      }
      if (data.length === 0)
        return message.channel.send(NO_SAVED_ARGS.toBold());
      return message.channel.send(data.join(", ").toInlineCodeBg());
    } catch (error) {
      message.reply(ERROR_EXECUTION_ERROR.toBold());
      console.error(error);
    }
  },
};
