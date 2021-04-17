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

export const connect = async (guildData: GuildData) => {
  const connection = await guildData.voiceChannel.join();
  guildData.connection = connection;
  return guildData;
};

export const initGuildData = async (
  guild: Guild,
  voiceChannel?: VoiceChannel
): Promise<GuildData> => {
  if (guilds.has(guild.id)) return guilds.get(guild.id);

  try {
    let guildSettings = await DBHelper.getGuildSettings(guild, { themes: 0 });
    if (!guildSettings)
      guildSettings = await DBHelper.createGuildSettings(guild);

    const guildData = <GuildData>{
      textChannel: null,
      voiceChannel: voiceChannel ? voiceChannel : null,
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

export const getAndUpdateGuildData = (
  guild: Guild,
  textChannel: TextChannel | DMChannel | NewsChannel,
  voiceChannel: VoiceChannel
): GuildData => {
  const guildId = guild.id;
  const guildData = guilds.get(guildId);
  if (textChannel) guildData.textChannel = textChannel;
  if (voiceChannel) guildData.voiceChannel = voiceChannel;
  return guildData;
};
