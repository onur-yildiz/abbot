import Discord, { Command, Message } from "discord.js";

import { QUEUE_EMPTY } from "../../constants/messages";
import { checkAvailability } from "../../util/checkAvailability";
import { getAndUpdateGuildData } from "../../util/getAndUpdateGuildData";

export = <Command>{
  name: "queue",
  aliases: ["q", "quit"],
  description: "Show the song queue.",
  usage: "",
  args: Args.none,
  guildOnly: true,
  execute(message: Message) {
    const error = checkAvailability(message);
    if (error) return message.channel.send(error.toBold());

    const guildData = getAndUpdateGuildData(
      message.guild,
      message.channel,
      message.member.voice.channel
    );

    if (guildData.songs.length == 0)
      return message.channel.send(QUEUE_EMPTY.toBold());

    let queue = [];
    guildData.songs.forEach((song, index) =>
      queue.push({
        name: `${index + 1}: ${song.title}`,
        value: `${song.author}`,
      })
    );
    const embed = new Discord.MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Queue")
      .setThumbnail(guildData.songs[0].thumbnailUrl)
      .addFields(...queue)
      .setTimestamp();
    message.channel.send(embed);
  },
};
