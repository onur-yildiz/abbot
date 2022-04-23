import Discord, { Command, GuildData, Message, MessageEmbed } from "discord.js";
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
import { hhmmss, hhmmssToSeconds } from "../../util/durationParser";
import { fetchPlayable } from "../../util/fetchPlayable";

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

      if (guildData.isQueueActive) {
        const estimatedTime = calculateEta(
          guildData.songs,
          guildData.lastTrackStart
        );
        let embed: MessageEmbed;
        guildData.songs.push(...playable.songs);
        if (playable.songs.length === 1) {
          const song = playable.songs[0];
          embed = generateAddedToQueueEmbed(
            song,
            guildData.songs,
            estimatedTime
          );
        } else {
          embed = generatePlaylistEmbed(playable);
        }
        return message.channel.send(embed);
      }

      guildData.songs.push(...playable.songs);
      if (playable.songs.length > 1)
        message.channel.send(generatePlaylistEmbed(playable));

      guildData.isQueueActive = true;
      await connectToVoiceChannel(guildData);
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
  const embed = new Discord.MessageEmbed()
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

const calculateEta = (songs: Song[], lastTrackStart: number): string => {
  let etaInSeconds = 0;
  songs.forEach((song, index) => {
    if (index === 0) {
      const passedTime = Date.now() - lastTrackStart;
      etaInSeconds += hhmmssToSeconds(song.duration) - passedTime / 1000;
    } else etaInSeconds += hhmmssToSeconds(song.duration);
  });
  return hhmmss(etaInSeconds);
};

const generatePlaylistEmbed = (playable: Playable): MessageEmbed => {
  let seconds = 0;
  playable.songs.forEach((song) => (seconds += hhmmssToSeconds(song.duration)));
  const duration = hhmmss(seconds);
  return new Discord.MessageEmbed()
    .setColor("#FFD700")
    .setAuthor(`Playlist of ${playable.songs.length} songs added to the Queue`)
    .setTitle(playable.playlist.title)
    .setURL(playable.playlist.url)
    .setThumbnail(playable.playlist.thumbnailUrl)
    .setDescription(
      playable.playlist.desc.length > 100
        ? playable.playlist.desc.slice(0, 100) + "..."
        : playable.playlist.desc
    )
    .addField("Channel", playable.playlist.channel, true)
    .addField("Duration", duration, true);
};

const generateAddedToQueueEmbed = (
  song: Song,
  songQueue: Song[],
  estimatedTime: string
): MessageEmbed => {
  return new Discord.MessageEmbed()
    .setColor("#FFD700")
    .setAuthor("Added to the Queue")
    .setTitle(song.title)
    .setThumbnail(song.thumbnailUrl)
    .setDescription(
      song.desc.length > 100 ? song.desc.slice(0, 100) + "..." : song.desc
    )
    .setURL(song.url)
    .addField("Channel", song.channel, true)
    .addField("Duration", song.duration, true)
    .addField("ETA", estimatedTime, true)
    .addField("Position in queue", songQueue.indexOf(song));
};
