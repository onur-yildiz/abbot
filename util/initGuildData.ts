import { Guild, GuildData, VoiceChannel } from "discord.js";
import { createGuildSettings, getGuildSettings } from "../db/dbHelper";
import { guilds } from "../global/globals";

export const initGuildData = async (
  guild: Guild,
  voiceChannel?: VoiceChannel
): Promise<GuildData> => {
  if (guilds.has(guild.id)) return guilds.get(guild.id);

  try {
    let guildSettings = await getGuildSettings(guild, { themes: 0 });
    if (!guildSettings) guildSettings = await createGuildSettings(guild);

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
