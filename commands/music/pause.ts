import { Command, Message } from "discord.js";
import {
  ALREADY_PAUSED,
  ERROR_EXECUTION_ERROR,
  NOTHING_IS_PLAYING,
} from "../../constants/messages";
import { logger } from "../../global/globals";

import c from "../../util/checker";
import fetchGuildData from "../../util/fetchGuildData";

export = <Command>{
  name: "pause",
  aliases: ["stop"],
  description: "Pauses the current playing track.",
  usage: "",
  isGuildOnly: true,
  args: Args.none,
  async execute(message: Message) {
    const error = c.isVoiceChannelAvailable(message);
    if (error) return message.channel.send(error.toBold());

    try {
      const guildData = await fetchGuildData(
        message.guild,
        message.channel,
        message.member.voice.channel
      );

      const dispatcher = guildData.connection.dispatcher;

      if (guildData.isQueueActive) {
        if (dispatcher.paused)
          return message.channel.send(ALREADY_PAUSED.toBold());
        dispatcher.pause();
        message.react("⏸");
      } else message.channel.send(NOTHING_IS_PLAYING.toBold());
    } catch (error) {
      message.reply(ERROR_EXECUTION_ERROR.toBold());
      message.react("❗");
      logger.error(error.message);
    }
  },
};
