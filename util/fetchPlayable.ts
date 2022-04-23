import { Message } from "discord.js";
import ytdl from "ytdl-core";
import ytpl from "ytpl";
import sptf from "spotify-url-info";
import { hhmmss } from "./durationParser";
import ytsr from "ytsr";

export const fetchPlayable = async (
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
