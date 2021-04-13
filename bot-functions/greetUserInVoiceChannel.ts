import { VoiceState } from "discord.js";
import { getUserSettings, saveUserSettings } from "../db/dbHelper";
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

    const theme = await getTheme(newVoiceState);
    const connection = await newVoiceState.channel.join();
    const dispatcher = connection
      .play(theme)
      .on("finish", () => {
        connection.disconnect();
      })
      .on("error", (error) => console.error(error));
    dispatcher.setVolumeLogarithmic(1);
  } catch (error) {
    console.error(error);
  }
};

const getTheme = async (voiceState: VoiceState) => {
  const guildId = voiceState.member.guild.id;
  const userSettings = await getUserSettings(voiceState.member.user, {
    [`themes.${guildId}`]: 1,
  });

  if (!userSettings || (userSettings && userSettings.themes.size === 0)) {
    await saveUserSettings(voiceState.member.user, {
      $set: { [`themes.${guildId}`]: defaultTheme },
    });
    return defaultTheme;
  } else return userSettings.themes.get(guildId);
};
