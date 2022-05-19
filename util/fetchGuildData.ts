import {
  DMChannel,
  Guild,
  GuildData,
  NewsChannel,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import DBHelper from "../db/DBHelper";
import { guilds, logger } from "../global/globals";

const fetchGuildData = async (
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
    let guildSettings = await DBHelper.getGuildSettings(guild, {
      themes: 0,
      audioAliases: 0,
    });
    if (!guildSettings)
      guildSettings = await DBHelper.createGuildSettings(guild);

    const guildData: GuildData = {
      textChannel: newTextChannel ? newTextChannel : null,
      voiceChannel: newVoiceChannel ? newVoiceChannel : null,
      connection: null,
      songs: [],
      volume: 1,
      isQueueActive: false,
      isLoopActive: false,
      greetingEnabled: guildSettings.greetingEnabled,
      prefix: guildSettings.prefix,
      lastTrackStart: null,
      isArbitrarySoundsEnabled: false,
      annoyanceList: new Map<string, string>(),
      async connectToVoice(this: GuildData) {
        if (this.connection?.channel !== this.voiceChannel)
          this.connection = await this.voiceChannel.join();
      },
      reset(this: GuildData) {
        this.connection?.dispatcher?.destroy();
        this.connection?.disconnect();
        this.connection = null;
        this.voiceChannel = null;
        this.songs = [];
        this.isQueueActive = false;
        this.isLoopActive = false;
        this.lastTrackStart = null;
        this.quitTimer && clearTimeout(this.quitTimer);
        this.isArbitrarySoundsEnabled = false;
        this.arbitrarySoundsTimer &&
          clearTimeout(guildData.arbitrarySoundsTimer);
      },
    };

    // TODO: make a better solution for memory saving.
    if (guilds.size > 1000) guilds.delete(guilds.keys().next().value);
    guilds.set(guild.id, guildData);
    return guildData;
  } catch (error) {
    logger.error(error.message);
    return;
  }
};

export default fetchGuildData;
