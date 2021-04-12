import { VoiceState } from "discord.js";
import { getAndUpdateGuildData } from "../util/getAndUpdateGuildData";
import { initGuildData } from "../util/initGuildData";

export const greetUserInVoiceChannel = async (
  oldVoiceState: VoiceState,
  newVoiceState: VoiceState
) => {
  try {
    if (
      newVoiceState.member.user.bot ||
      newVoiceState.channelID == null ||
      newVoiceState.channelID == oldVoiceState.channelID
    ) {
      return;
    }
    const guildData = await initGuildData(
      newVoiceState.member.guild,
      newVoiceState.member.voice.channel
    );
    // const guildData = getAndUpdateGuildData(
    //   newVoiceState.member.guild,
    //   null,
    //   newVoiceState.member.voice.channel
    // );
    if (guildData.queueActive || !guildData.greetingEnabled) {
      return;
    }

    const connection = await newVoiceState.channel.join();
    const dispatcher = connection
      .play("./assets/audio/ww.mp3")
      .on("finish", () => {
        connection.disconnect();
      })
      .on("error", (error) => console.error(error));
    dispatcher.setVolumeLogarithmic(1);
  } catch (error) {
    console.error(error);
  }
};
