import { VoiceState } from "discord.js";
import dbHelper from "../db/dbHelper";
import { isPermitted } from "../util/checker";
import {
  connectToVoiceChannel,
  fetchGuildData,
  resetQueue,
} from "../util/guildActions";

const defaultTheme = "./assets/audio/ww.mp3";

export const voiceStateUpdateHandler = async (
  oldVoiceState: VoiceState,
  newVoiceState: VoiceState
) => {
  try {
    const guild = newVoiceState.member.guild;
    let guildData = await fetchGuildData(
      guild,
      null,
      newVoiceState.member.voice.channel
    );
    if (newVoiceState.member.user.bot) {
      if (
        newVoiceState.guild.me.id === newVoiceState.member.id &&
        !newVoiceState.channel
      )
        resetQueue(guildData);
      return;
    }
    if (guildData.queueActive || !guildData.greetingEnabled) return;
    if (
      newVoiceState.channel &&
      !isPermitted(newVoiceState.channel, newVoiceState.guild)
    )
      return;
    if (
      !newVoiceState.channelID ||
      newVoiceState.channelID == oldVoiceState.channelID
    )
      return;

    const theme = await getTheme(newVoiceState);
    await connectToVoiceChannel(guildData);
    const dispatcher = guildData.connection
      .play(theme)
      .on("finish", () => {
        guildData.connection.disconnect();
      })
      .on("error", (error) => console.error(error));
    dispatcher.setVolumeLogarithmic(1);
  } catch (error) {
    console.error(error);
  }
};

const getTheme = async (voiceState: VoiceState) => {
  const userId = voiceState.member.id;
  const guildSettings = await dbHelper.getGuildSettings(voiceState.guild, {
    [`themes.${userId}`]: 1,
  });

  if (!guildSettings || !guildSettings.themes.has(userId)) {
    await dbHelper.saveGuildSettings(voiceState.guild, {
      $set: { [`themes.${userId}`]: defaultTheme },
    });
    return defaultTheme;
  } else return guildSettings.themes.get(userId);
};
