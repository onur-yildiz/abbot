import { Command, Message } from "discord.js";
import { ERROR_EXECUTION_ERROR, NO_SAVED_ARGS } from "../../constants/messages";
import DBHelper from "../../db/DBHelper";
import { commands, logger } from "../../global/globals";
import getDefaultAudios from "../../util/getDefaultAudios";

export = <Command>{
  name: "args",
  aliases: ["arg"],
  description:
    "Returns the list of saved arguments accepted by the entered command.",
  usage: "[command name]",
  isGuildOnly: true,
  args: Args.required,
  async execute(message: Message, args: string[]) {
    const commandName = args[1];

    try {
      const data: string[] = [];
      const command =
        commands.get(commandName) ||
        commands.find((cmd) => cmd.aliases.includes(commandName));

      if (command.name === "horn") {
        const guildSettings = await DBHelper.getGuildSettings(message.guild, {
          audioAliases: 1,
        });
        for (const audioAlias of guildSettings.audioAliases) {
          data.push(audioAlias.name);
        }
      }
      command.argList && data.push(...command.argList);

      if (data.length === 0)
        return message.channel.send(NO_SAVED_ARGS.toBold());

      data.sort();
      let args = data.join(", ");

      // !!
      // Max allowed length is 2000 for a message.
      // When sending at the end, toInlineCodeBg() func adds "`" to beginning and end of the string.
      // Because of that we are checking for max length of 1998.
      if (args.length >= 1998) {
        let index = 0;
        let messages = new Array<string>();
        while (true) {
          const newLinePos = args.indexOf(", ", index + 1971); // max 25 chars + ', ';
          if (newLinePos === -1) {
            messages.push(args.slice(index + 2)); // ', ' 2 chars
            break;
          }
          messages.push(args.slice(index, newLinePos) + "\n"); // ', ' 2 chars
          index = newLinePos;
        }

        for (const msg of messages) {
          await message.channel.send(msg.toInlineCodeBg());
        }
      } else message.channel.send(args.toInlineCodeBg());
    } catch (error) {
      message.reply(ERROR_EXECUTION_ERROR.toBold());
      logger.error(error);
    }
  },
};
