import { GuildData, GuildMember, Speaking } from "discord.js";
import DBHelper from "../db/DBHelper";
import { logger } from "../global/globals";
import { fetchGuildData } from "../util/guildActions";

export const guildMemberSpeakingHandler = async (
  guildMember: GuildMember,
  speaking: Speaking
) => {
  try {
    const guildData = await fetchGuildData(guildMember.guild);

    if (guildData.isQueueActive) return;
    if (
      guildData.isArbitrarySoundsEnabled &&
      !guildData.arbitrarySoundsTimer &&
      guildData.connection
    ) {
      setTimer(guildMember, guildData);
    }

    const annoyTheme = guildData.annoyanceList?.get(guildMember.id);
    if (annoyTheme?.length > 0 && speaking.bitfield) {
      guildData.connection?.play(annoyTheme);
    }
  } catch (error) {
    logger.error(error);
  }
};

const setTimer = (guildMember: GuildMember, guildData: GuildData) => {
  const max = 60000 * 15;
  const min = 60000 * 5;

  guildData.arbitrarySoundsTimer = setTimeout(async () => {
    const guildSettings = await DBHelper.getGuildSettings(guildMember.guild, {
      audioAliases: 1,
    });

    const alias =
      guildSettings.audioAliases[
        Math.trunc(Math.random() * (guildSettings.audioAliases.length - 1))
      ];

    if (guildData.isQueueActive) {
      guildData.isArbitrarySoundsEnabled = false;
      guildData.arbitrarySoundsTimer = null;
      return;
    }

    guildData.connection?.play(alias.url);
    setTimer(guildMember, guildData);
  }, Math.trunc(Math.random() * (max - min) + min));
};
