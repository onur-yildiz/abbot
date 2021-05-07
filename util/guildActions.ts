import {
  DMChannel,
  Guild,
  NewsChannel,
  GuildData,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { guilds, logger } from "../global/globals";
import dbHelper from "../db/dbHelper";

export const connectToVoiceChannel = async (guildData: GuildData) => {
  const connection = await guildData.voiceChannel.join();
  guildData.connection = connection;
  return guildData;
};

export const disconnectFromVoiceChannel = async (guildData: GuildData) => {
  resetState(guildData);
  guildData.connection.disconnect();
  guildData.connection = null;
  guildData.voiceChannel = null;
  return guildData;
};

export const resetState = (guildData: GuildData) => {
  if (guildData.connection && guildData.connection.dispatcher)
    guildData.connection.dispatcher.destroy();
  guildData.songs = [];
  guildData.queueActive = false;
  guildData.lastTrackStart = null;
  guildData.quitTimer && clearTimeout(guildData.quitTimer);
};

export const fetchGuildData = async (
  guild: Guild,
  newTextChannel?: TextChannel | DMChannel | NewsChannel,
  newVoiceChannel?: VoiceChannel
): Promise<GuildData> => {
  if (guilds.has(guild.id)) {
    const guildData = guilds.get(guild.id);
    if (newTextChannel) guildData.textChannel = newTextChannel;
    if (newVoiceChannel) guildData.voiceChannel = newVoiceChannel;
    return guildData;
  }

  try {
    let guildSettings = await dbHelper.getGuildSettings(guild, { themes: 0 });
    if (!guildSettings)
      guildSettings = await dbHelper.createGuildSettings(guild);

    const guildData = <GuildData>{
      textChannel: newTextChannel ? newTextChannel : null,
      voiceChannel: newVoiceChannel ? newVoiceChannel : null,
      connection: null,
      songs: [],
      volume: 1,
      queueActive: false,
      greetingEnabled: guildSettings.greetingEnabled,
      audioAliases: guildSettings.audioAliases,
      prefix: guildSettings.prefix,
      lastTrackStart: null,
      annoyanceList: new Map<string, string>(),
    };

    // TODO: make a better solution for memory saving.
    if (guilds.size > 1000) guilds.delete(guilds.keys().next().value);
    guilds.set(guild.id, guildData);
    return guildData;
  } catch (error) {
    logger.error(error);
    return;
  }
};
