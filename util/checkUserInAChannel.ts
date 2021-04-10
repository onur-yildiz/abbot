import { Message } from "discord.js";
import { JOIN_CHANNEL_GENERIC } from "../constants/messages";

export const checkUserInAChannel = (message: Message): string | null => {
  if (message.member.voice == null || message.member.voice.channel == null)
    return JOIN_CHANNEL_GENERIC;
  return null;
};
