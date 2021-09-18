import { Command, Message } from "discord.js";

import { ERROR_EXECUTION_ERROR, QUEUE_EMPTY } from "../../constants/messages";
import { logger } from "../../global/globals";
import { checkVoiceChannelAvailability } from "../../util/checker";
import { fetchGuildData } from "../../util/guildActions";

export = <Command>{
  name: "shuffle",
  aliases: ["mix", "shufflequeue"],
  description: "Shuffles the queue.",
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

      const songs = guildData.songs.slice(1);

      for (let i = songs.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = songs[i];
        songs[i] = songs[j];
        songs[j] = temp;
      }

      guildData.songs.splice(1, songs.length, ...songs);
      await message.react("🔀");
    } catch (error) {
      message.reply(ERROR_EXECUTION_ERROR.toBold());
      message.react("❗");
      logger.error(error);
    }
  },
};
