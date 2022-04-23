import { Command, GuildData, Message, MessageEmbed } from "discord.js";
import ytdl from "ytdl-core";
import {
  NOTHING_TO_PLAY,
  ERROR_EXECUTION_ERROR,
} from "../../constants/messages";
import { logger } from "../../global/globals";
import {
  checkVoiceChannelAvailability,
  checkUserInAChannel,
} from "../../util/checker";
import { connectToVoiceChannel, fetchGuildData } from "../../util/guildActions";
import { fetchPlayable } from "../../util/fetchPlayable";
import { setupQueue } from "../../util/setupQueue";

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
        ? checkVoiceChannelAvailability(message)
        : checkUserInAChannel(message);
      if (error) return message.channel.send(error.toBold());

      //resume if paused
      // ! dispatcher.resume() works correctly only on node v14.16.1 for discordjs 12.5
      const dispatcher = guildData.connection?.dispatcher;
      if (!args[1] && dispatcher?.paused) {
        dispatcher.resume();
        // return message.channel.send(RESUMING.toBold());
        return message.react("⏯");
      }

      const commandContent = args[1];
      if (!commandContent && !guildData.isQueueActive)
        return message.reply(NOTHING_TO_PLAY.toBold());

      const playable: Playable = await fetchPlayable(commandContent, message);
      if (!playable || playable.songs.length === 0)
        return message.channel.send("Nothing found.");

      const embeddedMessage = setupQueue(guildData, playable);
      embeddedMessage && message.channel.send(embeddedMessage);
      if (!guildData.isQueueActive) {
        await connectToVoiceChannel(guildData);
        guildData.isQueueActive = true;
      }
      play(message, guildData);
    } catch (error) {
      logger.error(error.message);
      message.reply(ERROR_EXECUTION_ERROR);
    }
  },
};

const play = async (
  message: Message,
  guildData: GuildData,
  seekedSecond: number = 0,
  startPaused: boolean = false
) => {
  const currentSong = guildData.songs[0];
  const embed = new MessageEmbed()
    .setColor("#FFD700")
    .setAuthor("Now Playing 🎶")
    .setTitle(currentSong.title)
    .setThumbnail(currentSong.thumbnailUrl)
    .setDescription(
      currentSong.desc.length > 100
        ? currentSong.desc.slice(0, 100) + "..."
        : currentSong.desc
    )
    .setURL(currentSong.url)
    .addField("Channel", currentSong.channel, true)
    .addField("Duration", currentSong.duration, true);

  let responseMessage: Message;
  try {
    if (seekedSecond === 0) responseMessage = await message.channel.send(embed);
    const dispatcher = guildData.connection
      .play(
        ytdl(currentSong.url, {
          filter: "audioonly",
          highWaterMark: 1 << 25,
          dlChunkSize: 1 << 25,
          quality: "highestaudio",
        }),
        { seek: seekedSecond }
      )
      .on("start", () => {
        if (seekedSecond === 0) guildData.lastTrackStart = Date.now();
        else guildData.lastTrackStart = Date.now() - seekedSecond * 1000;
        logger.info(
          `Play ::: ${currentSong.url} @${message.guild.name}<${message.guild.id}>`
        );
      })
      .on("skip", () => {
        dispatcher.emit("finish");
      })
      .on("seek", (seconds: number) => {
        if (dispatcher.paused) play(message, guildData, seconds, true);
        else play(message, guildData, seconds);
      })
      // ! dispatcher.resume() works correctly only on node v14.16.1 for discordjs 12.5
      .on("resume", () => {
        if (guildData.songs.length === 0) {
          guildData.isQueueActive = false;
          // if currentSong is not skipped, resume.
        } else if (currentSong === guildData.songs[0]) {
          dispatcher.resume();
        } else {
          responseMessage.delete();
          play(message, guildData);
        }
      })
      .on("finish", () => {
        responseMessage?.delete();
        if (guildData.isLoopActive) guildData.songs.push(guildData.songs[0]);
        guildData.songs.shift();
        if (guildData.songs.length === 0) guildData.isQueueActive = false;
        else play(message, guildData);
      })
      .on("error", (error) => {
        responseMessage?.edit("Couldn't play the song. Skipping...");
        if (guildData.isLoopActive) guildData.songs.push(guildData.songs[0]);
        guildData.songs.shift();
        if (guildData.songs.length === 0) guildData.isQueueActive = false;
        else play(message, guildData);
        logger.error(error.message);
      });
    dispatcher.setVolumeLogarithmic(0.65);
    if (startPaused) dispatcher.pause();
  } catch (error) {
    responseMessage.delete();
    logger.error(error.message);
  }
};
