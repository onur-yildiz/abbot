import { Guild } from "discord.js";
import { guilds } from "../global/globals";

export const deleteGuild = (guild: Guild): boolean => {
  return guilds.delete(guild.id);
};
