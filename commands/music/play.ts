import Discord, { Command, GuildData, Message } from "discord.js";
import ytdl from "ytdl-core";
import ytsr from "ytsr";
import { RESUMING, ERROR_COMMAND_NOT_VALID } from "../../constants/messages";
import { logger } from "../../global/globals";
import {
  checkVoiceChannelAvailability,
  checkUserInAChannel,
} from "../../util/checker";
import { connectToVoiceChannel, fetchGuildData } from "../../util/guildActions";

export = <Command>{
  name: "play",
  aliases: ["p", "paly"],
  description: "Play a song with the given url or query from youtube.",
  usage: " [URL/query]",
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
      const dispatcher = guildData.connection?.dispatcher;
      if (!args[1] && dispatcher?.paused) {
        guildData.connection.dispatcher.resume();
        return message.channel.send(RESUMING.toBold());
      }

      const commandContent = args[1];

      const song = await fetchSong(commandContent);
      if (!song) return message.channel.send("Nothing found.");

      if (guildData.isQueueActive) {
        const estimatedTime = calculateEta(
          guildData.songs,
          guildData.lastTrackStart
        );
        guildData.songs.push(song);
        const embed = new Discord.MessageEmbed()
          .setColor("#222222")
          .setAuthor("Added to the Queue")
          .setTitle(song.title)
          .setThumbnail(song.thumbnailUrl)
          .setDescription(
            song.desc.length > 100 ? song.desc.slice(0, 100) + "..." : song.desc
          )
          .addField("Channel", song.channel, true)
          .addField("Duration", song.duration, true)
          .addField("ETA", estimatedTime, true)
          .addField("Position in queue", guildData.songs.indexOf(song));
        return message.channel.send(embed);
      }

      guildData.songs.push(song);
      guildData.isQueueActive = true;
      await connectToVoiceChannel(guildData);
      play(message, guildData);
    } catch (error) {
      logger.error(error);
      message.reply(ERROR_COMMAND_NOT_VALID);
    }
  },
};

const play = async (message: Message, guildData: GuildData) => {
  const currentSong = guildData.songs[0];
  const embed = new Discord.MessageEmbed()
    .setColor("#222222")
    .setAuthor("Now Playing 🎶")
    .setTitle(currentSong.title)
    .setThumbnail(currentSong.thumbnailUrl)
    .setDescription(
      currentSong.desc.length > 100
        ? currentSong.desc.slice(0, 100) + "..."
        : currentSong.desc
    )
    .addField("Channel", currentSong.channel, true)
    .addField("Duration", currentSong.duration, true);

  let responseMessage: Message;
  try {
    responseMessage = await message.channel.send(embed);
    const dispatcher = guildData.connection
      .play(
        ytdl(currentSong.url, { filter: "audioonly", highWaterMark: 1 << 25 })
      )
      .on("start", () => {
        guildData.lastTrackStart = Date.now();
        logger.info(
          `Play ::: ${currentSong.url} @${message.guild.name}<${message.guild.id}>`
        );
      })
      .on("skip", () => {
        if (!dispatcher.paused) dispatcher.emit("finish");
        else guildData.songs.shift();
      })
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
        responseMessage.delete();
        guildData.songs.shift();
        if (guildData.songs.length === 0) guildData.isQueueActive = false;
        else play(message, guildData);
      })
      .on("error", (error) => logger.error(error));
    dispatcher.setVolumeLogarithmic(0.15);
  } catch (error) {
    responseMessage.delete();
    logger.error(error);
  }
};

const fetchSong = async (commandContent: string): Promise<Song> => {
  let song: Song;
  const regexUrl = new RegExp(
    `(http(s)?:\\/\\/.)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&\\/\\/=]*)`
  );

  if (regexUrl.test(commandContent)) {
    const url = regexUrl.exec(commandContent)[0];
    const songInfo: ytdl.videoInfo = await ytdl.getInfo(url);
    song = {
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url,
      thumbnailUrl: songInfo.videoDetails.thumbnails[0].url,
      desc: songInfo.videoDetails.description || "",
      channel: songInfo.videoDetails.author.name,
      duration: hhmmss(parseInt(songInfo.videoDetails.lengthSeconds)),
    };
  } else {
    const searchQuery = commandContent;
    const filters = await ytsr.getFilters(searchQuery);
    const filter = filters.get("Type").get("Video");
    if (!filter.url) return null;

    const songInfo: ytsr.Result = await ytsr(filter.url, {
      limit: 1,
    });
    song = {
      title: (<ytsr.Video>songInfo.items[0]).title,
      url: (<ytsr.Video>songInfo.items[0]).url,
      thumbnailUrl: (<ytsr.Video>songInfo.items[0]).thumbnails[0].url,
      desc: (<ytsr.Video>songInfo.items[0]).description || "",
      channel: (<ytsr.Video>songInfo.items[0]).author.name,
      duration: (<ytsr.Video>songInfo.items[0]).duration,
    };
  }
  return song;
};

// convert seconds to hh:mm:ss
const hhmmss = (durationInSeconds: number): string => {
  const hours = Math.trunc(durationInSeconds / 3600);
  const minutes = Math.trunc((durationInSeconds % 3600) / 60);
  const seconds = Math.trunc(durationInSeconds % 60);

  const fHours: string = hours > 0 ? hours + ":" : "";
  const fMinutes: string =
    (hours > 0 ? `${minutes}`.padStart(2, "0") : minutes) + ":";
  const fSeconds: string = `${seconds}`.padStart(2, "0");

  return fHours + fMinutes + fSeconds;
};

// convert hh:mm:ss to seconds
const hhmmssToSeconds = (durationString: string): number => {
  const sections: string[] = durationString.split(":").reverse();
  const parsedSections: number[] = sections.map((section) => parseInt(section));

  let eta = 0;
  if (parsedSections[0]) eta += parsedSections[0];
  if (parsedSections[1]) eta += parsedSections[1] * 60;
  if (parsedSections[2]) eta += parsedSections[2] * 3600;
  return eta;
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
