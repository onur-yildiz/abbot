import { GuildMember, Speaking } from "discord.js";
import { logger } from "../global/globals";
import { fetchGuildData } from "../util/guildActions";

export const guildMemberSpeakingHandler = async (
  guildMember: GuildMember,
  speaking: Speaking
) => {
  try {
    const guildData = await fetchGuildData(guildMember.guild);

    if (guildData.annoyanceList.has(guildMember.id) && speaking.bitfield) {
      guildData.connection?.play(guildData.annoyanceList.get(guildMember.id));
    }
  } catch (error) {
    logger.error(error);
  }
};
