import Discord, { Client, Message, NewsChannel, TextChannel } from "discord.js";
import { ERROR_EXECUTION_ERROR } from "../constants/messages";
import { commands, cooldowns, defaultPrefix, guilds } from "../global/globals";
import { getCommandContent, getCommandName } from "../util/commandParser";
import { fetchGuildData } from "../util/guildActions";
import { sendDefaultHelpMessage } from "../util/messageUtil";

export const messageHandler = async (client: Client, message: Message) => {
  if (message.author.bot) return;

  let curPrefix = defaultPrefix;
  try {
    if (message.channel.type !== "dm") {
      if (!guilds.has(message.guild.id)) await fetchGuildData(message.guild);
      curPrefix = guilds.get(message.guild.id).prefix;
    }
  } catch (error) {
    console.error(error);
    return;
  }

  if (message.content === `<@!${client.user.id}>`)
    return sendDefaultHelpMessage(message, curPrefix);

  if (!message.content.startsWith(curPrefix)) return;

  const commandName = getCommandName(message.content, curPrefix);
  const commandContent = getCommandContent(message.content, curPrefix);

  const command =
    commands.get(commandName) ||
    commands.find((cmd) => cmd.aliases.includes(commandName));
  if (command == null) return;

  if (command.guildOnly && message.channel.type === "dm")
    return message.reply("I can't execute that command inside DMs!");

  if (command.permissions != null) {
    const authorPerms = (<TextChannel | NewsChannel>(
      message.channel
    )).permissionsFor(message.author);
    if (!authorPerms || !authorPerms.any(command.permissions)) {
      return message.reply("you are not allowed to do this!");
    }
  }

  if (command.args === Args.required && commandContent == "")
    return message.reply("you did not provide any arguments!");

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
    else await command.execute(message, [commandName, commandContent]);
  } catch (error) {
    console.error(error);
    message.reply(ERROR_EXECUTION_ERROR.toBold());
  }
};
