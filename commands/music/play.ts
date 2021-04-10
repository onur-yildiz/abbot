import { Command, Message } from "discord.js";
import ytdl from "ytdl-core";
import ytsr from "ytsr";
import { TEST_COMMAND_NOT_VALID } from "../../constants/messages";
import { checkUserInAChannel } from "../../util/checkUserInAChannel";
import { connect } from "../../util/connect";
import { getCommandContent } from "../../util/getCommandContent";
import { getOrInitQueue } from "../../util/getOrInitQueue";

export = <Command>{
  name: "play",
  aliases: ["p", "paly"],
  description: "Play a song from youtube. URLs and search queries accepted.",
  usage: " [URL || query]",
  guildOnly: true,
  execute: async function execute(message: Message) {
    const error = checkUserInAChannel(message);
    if (error) return message.channel.send(error.toBold());

    const commandContent = getCommandContent(message.content);
    const queueContract = getOrInitQueue(
      message.guild,
      message.channel,
      message.member.voice.channel
    );

    const song = await fetchSong(commandContent);
    // if (song == null) {
    //   queueContract.voiceChannel.leave();
    //   deleteQueue(message);
    //   return null;
    // }

    if (queueContract.playing) {
      queueContract.songs.push(song);
      console.log(queueContract.songs);
      return message.channel.send(`Added to queue\n${song.title}`.toCodeBg());
    }

    queueContract.songs.push(song);
    queueContract.playing = true;
    await connect(queueContract);

    try {
      const dispatcher = queueContract.connection
        .play(ytdl(queueContract.songs[0].url))
        .on("finish", () => {
          responseMessage.delete();
          queueContract.songs.shift();
          message.content = "";
          if (queueContract.songs.length == 0) queueContract.playing = false;
          else execute(message);
        })
        .on("error", (error) => console.error(error));
      dispatcher.setVolumeLogarithmic(queueContract.volume);
      const responseMessage = await message.channel.send(
        `css\n[Playing]\n${song.title}`.toCodeBg()
      );
    } catch (error) {
      console.error(error);
      message.reply(TEST_COMMAND_NOT_VALID);
    }
  },
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
