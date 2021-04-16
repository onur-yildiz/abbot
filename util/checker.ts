import { Message } from "discord.js";
import {
  BOT_NOT_IN_CHANNEL,
  BOT_NOT_IN_SAME_CHANNEL,
  JOIN_CHANNEL_GENERIC,
  JOIN_CHANNEL_PLAY,
  PERMISSIONS_PLAY,
} from "../constants/messages";

export const checkVoiceChannelAvailability = (
  message: Message
): string | null => {
  const userVoice = message.member.voice;
  const botVoice = message.guild.voice;
  if (!userVoice || !userVoice.channel) return JOIN_CHANNEL_GENERIC;

  const permissions = userVoice.channel.permissionsFor(message.guild.me);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return PERMISSIONS_PLAY;
  }
  if (!botVoice || !botVoice.channel) return BOT_NOT_IN_CHANNEL;
  if (userVoice.channel.id != botVoice.channel.id)
    return BOT_NOT_IN_SAME_CHANNEL;
  return null;
};

export const checkUserInAChannel = (message: Message): string | null => {
  if (message.member.voice == null || message.member.voice.channel == null)
    return JOIN_CHANNEL_GENERIC;
  return null;
};

// export const checkVoiceChannelAvailability = (message: Message): string | null => {
//   const userVoice = message.member.voice;
//   const botVoice = message.guild.voice;
//   if (botVoice == null || botVoice.channel == null) return BOT_NOT_IN_CHANNEL;
//   if (
//     !userVoice ||
//     !userVoice.channel ||
//     userVoice.channel.id != botVoice.channel.id
//   )
//     return JOIN_CHANNEL_GENERIC;
//   return null;
// };
