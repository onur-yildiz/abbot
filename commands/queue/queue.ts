import Discord, { Command, Message } from "discord.js";

import { ERROR_EXECUTION_ERROR, QUEUE_EMPTY } from "../../constants/messages";
import { logger } from "../../global/globals";
import { checkVoiceChannelAvailability } from "../../util/checker";
import { fetchGuildData } from "../../util/guildActions";
import { awaitDone } from "../../util/messageUtil";

export = <Command>{
  name: "queue",
  aliases: ["q", "quit"],
  description: "Show the song queue.",
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

      let queue = [];
      const currentSong = guildData.songs[0];
      queue.push({
        name: `:musical_note: Now Playing: ${currentSong.title}`,
        value: `${currentSong.duration} • ${currentSong.channel}`,
      });
      guildData.songs.slice(1).forEach((song, index) =>
        queue.push({
          name: `${index + 1}: ${song.title}`,
          value: `${song.duration} • ${song.channel}`,
        })
      );

      const embed = new Discord.MessageEmbed()
        .setColor("#222222")
        .setTitle("Queue")
        .setThumbnail(guildData.songs[0].thumbnailUrl)
        .addFields(...queue)
        .setTimestamp();
      const responseMessage = await message.channel.send(embed);
      awaitDone(responseMessage, message);
    } catch (error) {
      logger.error(ERROR_EXECUTION_ERROR);
    }
  },
};
