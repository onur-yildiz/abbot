import {
  DMChannel,
  Guild,
  NewsChannel,
  GuildData,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { guilds } from "../global/globals";
import DBHelper from "../db/dbHelper";

export const connectToVoiceChannel = async (guildData: GuildData) => {
  const connection = await guildData.voiceChannel.join();
  guildData.connection = connection;
  return guildData;
};

export const disconnectFromVoiceChannel = async (guild: Guild) => {
  const guildData = await fetchGuildData(guild);
  resetQueue(guildData);
  guildData.voiceChannel.leave();
  guildData.connection = null;
  return guildData;
};

export const resetQueue = (guildData: GuildData) => {
  if (guildData.connection.dispatcher != null)
    guildData.connection.dispatcher.destroy();
  guildData.songs = [];
  guildData.queueActive = false;
  guildData.lastTrackStart = null;
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
    let guildSettings = await DBHelper.getGuildSettings(guild, { themes: 0 });
    if (!guildSettings)
      guildSettings = await DBHelper.createGuildSettings(guild);

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
    };

    if (guilds.size > 1000) guilds.delete(guilds.keys().next().value);
    guilds.set(guild.id, guildData);
    return guildData;
  } catch (error) {
    console.error(error);
    return;
  }
};
