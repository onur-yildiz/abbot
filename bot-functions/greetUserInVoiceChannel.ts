import { VoiceState } from "discord.js";
import { getUserSettings } from "../db/dbHelper";
import { initGuildData } from "../util/initGuildData";

const defaultTheme = "./assets/audio/ww.mp3";

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
    if (guildData.queueActive || !guildData.greetingEnabled) {
      return;
    }

    const guildId = newVoiceState.member.guild.id;
    const userSettings = await getUserSettings(newVoiceState.member.user, {
      [`themes.${guildId}`]: 1,
    });
    const theme = userSettings.themes.get(guildId);
    const connection = await newVoiceState.channel.join();
    const dispatcher = connection
      .play(theme ? theme : defaultTheme)
      .on("finish", () => {
        connection.disconnect();
      })
      .on("error", (error) => console.error(error));
    dispatcher.setVolumeLogarithmic(1);
  } catch (error) {
    console.error(error);
  }
};
