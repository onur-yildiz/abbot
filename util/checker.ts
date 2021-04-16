import { Message } from "discord.js";
import {
  BOT_NOT_IN_CHANNEL,
  BOT_NOT_IN_SAME_CHANNEL,
  JOIN_CHANNEL_GENERIC,
  JOIN_CHANNEL_PLAY,
  PERMISSIONS_PLAY,
} from "../constants/messages";

export const checkJoinAvailability = (message: Message): string | null => {
  const userVoice = message.member.voice;
  const botVoice = message.guild.voice;
  const permissions = userVoice.channel.permissionsFor(message.guild.me);

  if (userVoice == null || userVoice.channel == null) return JOIN_CHANNEL_PLAY;
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return PERMISSIONS_PLAY;
  }
  if (
    botVoice != null &&
    botVoice.channel != null &&
    userVoice.channel.id != botVoice.channel.id
  )
    return BOT_NOT_IN_SAME_CHANNEL;
  return null;
};

export const checkUserInAChannel = (message: Message): string | null => {
  if (message.member.voice == null || message.member.voice.channel == null)
    return JOIN_CHANNEL_GENERIC;
  return null;
};

export const checkAvailability = (message: Message): string | null => {
  if (message.guild.voice == null || message.guild.voice.channel == null)
    return BOT_NOT_IN_CHANNEL;
  if (
    message.member.voice == null ||
    message.member.voice.channel == null ||
    message.member.voice.channel.id != message.guild.voice.channel.id
  )
    return JOIN_CHANNEL_GENERIC;
  return null;
};
