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
    if (guildData.isArbitrarySoundsEnabled && !guildData.arbitrarySoundsTimer)
      setTimer(guildMember, guildData);

    const annoyTheme = guildData.annoyanceList.get(guildMember.id);
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
    const aliases = guildSettings.audioAliases;

    const length = aliases.size;
    const alias = [...aliases.keys()][Math.trunc(Math.random() * (length - 1))];
    const audioPath = aliases.get(alias);

    if (guildData.isQueueActive || !guildData.connection) {
      guildData.isArbitrarySoundsEnabled = false;
      return;
    }

    guildData.connection?.play(audioPath);
    setTimer(guildMember, guildData);
  }, Math.trunc(Math.random() * (max - min) + min));
};
