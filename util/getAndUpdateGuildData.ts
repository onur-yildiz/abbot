import {
  DMChannel,
  Guild,
  NewsChannel,
  GuildData,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { guilds } from "../global/globals";

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
