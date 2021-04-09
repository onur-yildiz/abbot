import { Message } from "discord.js";
import {
  BOT_NOT_IN_CHANNEL,
  JOIN_CHANNEL_GENERIC,
} from "../constants/messages";

export const checkAvailability = (message: Message): string | null => {
  if (message.guild.voice == null || message.guild.voice.channel == null)
    return BOT_NOT_IN_CHANNEL;
  if (message.member.voice == null || message.member.voice.channel == null)
    return JOIN_CHANNEL_GENERIC;
  if (message.member.voice.channel.id != message.guild.voice.channel.id)
    return JOIN_CHANNEL_GENERIC;
  return null;
};
