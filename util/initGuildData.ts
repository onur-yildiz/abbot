import { Guild, GuildData, VoiceChannel } from "discord.js";
import { guilds } from "../app";
import { getGuildSettings } from "../db/dbHelper";

require("dotenv").config();
const defaultPrefix = process.env.PREFIX;

export const initGuildData = async (
  guild: Guild,
  voiceChannel?: VoiceChannel
): Promise<GuildData> => {
  if (guilds.has(guild.id)) return guilds.get(guild.id);
  let guildData = <GuildData>{
    textChannel: null,
    voiceChannel: voiceChannel ? voiceChannel : null,
    connection: null,
    songs: [],
    volume: 1,
    queueActive: false,
    greetingEnabled: true,
    audioAliases: new Map(),
    prefix: defaultPrefix,
  };

  try {
    const guildSettings = await getGuildSettings(guild);
    if (guildSettings) {
      if (guildSettings.greetingEnabled != null)
        guildData.greetingEnabled = guildSettings.greetingEnabled;
      if (guildSettings.audioAliases)
        guildData.audioAliases = guildSettings.audioAliases;
      if (guildSettings.prefix) guildData.prefix = guildSettings.prefix;
    }
  } catch (error) {
    console.error(error);
    return;
  }
  guilds.set(guild.id, guildData);
  return guildData;
};
