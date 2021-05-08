import { GuildData, GuildMember, Speaking } from "discord.js";
import dbHelper from "../db/dbHelper";
import { logger } from "../global/globals";
import { fetchGuildData } from "../util/guildActions";

export const guildMemberSpeakingHandler = async (
  guildMember: GuildMember,
  speaking: Speaking
) => {
  try {
    const guildData = await fetchGuildData(guildMember.guild);

    if (guildData.queueActive) return;
    if (guildData.arbitrarySoundsEnabled && !guildData.arbitrarySoundsTimer)
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
    const guildSettings = await dbHelper.getGuildSettings(guildMember.guild, {
      audioAliases: 1,
    });
    const aliases = guildSettings.audioAliases;

    const length = aliases.size;
    const alias = [...aliases.keys()][Math.trunc(Math.random() * (length - 1))];
    const audioPath = aliases.get(alias);

    if (guildData.queueActive || !guildData.connection) {
      guildData.arbitrarySoundsEnabled = false;
      return;
    }

    guildData.connection?.play(audioPath);
    setTimer(guildMember, guildData);
  }, Math.trunc(Math.random() * (max - min) + min));
};
