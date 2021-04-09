import { Message } from "discord.js";
import {
  BOT_NOT_IN_CHANNEL,
  JOIN_CHANNEL_GENERIC,
} from "../constants/messages";

export const checkUserInAChannel = (message: Message): string | null => {
  if (message.member.voice == null || message.member.voice.channel == null)
    return JOIN_CHANNEL_GENERIC;
  return null;
};
