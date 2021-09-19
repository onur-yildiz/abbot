import Discord, {
  CollectorFilter,
  Command,
  Message,
  MessageReaction,
  User,
} from "discord.js";

import { ERROR_EXECUTION_ERROR, QUEUE_EMPTY } from "../../constants/messages";
import { logger } from "../../global/globals";
import { checkVoiceChannelAvailability } from "../../util/checker";
import { fetchGuildData } from "../../util/guildActions";

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
        value: `${currentSong.duration} • ${currentSong.channel} • [🔗](${currentSong.url})`,
      });
      guildData.songs.slice(1).forEach((song, index) =>
        queue.push({
          name: `${index + 1}: ${song.title}`,
          value: `${song.duration} • ${song.channel} • [🔗](${song.url})`,
        })
      );

      const createQueueEmbed = (page: number) => {
        return new Discord.MessageEmbed()
          .setColor("#FFD700")
          .setTitle("Queue" + (guildData.isLoopActive ? " 🔁" : ""))
          .setThumbnail(guildData.songs[0].thumbnailUrl)
          .addFields(queue.slice((page - 1) * 6, page * 6))
          .setFooter(`${page}/${Math.ceil(queue.length / 6)}`)
          .setTimestamp();
      };

      let page: number = 1;
      let embed = createQueueEmbed(page);
      const responseMessage = await message.channel.send(embed);
      let rprev: MessageReaction = await responseMessage.react("⬅");
      let rnext: MessageReaction = await responseMessage.react("➡");

      const filter: CollectorFilter = (reaction: MessageReaction, user: User) =>
        (reaction.emoji.name === "➡" || reaction.emoji.name === "⬅") &&
        user.id === message.author.id;
      const options = { time: 60000 };
      const collector = responseMessage.createReactionCollector(
        filter,
        options
      );

      collector.on("collect", async (reaction: MessageReaction, user: User) => {
        if (reaction.emoji.name === "➡") {
          rnext?.users.remove(user.id);
          if (Math.ceil(queue.length / 6) === page) return;
          page++;
          responseMessage.edit(createQueueEmbed(page));
        } else if (reaction.emoji.name === "⬅") {
          rprev?.users.remove(user.id);
          if (page === 1) return;
          page--;
          responseMessage.edit(createQueueEmbed(page));
        }
      });

      collector.on("end", () => {
        if (!responseMessage.deleted) {
          rnext?.remove();
          rprev?.remove();
        }
      });
    } catch (error) {
      message.reply(ERROR_EXECUTION_ERROR.toBold());
      message.react("❗");
      logger.error(error.message);
    }
  },
};
