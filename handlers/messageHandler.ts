import Discord, { Client, Message, NewsChannel, TextChannel } from "discord.js";
import {
  ERROR_EXECUTION_ERROR,
  REPLY_CANT_EXECUTE_DM,
  REPLY_NOT_ALLOWED,
  REPLY_NO_ARGS,
} from "../constants/messages";
import {
  commands,
  cooldowns,
  defaultPrefix,
  guilds,
  logger,
} from "../global/globals";
import { getCommandArgs, getCommandName } from "../util/commandParser";
import { fetchGuildData } from "../util/guildActions";
import { sendDefaultHelpMessage } from "../util/messageUtil";

export const messageHandler = async (client: Client, message: Message) => {
  if (message.author.bot) return;

  let curPrefix = defaultPrefix;
  try {
    if (message.channel.type !== "dm") {
      if (!guilds.has(message.guild.id)) {
        curPrefix = (await fetchGuildData(message.guild)).prefix;
      } else curPrefix = guilds.get(message.guild.id).prefix;
    }
  } catch (error) {
    logger.error(error);
    return;
  }

  if (message.content === `<@!${client.user.id}>`)
    return sendDefaultHelpMessage(message, curPrefix);

  if (!message.content.startsWith(curPrefix)) return;

  const commandName = getCommandName(message.content, curPrefix);
  const commandArgs = getCommandArgs(message.content, curPrefix);

  const command =
    commands.get(commandName) ||
    commands.find((cmd) => cmd.aliases.includes(commandName));
  if (!command) return;

  if (command.isGuildOnly && message.channel.type === "dm")
    return message.reply(REPLY_CANT_EXECUTE_DM);

  if (command.permissions) {
    const authorPerms = (<TextChannel | NewsChannel>(
      message.channel
    )).permissionsFor(message.author);
    if (!authorPerms?.has(command.permissions)) {
      return message.reply(
        REPLY_NOT_ALLOWED +
          ` Permission(s) needed: ${command.permissions.toString()}`
      );
    }
  }

  if (command.args === Args.required && commandArgs.length == 0)
    return message.reply(
      REPLY_NO_ARGS + `\nUsage: ${curPrefix}${command.name} ${command.usage}`
    );

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `please wait ${Math.ceil(timeLeft).toFixed(0)}` +
          ` more second(s) before reusing the \`${command.name}\` command.`
      );
    }
  }
  timestamps.set(message.author.id, now);
  setTimeout(() => {
    timestamps.delete(message.author.id);
  }, cooldownAmount);

  try {
    if (command.args === Args.none) await command.execute(message);
    else await command.execute(message, [commandName, ...commandArgs]);
  } catch (error) {
    logger.error(error);
    message.reply(ERROR_EXECUTION_ERROR.toBold());
  }
};
