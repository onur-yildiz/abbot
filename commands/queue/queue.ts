import Discord, { Command, Message } from "discord.js";

import { QUEUE_EMPTY } from "../../constants/messages";
import { checkAvailability } from "../../util/checkAvailability";
import { getOrInitQueue } from "../../util/getOrInitQueue";

export = <Command>{
  name: "queue",
  aliases: ["q", "quit"],
  description: "Show the song queue.",
  usage: "",
  guildOnly: true,
  execute(message: Message) {
    const error = checkAvailability(message);
    if (error) return message.channel.send(error.toBold());

    const queueContract = getOrInitQueue(
      message.guild,
      message.channel,
      message.member.voice.channel
    );

    if (queueContract.songs.length == 0)
      return message.channel.send(QUEUE_EMPTY.toBold());

    let queue = [];
    queueContract.songs.forEach((song, index) =>
      queue.push({
        name: `${index + 1}: ${song.title}`,
        value: `${song.author}`,
      })
    );
    const embed = new Discord.MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Queue")
      .setThumbnail(queueContract.songs[0].thumbnailUrl)
      .addFields(...queue)
      .setTimestamp();
    message.channel.send(embed);
  },
};
