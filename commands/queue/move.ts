import { Command, Message } from "discord.js";
import {
  ERROR_EXECUTION_ERROR,
  ERROR_INVALID_FORMAT,
  ERROR_QUEUE_OUT_OF_BOUNDS,
  QUEUE_EMPTY,
  REPLY_NO_ARGS,
} from "../../constants/messages";
import { logger } from "../../global/globals";
import { checkVoiceChannelAvailability } from "../../util/checker";
import { fetchGuildData } from "../../util/guildActions";

export = <Command>{
  name: "move",
  aliases: ["mv", "m"],
  description: "Moves queue item to a given position.",
  usage: "[old position] [new position]",
  args: Args.required,
  isGuildOnly: true,
  async execute(message: Message, args: string[]) {
    const error = checkVoiceChannelAvailability(message);
    if (error) return message.channel.send(error.toBold());

    try {
      const guildData = await fetchGuildData(
        message.guild,
        message.channel,
        message.member.voice.channel
      );

      if (guildData.songs.length == 0)
        return message.channel.send(QUEUE_EMPTY.toBold());

      const args = message.content.split(" ");
      if (args.length < 3) return message.reply(REPLY_NO_ARGS.toBold());
      const oldPosition = Number(args[1]);
      const newPosition = Number(args[2]);

      if (isNaN(oldPosition) || isNaN(newPosition))
        return message.reply(ERROR_INVALID_FORMAT.toBold());

      if (
        oldPosition < 0 ||
        oldPosition >= guildData.songs.length ||
        newPosition < 0 ||
        newPosition >= guildData.songs.length
      )
        return message.reply(ERROR_QUEUE_OUT_OF_BOUNDS.toBold());

      const song = guildData.songs.splice(oldPosition, 1)[0];
      guildData.songs.splice(newPosition, 0, song);
      return message.react("↔");
    } catch (error) {
      message.reply(ERROR_EXECUTION_ERROR.toBold());
      message.react("❗");
      logger.error(error.message);
    }
  },
};
