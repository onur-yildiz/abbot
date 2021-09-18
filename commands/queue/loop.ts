import { Command, Message } from "discord.js";

import { ERROR_EXECUTION_ERROR, QUEUE_EMPTY } from "../../constants/messages";
import { logger } from "../../global/globals";
import { checkVoiceChannelAvailability } from "../../util/checker";
import { fetchGuildData } from "../../util/guildActions";

export = <Command>{
  name: "loop",
  aliases: ["lq", "loopqueue"],
  description: "Toggles looping for the queue.",
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

      if (guildData.songs.length == 0)
        return message.channel.send(QUEUE_EMPTY.toBold());

      guildData.isLoopActive = !guildData.isLoopActive;
      await message.react("🔁");
    } catch (error) {
      message.reply(ERROR_EXECUTION_ERROR.toBold());
      message.react("❗");
      logger.error(error);
    }
  },
};
