import { GuildData, Message, MessageEmbed } from "discord.js";
import ytdl from "ytdl-core";
import { logger } from "../../global/globals";

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

export default play;
