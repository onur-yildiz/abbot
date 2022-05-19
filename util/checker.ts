import { Guild, Message, VoiceChannel } from "discord.js";
import {
  BOT_NOT_IN_CHANNEL,
  BOT_NOT_IN_SAME_CHANNEL,
  JOIN_CHANNEL_GENERIC,
  PERMISSIONS_PLAY,
} from "../constants/messages";

const isPermittedToConnectAndSpeak = (
  userVoiceChannel: VoiceChannel,
  guild: Guild
): boolean => {
  const permissions = userVoiceChannel.permissionsFor(guild.me);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) return false;

  return true;
};

const isUserInAChannel = (message: Message): string | null => {
  if (!message.member.voice?.channel) return JOIN_CHANNEL_GENERIC;
  return null;
};

const isVoiceChannelAvailable = (message: Message): string | null => {
  const userVoice = message.member.voice;
  const botVoice = message.guild.voice;

  if (!userVoice?.channel) return JOIN_CHANNEL_GENERIC;
  if (!isPermittedToConnectAndSpeak(userVoice.channel, message.guild))
    return PERMISSIONS_PLAY;
  if (!botVoice?.channel) return BOT_NOT_IN_CHANNEL;
  if (userVoice.channel.id != botVoice.channel.id)
    return BOT_NOT_IN_SAME_CHANNEL;
  return null;
};

export default {
  isPermittedToConnectAndSpeak,
  isUserInAChannel,
  isVoiceChannelAvailable,
};
