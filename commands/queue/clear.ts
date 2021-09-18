import { Command, Message } from "discord.js";
import { ERROR_EXECUTION_ERROR } from "../../constants/messages";
import { logger } from "../../global/globals";
import { checkVoiceChannelAvailability } from "../../util/checker";
import { fetchGuildData } from "../../util/guildActions";

export = <Command>{
  name: "clear",
  aliases: ["cl", "c"],
  description: "Clears the queue.",
  usage: "",
  args: Args.none,
  isGuildOnly: true,
  async execute(message: Message) {
    const error = checkVoiceChannelAvailability(message);
    if (error) return message.channel.send(error.toBold());

    try {
      const guildData = await fetchGuildData(
        message.guild,
        message.channel,
        message.member.voice.channel
      );

      if (guildData.songs.length == 0) return message.react("🚫");

      guildData.songs.splice(1, guildData.songs.length - 1);
      return message.react("🗑");
    } catch (error) {
      message.reply(ERROR_EXECUTION_ERROR.toBold());
      message.react("❗");
      logger.error(error);
    }
  },
};
