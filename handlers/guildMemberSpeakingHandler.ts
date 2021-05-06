import { GuildMember } from "discord.js";
import { logger } from "../global/globals";
import { fetchGuildData } from "../util/guildActions";

export const guildMemberSpeakingHandler = async (guildMember: GuildMember) => {
  try {
    const guildData = await fetchGuildData(guildMember.guild);

    if (guildData.annoyanceList.has(guildMember.id)) {
      guildData.connection?.play(guildData.annoyanceList.get(guildMember.id));
    }
  } catch (error) {
    logger.error(error);
  }
};
