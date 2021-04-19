import { Command, Message } from "discord.js";
import {
  HORN_PLAYING_MUSIC,
  ERROR_EXECUTION_ERROR,
} from "../../constants/messages";
import { urlReachable } from "../../util/urlReachable";
import DBHelper from "../../db/dbHelper";
import getDefaultAudios from "../../util/getDefaultAudios";
import { checkUserInAChannel } from "../../util/checker";
import { connectToVoiceChannel, fetchGuildData } from "../../util/guildActions";

export = <Command>{
  name: "horn",
  aliases: ["h", "say"],
  description: "Play a sound.",
  usage: "[audio name]",
  guildOnly: true,
  args: Args.required,
  argList: getDefaultAudios(),
  async execute(message: Message, args: string[]) {
    const error = checkUserInAChannel(message);
    if (error) return message.channel.send(error.toBold());

    const commandContent = args[1];
    try {
      const guildData = await fetchGuildData(
        message.guild,
        message.channel,
        message.member.voice.channel
      );

      if (guildData.queueActive)
        return message.channel.send(HORN_PLAYING_MUSIC.toBold());

      let audioPath = "";
      const audios = getDefaultAudios();
      if (audios.includes(`${commandContent}`))
        audioPath = `./assets/audio/${commandContent}.mp3`;
      else {
        const guildSettings = await DBHelper.getGuildSettings(message.guild, {
          [`audioAliases.${commandContent}`]: 1,
        });
        if (guildSettings.audioAliases.has(commandContent)) {
          audioPath = guildSettings.audioAliases.get(commandContent);
          if (!(await urlReachable(audioPath))) return;
        } else {
          return message.reply(
            "No audio named " +
              `${commandContent}`.toInlineCodeBg() +
              " was found."
          );
        }
      }

      console.log(audioPath);
      await connectToVoiceChannel(guildData);
      const r = await message.react("📣");
      const dispatcher = guildData.connection
        .play(audioPath)
        .on("finish", () => {
          r.remove();
        })
        .on("error", (error) => console.error(error));
      dispatcher.setVolumeLogarithmic(guildData.volume);
    } catch (error) {
      console.error(error);
      message.reply(ERROR_EXECUTION_ERROR);
    }
  },
};
