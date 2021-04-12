import fs from "fs";
import { Command, GuildData, Message } from "discord.js";
import { TEST_EXECUTION_ERROR } from "../../constants/messages";
import { checkUserInAChannel } from "../../util/checkUserInAChannel";
import { connect } from "../../util/connect";
import { getAndUpdateGuildData } from "../../util/getAndUpdateGuildData";
import { urlReachable } from "../../util/urlReachable";

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
      return message.channel.send(
        `I am already playing music.\nYou have to clear song queue to play audio.`.toBold()
      );

    try {
      let audioPath = "";
      const audios = fs.readdirSync("./assets/audio");
      if (audios.includes(`${commandContent}.mp3`))
        audioPath = `./assets/audio/${commandContent}.mp3`;
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
        .on("finish", () => {
          responseMessage.delete();
        })
        .on("error", (error) => console.error(error));
      dispatcher.setVolumeLogarithmic(guildData.volume);
      const responseMessage = await message.channel.send(
        `Playing **${commandContent}**`
      );
    } catch (error) {
      console.error(error);
      message.reply(TEST_EXECUTION_ERROR);
    }
  },
};
