import { Command, Message } from "discord.js";
import {
  NOTHING_TO_PLAY,
  ERROR_EXECUTION_ERROR,
} from "../../constants/messages";
import { logger } from "../../global/globals";
import fetchPlayable from "../../util/media/fetchPlayable";
import setupQueue from "../../util/media/setupQueue";
import play from "../../util/media/play";

import c from "../../util/checker";
import fetchGuildData from "../../util/fetchGuildData";

export = <Command>{
  name: "play",
  aliases: ["p", "paly"],
  description:
    "Play a song/playlist with the given URL or query from youtube (Playlists only work through links). Spotify links are accepted." +
    "\nBeware! Spotify tracks are searched through Youtube. It may not work perfectly",
  usage: "[URL/query]",
  isGuildOnly: true,
  args: Args.flexible,
  cooldown: 1,
  async execute(message: Message, args?: string[]) {
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

      //resume if paused
      // ! dispatcher.resume() works correctly only on node v14.16.1 for discordjs 12.5
      const dispatcher = guildData.connection?.dispatcher;
      if (!args[1] && dispatcher?.paused) {
        dispatcher.resume();
        // return message.channel.send(RESUMING.toBold());
        return message.react("⏯");
      }

      const query = args.slice(1).join(" ");
      if (!query && !guildData.isQueueActive)
        return message.reply(NOTHING_TO_PLAY.toBold());

      const playable: Playable = await fetchPlayable(query, message);
      if (!playable || playable.songs.length === 0)
        return message.channel.send("Nothing found.");

      const embeddedMessage = setupQueue(guildData, playable);
      embeddedMessage && message.channel.send(embeddedMessage);
      if (!guildData.isQueueActive) {
        await guildData.connectToVoice();
        guildData.isQueueActive = true;
        play(message, guildData);
      }
    } catch (error) {
      logger.error(error.message);
      message.reply(ERROR_EXECUTION_ERROR);
    }
  },
};
