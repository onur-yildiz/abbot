import fs from "fs";
import { Command, Message } from "discord.js";
import {
  HORN_PLAYING_MUSIC,
  ERROR_EXECUTION_ERROR,
} from "../../constants/messages";
import { checkUserInAChannel } from "../../util/checkUserInAChannel";
import { connect } from "../../util/connect";
import { getAndUpdateGuildData } from "../../util/getAndUpdateGuildData";
import { urlReachable } from "../../util/urlReachable";
import { getDefaultAudios } from "../../util/getDefaultAudios";

export = <Command>{
  name: "horn",
  aliases: ["h", "say"],
  description: "Play a sound. Ex. [~horn ww].",
  usage: "[audio name]",
  guildOnly: true,
  args: Args.required,
  async execute(message: Message, args: string[]) {
    const error = checkUserInAChannel(message);
    if (error) return message.channel.send(error.toBold());

    const commandContent = args[1];
    const guildData = getAndUpdateGuildData(
      message.guild,
      message.channel,
      message.member.voice.channel
    );

    if (guildData.queueActive)
      return message.channel.send(HORN_PLAYING_MUSIC.toBold());

    try {
      let audioPath = "";
      const audios = getDefaultAudios();
      if (audios.includes(`${commandContent}`))
        audioPath = `./assets/audio/${commandContent}`;
      else if (guildData.audioAliases.has(commandContent)) {
        audioPath = guildData.audioAliases.get(commandContent);
        if (!(await urlReachable(audioPath))) return;
      } else {
        return message.reply(
          "No audio named " +
            `${commandContent}`.toInlineCodeBg() +
            " was found."
        );
      }

      console.log(audioPath);
      await connect(guildData);
      const dispatcher = guildData.connection
        .play(audioPath)
        .on("finish", () => {})
        .on("error", (error) => console.error(error));
      dispatcher.setVolumeLogarithmic(guildData.volume);
      await message.react("✅");
    } catch (error) {
      console.error(error);
      message.reply(ERROR_EXECUTION_ERROR);
    }
  },
};
