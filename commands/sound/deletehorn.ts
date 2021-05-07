import { Command, Message } from "discord.js";
import dbHelper from "../../db/dbHelper";
import { logger } from "../../global/globals";

export = <Command>{
  name: "deletehorn",
  aliases: ["dh", "delhorn"],
  description: "Delete a saved alias.",
  usage: "[horn alias]",
  permissions: "MOVE_MEMBERS",
  guildOnly: true,
  args: Args.required,
  cooldown: 5,
  async execute(message: Message, args: string[]) {
    const alias = args[1];

    try {
      const guildSettings = await dbHelper.getGuildSettings(message.guild, {
        [`audioAliases.${alias}`]: 1,
      });

      const exists = checkIfKeyExists(guildSettings.audioAliases, alias);
      if (!exists) return message.reply(`this alias does not exist.`);

      await dbHelper.saveGuildSettings(message.guild, {
        $unset: { [`audioAliases.${alias}`]: "" },
      });
      message.channel.send(
        `${alias.toInlineCodeBg()} is deleted. :wastebasket:`
      );

      logger.info(
        `Horn deleted ::: ${alias} @${message.guild.name}<${message.guild.id}`
      );
    } catch (error) {
      logger.error(error);
    }
  },
};

const checkIfKeyExists = (map: Map<string, string>, key: string): boolean => {
  return Array.from(map.keys()).includes(key);
};
