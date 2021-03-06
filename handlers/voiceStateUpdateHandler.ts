import { VoiceState } from "discord.js";
import DBHelper from "../db/DBHelper";
import { logger } from "../global/globals";
import c from "../util/checker";
import fetchGuildData from "../util/fetchGuildData";

const voiceStateUpdateHandler = async (
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
        guildData.reset();
      return;
    }

    if (
      !guildData.greetingEnabled ||
      (newVoiceState.channel &&
        !c.isPermittedToConnectAndSpeak(
          newVoiceState.channel,
          newVoiceState.guild
        ))
    )
      return;

    // if someone is disconnected and abbot was in the same voice channel,
    // check if there is any human left in the voice channel,
    // if no human left, set 60 seconds timeout then disconnect from voice channel.
    if (
      oldVoiceState.channel?.members &&
      (newVoiceState.channel?.guild?.id != oldVoiceState.channel?.guild?.id ||
        newVoiceState.channelID === oldVoiceState.guild.afkChannelID)
    ) {
      if (oldVoiceState.channel.members.has(oldVoiceState.guild.me.id)) {
        const hasUsersInChannel = oldVoiceState.channel.members.some(
          (member) => member.user.bot === false
        );
        if (!hasUsersInChannel) {
          guildData.quitTimer && clearTimeout(guildData.quitTimer);
          guildData.quitTimer = setTimeout(() => {
            guildData.reset();
          }, 60000);
        }
      }
      return;
    }

    if (
      newVoiceState.channelID == oldVoiceState.channelID ||
      guildData.isQueueActive
    )
      return;

    guildData.quitTimer && clearTimeout(guildData.quitTimer);
    const theme = await getTheme(newVoiceState);
    if (theme.length > 0) {
      await guildData.connectToVoice();
      const dispatcher = guildData.connection
        .play(theme)
        .on("finish", () => {})
        .on("error", (error) => logger.error(error));
      dispatcher.setVolumeLogarithmic(1);
    }
  } catch (error) {
    logger.error(error);
  }
};

const getTheme = async (voiceState: VoiceState): Promise<string> => {
  const userId = voiceState.member.id;
  const guildSettings = await DBHelper.getGuildSettings(voiceState.guild, {
    [`themes.${userId}`]: 1,
  });

  if (!guildSettings?.themes.has(userId)) {
    return "";
  } else return guildSettings.themes.get(userId);
};

export default voiceStateUpdateHandler;
