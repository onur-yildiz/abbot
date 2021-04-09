import { Command, Message } from "discord.js";
import {
  TEST_COMMAND_NOT_VALID,
  TEST_EXECUTION_ERROR,
} from "../../constants/messages";
import { checkAvailability } from "../../util/checkAvailability";
import { connect } from "../../util/connect";
import { getCommandContent } from "../../util/getCommandContent";
import { getOrInitQueue } from "../../util/getOrInitQueue";

export = <Command>{
  name: "horn",
  aliases: ["h", "say"],
  description: "Play a sound. Ex. [~horn ww].",
  usage: "[audioName]",
  guildOnly: true,
  async execute(message: Message) {
    const error = checkAvailability(message);
    if (error) return message.channel.send(error.toBold());

    const commandContent = getCommandContent(message.content);
    const queueContract = getOrInitQueue(
      message.guild,
      message.channel,
      message.member.voice.channel
    );

    if (queueContract.playing)
      return message.channel.send(
        `I am already playing music.\nYou have to clear song queue to play audio.`.toBold()
      );

    // TODOimplement your own.
    //! excluded in public repo.
    //const audioPath = pickAudioPath()
    const audioPath = "https://www.youtube.com/watch?v=PRc2vx4xTVM";

    try {
      await connect(queueContract);
      const dispatcher = queueContract.connection
        .play(audioPath)
        .on("finish", () => {})
        .on("error", (error) => console.error(error));
      dispatcher.setVolumeLogarithmic(queueContract.volume);
      message.channel.send(`Playing **${commandContent}**`);
    } catch (error) {
      console.error(error);
      message.reply(TEST_EXECUTION_ERROR);
    }
  },
};

// https://www.myinstants.com/instant/hiko-dri-90536/
// https://www.myinstants.com/instant/savage-fap/
// https://www.myinstants.com/instant/yazik-kafana-45948/
// https://www.myinstants.com/instant/neyi-basaramadin-1365/
// puh sonmez reis
