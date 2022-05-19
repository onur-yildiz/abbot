import { Command, Message } from "discord.js";
import { ERROR_EXECUTION_ERROR } from "../../constants/messages";
import { logger } from "../../global/globals";

import c from "../../util/checker";
import fetchGuildData from "../../util/fetchGuildData";
import fetchPlayable from "../../util/media/fetchPlayable";
import play from "../../util/media/play";
import setupQueue from "../../util/media/setupQueue";

export = <Command>{
  name: "playnow",
  aliases: ["pn"],
  description:
    "Plays a song/playlist with the given URL or query from youtube right away. Pushes existing queue items to the end. (Playlists only work through links). Spotify links are accepted.",
  usage: "[URL/query]",
  isGuildOnly: true,
  args: Args.required,
  async execute(message: Message, args: string[]) {
    try {
      const guildData = await fetchGuildData(
        message.guild,
        message.channel,
        message.member.voice.channel
      );

      const error = guildData.isQueueActive
        ? c.isVoiceChannelAvailable(message)
        : c.isUserInAChannel(message);
      if (error) return message.channel.send(error.toBold());

      const query = args.slice(1).join(" ");
      const playable: Playable = await fetchPlayable(query, message);
      if (!playable || playable.songs.length === 0)
        return message.channel.send("Nothing found.");

      const embeddedMessage = setupQueue(guildData, playable, {
        insertAtBeginning: true,
      });
      embeddedMessage && message.channel.send(embeddedMessage);

      if (guildData.isQueueActive) {
        const dispatcher = guildData.connection.dispatcher;
        dispatcher.emit("skip");
        if (dispatcher.paused) dispatcher.emit("resume");
      } else {
        await guildData.connectToVoice();
        guildData.isQueueActive = true;
        play(message, guildData, 0);
      }
    } catch (error) {
      message.reply(ERROR_EXECUTION_ERROR.toBold());
      message.react("❗");
      logger.error(error.message);
    }
  },
};
