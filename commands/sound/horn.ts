import { Command, Message } from "discord.js";
import {
  HORN_PLAYING_MUSIC,
  ERROR_EXECUTION_ERROR,
} from "../../constants/messages";
// import { isAudioOk } from "../../util/isAudioOk";
import DBHelper from "../../db/DBHelper";
import getDefaultAudios from "../../util/getDefaultAudios";
import { checkUserInAChannel } from "../../util/checker";
import { connectToVoiceChannel, fetchGuildData } from "../../util/guildActions";
import { logger } from "../../global/globals";

export = <Command>{
  name: "horn",
  aliases: ["h", "say"],
  description: "Play a sound.",
  usage: "[horn alias]",
  isGuildOnly: true,
  args: Args.flexible,
  argList: getDefaultAudios(),
  async execute(message: Message, args: string[]) {
    const error = checkUserInAChannel(message);
    if (error) return message.channel.send(error.toBold());

    try {
      const guildData = await fetchGuildData(
        message.guild,
        message.channel,
        message.member.voice.channel
      );

      if (guildData.isQueueActive)
        return message.channel.send(HORN_PLAYING_MUSIC.toBold());

      let audioAlias: AudioAlias = { name: "", url: "" };
      audioAlias.name = args[1];
      if (!args[1]) {
        const guildSettings = await DBHelper.getGuildSettings(message.guild, {
          audioAliases: 1,
        });

        audioAlias =
          guildSettings.audioAliases[
            Math.trunc(Math.random() * (guildSettings.audioAliases.length - 1))
          ];
      } else {
        const audios = getDefaultAudios();
        if (audios.includes(`${audioAlias.name}`))
          audioAlias.url = `./assets/audio/${audioAlias.name}.mp3`;
        else {
          const guildSettings = await DBHelper.getGuildSettings(message.guild, {
            audioAliases: { $elemMatch: { name: audioAlias.name } },
          });
          if (
            guildSettings.audioAliases.some(
              (element) => element.name == audioAlias.name
            )
          ) {
            audioAlias = guildSettings.audioAliases.find(
              (element) => element.name == audioAlias.name
            );
            // if (!(await isAudioOk(audioAlias.url))) {
            //   logger.info(
            //     `Saved audio not OK anymore ::: ${audioAlias.name}: ${audioAlias.url} @${message.guild.name}<${message.guild.id}>`
            //   );
            //   return;
            // }
          } else {
            return message.reply(
              "No audio named " +
                `${audioAlias.name}`.toInlineCodeBg() +
                " was found."
            );
          }
        }
      }

      logger.info(
        `Horn ::: ${audioAlias.name}: ${audioAlias.url} @${message.guild.name}<${message.guild.id}>`
      );
      guildData.connection?.dispatcher?.end();
      if (guildData.connection?.channel !== message.member.voice?.channel)
        await connectToVoiceChannel(guildData);
      const r = await message.react("📣");
      const dispatcher = guildData.connection
        ?.play(audioAlias.url)
        .on("finish", () => {
          r.remove();
        })
        .on("error", (error) => logger.error(error));
      dispatcher?.setVolumeLogarithmic(guildData.volume);
    } catch (error) {
      logger.error(error);
      message.reply(ERROR_EXECUTION_ERROR);
    }
  },
};
