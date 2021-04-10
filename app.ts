import {
  Collection,
  Command,
  Cooldowns,
  GuildContract,
  Message,
  NewsChannel,
  TextChannel,
} from "discord.js";

import Discord from "discord.js";
import fs from "fs";
import "ffmpeg";

import { TEST_EXECUTION_ERROR } from "./constants/messages";
import { getCommandName } from "./util/getCommandName";
import { getCommandContent } from "./util/getCommandContent";
import { greetUserInVoiceChannel } from "./bot-functions/greetUserInVoiceChannel";
import "./extensions/string";

require("dotenv").config();
const prefix = process.env.PREFIX;
const token = process.env.TOKEN;

const client = new Discord.Client();

export const commands = new Discord.Collection<string, Command>();

const commandFolders = fs.readdirSync("./commands");
for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(`./commands/${folder}`)
    .filter((file) => file.endsWith(".ts"));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file.slice(0, -3)}`);
    commands.set(command.name, command);
  }
}
const cooldowns: Cooldowns = new Discord.Collection<
  string,
  Collection<string, number>
>();

client.login(token);

client.once("ready", () => {
  console.log("Ready!");
});

client.once("reconnecting", () => {
  console.log("Reconnecting...");
});

client.once("disconnect", () => {
  console.log("Disconnected.");
});

client.on("voiceStateUpdate", greetUserInVoiceChannel);

client.on("message", async (message: Message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const commandName = getCommandName(message.content);
  const commandContent = getCommandContent(message.content);

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
      return message.reply("You can not do this!");
    }
  }

  if (command.args && commandContent == "")
    return message.channel.send(
      `You didn't provide any arguments, ${message.author}!`
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
    command.execute(message);
  } catch (error) {
    console.error(error);
    message.reply(TEST_EXECUTION_ERROR.toBold());
  }
});

export const guildContracts: GuildContract = new Map();
