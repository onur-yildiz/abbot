import { Command, Message } from "discord.js";
import { ERROR_EXECUTION_ERROR } from "../../constants/messages";
import DBHelper from "../../db/dbHelper";
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
      if (
        commands.get("horn").aliases.includes(commandContent) ||
        commandContent === "horn"
      ) {
        const data: string[] = [];
        const guildSettings = await DBHelper.getGuildSettings(message.guild);
        for (const key of guildSettings.audioAliases.keys()) data.push(key);

        data.map((d) => d.toInlineCodeBg());
        return message.channel.send(data.join(", "));
      }
    } catch (error) {
      message.reply(ERROR_EXECUTION_ERROR.toBold());
      console.error(error);
    }
  },
};
