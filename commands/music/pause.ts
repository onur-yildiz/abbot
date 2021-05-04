import { Command, Message } from "discord.js";
import {
  ALREADY_PAUSED,
  ERROR_EXECUTION_ERROR,
  NOTHING_IS_PLAYING,
  PAUSED,
} from "../../constants/messages";
import { logger } from "../../global/globals";
import { checkVoiceChannelAvailability } from "../../util/checker";
import { fetchGuildData } from "../../util/guildActions";

export = <Command>{
  name: "pause",
  aliases: ["pause", "stop"],
  description: "Pauses the current playing track.",
  usage: "",
  guildOnly: true,
  args: Args.none,
  async execute(message: Message) {
    const error = checkVoiceChannelAvailability(message);
    if (error) return message.channel.send(error.toBold());

    try {
      const guildData = await fetchGuildData(
        message.guild,
        message.channel,
        message.member.voice.channel
      );

      if (guildData.connection.dispatcher.paused)
        return message.channel.send(ALREADY_PAUSED.toBold());
      if (guildData.queueActive) {
        guildData.connection.dispatcher.pause();
        message.channel.send(PAUSED.toBold());
      } else message.channel.send(NOTHING_IS_PLAYING.toItalic());
    } catch (error) {
      message.reply(ERROR_EXECUTION_ERROR.toBold());
      logger.error(error);
    }
  },
};
