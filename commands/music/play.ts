import { Command, GuildData, Message } from "discord.js";
import ytdl from "ytdl-core";
import ytsr from "ytsr";
import { RESUMING, ERROR_COMMAND_NOT_VALID } from "../../constants/messages";
import { checkAvailability } from "../../util/checkAvailability";
import { checkUserInAChannel } from "../../util/checkUserInAChannel";
import { connect } from "../../util/connect";
import { getAndUpdateGuildData } from "../../util/getAndUpdateGuildData";

export = <Command>{
  name: "play",
  aliases: ["p", "paly"],
  description: "Play a song with the given url or query from youtube.",
  usage: " [URL/query]",
  guildOnly: true,
  args: Args.flexible,
  cooldown: 1,
  async execute(message: Message, args?: string[]) {
    const guildData = getAndUpdateGuildData(
      message.guild,
      message.channel,
      message.member.voice.channel
    );

    const error = guildData.queueActive
      ? checkAvailability(message)
      : checkUserInAChannel(message);
    if (error) return message.channel.send(error.toBold());

    //resume if paused
    const dispatcher = guildData.connection
      ? guildData.connection.dispatcher
      : null;
    if (!args[1] && dispatcher && dispatcher.paused) {
      guildData.connection.dispatcher.resume();
      return message.channel.send(RESUMING.toBold());
    }

    const commandContent = args[1];

    try {
      const song = await fetchSong(commandContent);

      if (guildData.queueActive) {
        guildData.songs.push(song);
        return message.channel.send(`Added to queue\n${song.title}`.toCodeBg()); // TODO EMBED
      }
      guildData.songs.push(song);
      guildData.queueActive = true;

      await connect(guildData);
      play(message, guildData);
    } catch (error) {
      console.error(error);
      message.reply(ERROR_COMMAND_NOT_VALID);
    }
  },
};

const play = async (message: Message, guildData: GuildData) => {
  const currentSong = guildData.songs[0];
  const dispatcher = guildData.connection
    .play(ytdl(currentSong.url))
    .on("start", () =>
      console.log(
        `Playing: ${currentSong.url} @${message.guild.name}<${message.guild.id}>`
      )
    )
    .on("skip", () => {
      if (!dispatcher.paused) dispatcher.emit("finish");
      else guildData.songs.shift();
    })
    .on("resume", () => {
      if (guildData.songs.length === 0) {
        guildData.queueActive = false;
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
      if (guildData.songs.length === 0) guildData.queueActive = false;
      else play(message, guildData);
    })
    .on("error", (error) => console.error(error));
  dispatcher.setVolumeLogarithmic(guildData.volume);
  const responseMessage = await message.channel.send(
    `css\n[Playing]\n${guildData.songs[0].title}`.toCodeBg() // TODO EMBED
  );
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
      desc: songInfo.videoDetails.description,
      author: songInfo.videoDetails.author.name,
    };
  } else {
    const searchQuery = commandContent;

    const filters = await ytsr.getFilters(searchQuery);

    const filter = filters.get("Type").get("Video");
    const songInfo: ytsr.Result = await ytsr(filter.url, {
      limit: 1,
    });
    song = {
      title: (<ytsr.Video>songInfo.items[0]).title,
      url: (<ytsr.Video>songInfo.items[0]).url,
      thumbnailUrl: (<ytsr.Video>songInfo.items[0]).thumbnails[0].url,
      desc: (<ytsr.Video>songInfo.items[0]).description,
      author: (<ytsr.Video>songInfo.items[0]).author.name,
    };
  }
  return song;
};
