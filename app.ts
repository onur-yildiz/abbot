import Discord from "discord.js";
import mongoose from "mongoose";
import fs from "fs";
import "ffmpeg";

import { commands, token, uri } from "./global/globals";
import { voiceStateUpdateHandler } from "./handlers/voiceStateUpdateHandler";
import "./extensions/string";
import { guildDeleteHandler } from "./handlers/guildDeleteHandler";
import { messageHandler } from "./handlers/messageHandler";

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
  try {
    await client.user.setPresence({
      activity: { type: "PLAYING", name: `Type @${client.user.username}` },
    });
    console.log("Ready!");
  } catch (error) {
    console.log(error);
  }
});

client.once("disconnect", () => {
  console.log("Disconnected.");
});

client.on("voiceStateUpdate", voiceStateUpdateHandler);
client.on("guildDelete", guildDeleteHandler);
client.on("message", messageHandler.bind(this, client));
