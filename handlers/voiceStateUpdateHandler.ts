import { VoiceState } from "discord.js";
import dbHelper from "../db/dbHelper";
import { logger } from "../global/globals";
import { isPermitted } from "../util/checker";
import {
  connectToVoiceChannel,
  fetchGuildData,
  resetState,
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

    // if user is a bot, return
    if (newVoiceState.member.user.bot) {
      // if the bot is abbot and it is disconnected somehow, reset necessary properties before return.
      if (
        newVoiceState.guild.me.id === newVoiceState.member.id &&
        !newVoiceState.channel
      )
        resetState(guildData);
      return;
    }

    if (
      guildData.queueActive ||
      !guildData.greetingEnabled ||
      (newVoiceState.channel &&
        !isPermitted(newVoiceState.channel, newVoiceState.guild))
    )
      return;

    // if someone is disconnected and abbot was in the same voice channel,
    // check if there is any human left in the voice channel,
    // if no human left, set 60 seconds timeout then disconnect from voice channel.
    if (!newVoiceState.channelID) {
      if (oldVoiceState.channel.members.has(oldVoiceState.guild.me.id)) {
        const hasUsersInChannel = oldVoiceState.channel.members.some(
          (member) => member.user.bot === false
        );
        if (!hasUsersInChannel) {
          guildData.quitTimer && clearTimeout(guildData.quitTimer);
          guildData.quitTimer = setTimeout(() => {
            guildData.connection.disconnect();
            resetState(guildData);
          }, 60000);
        }
      }
      return;
    }

    if (
      newVoiceState.channelID == oldVoiceState.channelID ||
      newVoiceState.channelID == oldVoiceState.guild.afkChannelID
    )
      return;

    guildData.quitTimer && clearTimeout(guildData.quitTimer);
    const theme = await getTheme(newVoiceState);
    await connectToVoiceChannel(guildData);
    const dispatcher = guildData.connection
      .play(theme)
      .on("finish", () => {})
      .on("error", (error) => logger.error(error));
    dispatcher.setVolumeLogarithmic(1);
  } catch (error) {
    logger.error(error);
  }
};

const getTheme = async (voiceState: VoiceState) => {
  const userId = voiceState.member.id;
  const guildSettings = await dbHelper.getGuildSettings(voiceState.guild, {
    [`themes.${userId}`]: 1,
  });

  if (!guildSettings?.themes.has(userId)) {
    await dbHelper.saveGuildSettings(voiceState.guild, {
      $set: { [`themes.${userId}`]: defaultTheme },
    });
    return defaultTheme;
  } else return guildSettings.themes.get(userId);
};
