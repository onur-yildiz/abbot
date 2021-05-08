import { Command, Message } from "discord.js";
import DBHelper from "../../db/DBHelper";
import { defaultPrefix, guilds, logger } from "../../global/globals";

export = <Command>{
  name: "prefix",
  aliases: ["px"],
  description: "Set a new prefix for the server.",
  usage: '/[new prefix]/ OR "reset"',
  isGuildOnly: true,
  args: Args.required,
  permissions: "ADMINISTRATOR",
  cooldown: 5,
  async execute(message: Message, args: string[]) {
    if (args[1] === "reset") {
      await setPrefix(message, defaultPrefix);
      return message.reply(
        `prefix is reset to ${defaultPrefix.toInlineCodeBg()}`
      );
    }

    if (!isValidFormat(args[1]))
      return message.reply(
        `That is not a valid prefix! (max 4 chars, only last char may be a space)`
      );
    const newPrefix = args[1].slice(1, args[1].length - 1);
    if (newPrefix === guilds.get(message.guild.id).prefix)
      return message.reply(`you provided the same prefix!`);

    try {
      await setPrefix(message, newPrefix);
      message.channel.send(
        `The prefix is changed to ${newPrefix.toInlineCodeBg()}`
      );
    } catch (error) {
      logger.error(error);
    }
  },
};

const setPrefix = async (message: Message, prefix: string): Promise<void> => {
  await DBHelper.saveGuildSettings(message.guild, { prefix: prefix });
  guilds.get(message.guild.id).prefix = prefix;
};

// valid format: "/..../",
// max 4 chars,
// starts and ends with '/',
// only 4th char can be a space
const isValidFormat = (prefix: string): boolean => {
  if (!(prefix.startsWith("/") && prefix.endsWith("/"))) return false;
  prefix = prefix.slice(1, prefix.length - 1);
  return (
    !prefix.slice(0, prefix.length - 1).includes(" ") &&
    !(prefix.length > 4) &&
    prefix !== " "
  );
};
