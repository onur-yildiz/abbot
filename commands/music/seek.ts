import { Command, Message } from "discord.js";
import {
  ERROR_EXECUTION_ERROR,
  ERROR_INVALID_FORMAT,
  NOTHING_IS_PLAYING,
} from "../../constants/messages";
import { logger } from "../../global/globals";
import { checkVoiceChannelAvailability } from "../../util/checker";
import { hhmmssToSeconds } from "../../util/durationParser";
import { fetchGuildData } from "../../util/guildActions";

export = <Command>{
  name: "seek",
  aliases: ["goto"],
  description: "Continues from given time.",
  usage: "[seconds]",
  isGuildOnly: true,
  args: Args.required,
  async execute(message: Message, args?: string[]) {
    const error = checkVoiceChannelAvailability(message);
    if (error) return message.channel.send(error.toBold());

    try {
      const guildData = await fetchGuildData(
        message.guild,
        message.channel,
        message.member.voice.channel
      );

      const regex = /^((\d+:\d{2}:\d{2})?|(\d{1,2}:\d{2})|\d{1,2})$/;

      let seconds: number = Number(args[1]);
      if (isNaN(seconds)) {
        if (regex.test(args[1])) seconds = hhmmssToSeconds(args[1]);
        else return message.reply(ERROR_INVALID_FORMAT.toBold());
      }
      const dispatcher = guildData.connection.dispatcher;

      if (guildData.isQueueActive) {
        await message.react("⏩");
        dispatcher.emit("seek", [seconds]);
      } else message.channel.send(NOTHING_IS_PLAYING.toBold());
    } catch (error) {
      message.reply(ERROR_EXECUTION_ERROR.toBold());
      message.react("❗");
      logger.error(error.message);
    }
  },
};
