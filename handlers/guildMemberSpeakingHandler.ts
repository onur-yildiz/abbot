import { GuildMember, Speaking } from "discord.js";
import { logger } from "../global/globals";
import { fetchGuildData } from "../util/guildActions";

export const guildMemberSpeakingHandler = async (
  guildMember: GuildMember,
  speaking: Speaking
) => {
  try {
    const guildData = await fetchGuildData(guildMember.guild);

    if (guildData.queueActive) return;

    const annoyTheme = guildData.annoyanceList.get(guildMember.id);
    if (annoyTheme?.length > 0 && speaking.bitfield) {
      guildData.connection?.play(annoyTheme);
    }
  } catch (error) {
    logger.error(error);
  }
};
