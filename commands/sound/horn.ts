import { Command, Message } from "discord.js";
import {
  HORN_PLAYING_MUSIC,
  ERROR_EXECUTION_ERROR,
} from "../../constants/messages";
import { isUrlReachable } from "../../util/isUrlReachable";
import DBHelper from "../../db/DBHelper";
import getDefaultAudios from "../../util/getDefaultAudios";
import { checkUserInAChannel } from "../../util/checker";
import { connectToVoiceChannel, fetchGuildData } from "../../util/guildActions";
import { logger } from "../../global/globals";

export = <Command>{
  name: "horn",
  aliases: ["h", "say"],
  description: "Play a sound.",
  usage: "[audio name]",
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

      let alias: string;
      let audioPath: string;
      if (!args[1]) {
        const guildSettings = await DBHelper.getGuildSettings(message.guild, {
          audioAliases: 1,
        });
        alias = [...guildSettings.audioAliases.keys()][
          Math.trunc(Math.random() * (guildSettings.audioAliases.size - 1))
        ];
        audioPath = guildSettings.audioAliases.get(alias);
      } else {
        alias = args[1];
        const audios = getDefaultAudios();
        if (audios.includes(`${alias}`))
          audioPath = `./assets/audio/${alias}.mp3`;
        else {
          const guildSettings = await DBHelper.getGuildSettings(message.guild, {
            [`audioAliases.${alias}`]: 1,
          });
          if (guildSettings.audioAliases.has(alias)) {
            audioPath = guildSettings.audioAliases.get(alias);
            if (!(await isUrlReachable(audioPath))) return;
          } else {
            return message.reply(
              "No audio named " + `${alias}`.toInlineCodeBg() + " was found."
            );
          }
        }
      }

      logger.info(
        `Horn ::: ${alias}: ${audioPath} @${message.guild.name}<${message.guild.id}>`
      );
      guildData.connection?.dispatcher?.end();
      await connectToVoiceChannel(guildData);
      const r = await message.react("📣");
      const dispatcher = guildData.connection
        .play(audioPath)
        .on("finish", () => {
          r.remove();
        })
        .on("error", (error) => logger.error(error));
      dispatcher.setVolumeLogarithmic(guildData.volume);
    } catch (error) {
      logger.error(error);
      message.reply(ERROR_EXECUTION_ERROR);
    }
  },
};
