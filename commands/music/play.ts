import Discord, { Command, GuildData, Message, MessageEmbed } from "discord.js";
import ytdl from "ytdl-core";
import ytsr from "ytsr";
import ytpl from "ytpl";
import sptf from "spotify-url-info";
import {
  RESUMING,
  NOTHING_TO_PLAY,
  ERROR_EXECUTION_ERROR,
} from "../../constants/messages";
import { logger } from "../../global/globals";
import {
  checkVoiceChannelAvailability,
  checkUserInAChannel,
} from "../../util/checker";
import { connectToVoiceChannel, fetchGuildData } from "../../util/guildActions";

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

const fetchPlayable = async (
  commandContent: string,
  message: Message
): Promise<Playable | null> => {
  let songs: Song[] = [];
  let playlist: Playlist;
  const regexSpotifyUrl = new RegExp(
    `(https?:\\/\\/)?(www\\.)?(open.spotify)\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&\\/\\/=]*)`
  );

  // prevent adding whole playlist if a song from playlist is being added. Thus checking for 'watch?v='
  if (ytpl.validateID(commandContent) && !commandContent.includes("watch?v=")) {
    const playlistData = await ytpl(commandContent);
    playlist = <Playlist>{
      title: playlistData.title,
      url: playlistData.url,
      thumbnailUrl: playlistData.bestThumbnail.url,
      desc: playlistData.description,
      channel: playlistData.author.name,
    };
    for (const item of playlistData.items) {
      songs.push(<Song>{
        title: item.title,
        url: item.shortUrl,
        thumbnailUrl: item.bestThumbnail.url,
        desc: "",
        channel: item.author.name,
        duration: item.duration,
      });
    }
  } else if (ytdl.validateURL(commandContent)) {
    const songInfo: ytdl.videoInfo = await ytdl.getInfo(commandContent);
    songs.push(<Song>{
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url,
      thumbnailUrl: songInfo.videoDetails.thumbnails[0].url,
      desc: songInfo.videoDetails.description || "",
      channel: songInfo.videoDetails.author.name,
      duration: hhmmss(parseInt(songInfo.videoDetails.lengthSeconds)),
    });
  } else {
    if (regexSpotifyUrl.test(commandContent)) {
      const tracks = await sptf.getTracks(commandContent);
      let infoMessage: Message;
      if (tracks.length > 15) {
        infoMessage = await message.channel.send("This may take some time...");
      }
      let requests: Promise<Song>[] = [];
      for (const track of tracks) {
        const artists: string[] = [];
        track.artists.forEach((artist) => artists.push(artist.name));
        const searchQuery: string = `${track.name} ${artists.join(" ")}`;
        const request = searchYoutube(searchQuery);
        requests.push(request);
      }
      for (const request of requests) songs.push(await request);
      if (infoMessage) await infoMessage.delete();

      playlist = <Playlist>{
        title: "Spotify Playlist",
        url: commandContent,
        thumbnailUrl:
          "https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_CMYK_Green.png",
        channel: "-",
        desc: "!!! BEWARE !!! Spotify tracks are searched through Youtube. It may not work perfectly.",
      };
    } else {
      const song = await searchYoutube(commandContent);
      if (song) songs.push(song);
    }
  }
  if (songs.length === 0) return null;
  return <Playable>{ songs: songs, playlist: playlist };
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

const searchYoutube = async (query: string): Promise<Song | null> => {
  const filters = await ytsr.getFilters(query);
  const filter = filters.get("Type").get("Video");
  if (!filter.url) return null;

  const songInfo: ytsr.Result = await ytsr(filter.url, {
    limit: 1,
  });
  return <Song>{
    title: (<ytsr.Video>songInfo.items[0]).title,
    url: (<ytsr.Video>songInfo.items[0]).url,
    thumbnailUrl: (<ytsr.Video>songInfo.items[0]).thumbnails[0].url,
    desc: (<ytsr.Video>songInfo.items[0]).description || "",
    channel: (<ytsr.Video>songInfo.items[0]).author.name,
    duration: (<ytsr.Video>songInfo.items[0]).duration,
  };
};
