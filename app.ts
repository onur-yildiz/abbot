import {
  Collection,
  Command,
  Cooldowns,
  Guilds,
  Message,
  NewsChannel,
  TextChannel,
} from "discord.js";

import Discord from "discord.js";
import mongoose from "mongoose";
import fs from "fs";
import "ffmpeg";

import { ERROR_EXECUTION_ERROR } from "./constants/messages";
import { getCommandName } from "./util/getCommandName";
import { getCommandContent } from "./util/getCommandContent";
import { greetUserInVoiceChannel } from "./bot-functions/greetUserInVoiceChannel";
import { initGuildData } from "./util/initGuildData";
import { sendDefaultHelpMessage } from "./bot-functions/sendDefaultHelpMessage";
import "./extensions/string";

require("dotenv").config();
const defaultPrefix = process.env.PREFIX;
const token = process.env.TOKEN;
const uri = process.env.DATABASE_URI;

export const commands = new Discord.Collection<string, Command>();
export const guilds: Guilds = new Map();

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

const client = new Discord.Client();
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((res) => {
    console.log("Connected to database.");
    client.login(token);
  })
  .catch((error) => console.error(error));

client.once("ready", async () => {
  await client.user.setPresence({
    activity: { type: "PLAYING", name: `Type @${client.user.username}` },
  });
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

  let curPrefix = defaultPrefix;
  try {
    if (message.channel.type !== "dm") {
      if (!guilds.has(message.guild.id)) await initGuildData(message.guild);
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
});
