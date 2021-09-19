import { Command, Message } from "discord.js";
import {
  ALREADY_PLAYING,
  ERROR_EXECUTION_ERROR,
  NOTHING_IS_PLAYING,
} from "../../constants/messages";
import { logger } from "../../global/globals";
import { checkVoiceChannelAvailability } from "../../util/checker";
import { fetchGuildData } from "../../util/guildActions";

export = <Command>{
  name: "resume",
  aliases: ["continue"],
  description: "Resumes the paused track.",
  usage: "",
  isGuildOnly: true,
  args: Args.none,
  async execute(message: Message) {
    // ! dispatcher.resume() works correctly only on node v14.16.1 for discordjs 12.5
    const error = checkVoiceChannelAvailability(message);
    if (error) return message.channel.send(error.toBold());

    try {
      const guildData = await fetchGuildData(
        message.guild,
        message.channel,
        message.member.voice.channel
      );

      const dispatcher = guildData.connection.dispatcher;

      if (guildData.isQueueActive) {
        if (!dispatcher.paused)
          return message.channel.send(ALREADY_PLAYING.toBold());
        await message.react("⏯");
        dispatcher.emit("resume");
      } else message.channel.send(NOTHING_IS_PLAYING.toBold());
    } catch (error) {
      message.reply(ERROR_EXECUTION_ERROR.toBold());
      message.react("❗");
      logger.error(error.message);
    }
  },
};
