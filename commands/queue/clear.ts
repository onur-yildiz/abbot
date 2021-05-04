import { Command, Message } from "discord.js";
import {
  ERROR_EXECUTION_ERROR,
  QUEUE_CLEARED,
  QUEUE_EMPTY_CLEAR,
} from "../../constants/messages";
import { logger } from "../../global/globals";
import { checkVoiceChannelAvailability } from "../../util/checker";
import { fetchGuildData } from "../../util/guildActions";

export = <Command>{
  name: "clear",
  aliases: ["cl", "c"],
  description: "Clears the queue.",
  usage: "",
  args: Args.none,
  guildOnly: true,
  async execute(message: Message) {
    const error = checkVoiceChannelAvailability(message);
    if (error) return message.channel.send(error.toBold());

    try {
      const guildData = await fetchGuildData(
        message.guild,
        message.channel,
        message.member.voice.channel
      );

      if (guildData.songs.length == 0)
        return message.channel.send(QUEUE_EMPTY_CLEAR.toBold());

      guildData.songs.splice(1, guildData.songs.length - 1);
      return message.channel.send(QUEUE_CLEARED.toBold());
    } catch (error) {
      message.reply(ERROR_EXECUTION_ERROR.toBold());
      logger.error(error);
    }
  },
};
