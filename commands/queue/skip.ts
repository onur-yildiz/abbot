import { Command, Message } from "discord.js";
import {
  ERROR_EXECUTION_ERROR,
  QUEUE_EMPTY_SKIP,
} from "../../constants/messages";
import { logger } from "../../global/globals";
import c from "../../util/checker";
import fetchGuildData from "../../util/fetchGuildData";

export = <Command>{
  name: "skip",
  aliases: ["s", "next"],
  description: "Skip the current song.",
  usage: "",
  args: Args.none,
  isGuildOnly: true,
  cooldown: 1,
  async execute(message: Message) {
    const error = c.isVoiceChannelAvailable(message);
    if (error) return message.channel.send(error);

    try {
      let guildData = await fetchGuildData(
        message.guild,
        message.channel,
        message.member.voice.channel
      );

      const dispatcher = guildData.connection.dispatcher;
      if (guildData.songs.length === 0)
        return message.channel.send(QUEUE_EMPTY_SKIP.toBold());

      if (dispatcher) {
        dispatcher.emit("skip");
        return message.react("⏭");
      }
    } catch (error) {
      message.reply(ERROR_EXECUTION_ERROR.toBold());
      message.react("❗");
      logger.error(error.message);
    }
  },
};
