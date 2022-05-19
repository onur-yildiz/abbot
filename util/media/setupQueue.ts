import { GuildData, MessageEmbed } from "discord.js";
import dp from "../parser/durationParser";

const setupQueue = (
  guildData: GuildData,
  playable: Playable,
  { insertAtBeginning = false } = {}
): MessageEmbed | null => {
  const addSongsToQueue = () => {
    if (insertAtBeginning) guildData.songs.splice(1, 0, ...playable.songs);
    else guildData.songs.push(...playable.songs);
  };

  if (guildData.isQueueActive) {
    const estimatedTime = calculateEta(
      guildData.songs,
      guildData.lastTrackStart
    );
    let embed: MessageEmbed;
    addSongsToQueue();
    if (playable.songs.length === 1) {
      const song = playable.songs[0];
      // no need for a message if we're inserting just one track at the beginning.
      // there will be a "now playing" message already.
      embed = insertAtBeginning
        ? null
        : generateAddedToQueueEmbed(song, guildData.songs, estimatedTime);
    } else {
      embed = generatePlaylistEmbed(playable);
    }
    return embed;
  }

  addSongsToQueue();
  if (playable.songs.length > 1) return generatePlaylistEmbed(playable);
  return null;
};

const calculateEta = (songs: Song[], lastTrackStart: number): string => {
  let etaInSeconds = 0;
  songs.forEach((song, index) => {
    if (index === 0) {
      const passedTime = Date.now() - lastTrackStart;
      etaInSeconds += dp.hhmmssToSeconds(song.duration) - passedTime / 1000;
    } else etaInSeconds += dp.hhmmssToSeconds(song.duration);
  });
  return dp.hhmmss(etaInSeconds);
};

const generatePlaylistEmbed = (playable: Playable): MessageEmbed => {
  let seconds = 0;
  playable.songs.forEach(
    (song) => (seconds += dp.hhmmssToSeconds(song.duration))
  );
  const duration = dp.hhmmss(seconds);
  return new MessageEmbed()
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
  return new MessageEmbed()
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

export default setupQueue;
