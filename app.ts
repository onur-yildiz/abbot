import Discord from "discord.js";
import fs from "fs";
import "ffmpeg";

import { commands, logger, token } from "./global/globals";
import { voiceStateUpdateHandler } from "./handlers/voiceStateUpdateHandler";
import "./extensions/string";
import { guildDeleteHandler } from "./handlers/guildDeleteHandler";
import { messageHandler } from "./handlers/messageHandler";
import DBHelper from "./db/DBHelper";
import { guildMemberSpeakingHandler } from "./handlers/guildMemberSpeakingHandler";

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

const runApp = async () => {
  const client = new Discord.Client();
  try {
    await DBHelper.connectToDatabase();
    logger.info("Connected to database.");
    client.login(token);
  } catch (error) {
    logger.error(error);
  }

  client.once("ready", async () => {
    try {
      await client.user.setPresence({
        activity: { type: "PLAYING", name: `Type @${client.user.username}` },
      });
      logger.info("Ready!");
    } catch (error) {
      logger.error(error);
    }
  });

  client.once("disconnect", () => {
    logger.info("Disconnected.");
  });

  client.on("voiceStateUpdate", voiceStateUpdateHandler);
  client.on("guildDelete", guildDeleteHandler);
  client.on("message", messageHandler.bind(this, client));
  client.on("guildMemberSpeaking", guildMemberSpeakingHandler);
};

runApp();
