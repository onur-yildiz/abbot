import {
  DMChannel,
  Guild,
  NewsChannel,
  QueueContract,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { guildContracts } from "../app";

export const getOrInitQueue = (
  guild: Guild,
  textChannel: TextChannel | DMChannel | NewsChannel,
  voiceChannel: VoiceChannel
): QueueContract => {
  const guildId = guild.id;
  if (guildContracts.has(guildId)) {
    const queueContract = guildContracts.get(guildId);
    if (textChannel != null) queueContract.textChannel = textChannel;
    return queueContract;
  }

  const newQueueContract = {
    textChannel: textChannel,
    voiceChannel: voiceChannel,
    connection: null,
    songs: [],
    volume: 1,
    playing: false,
    enableGreeting: true,
  };

  return guildContracts.set(guildId, newQueueContract).get(guildId);
};
