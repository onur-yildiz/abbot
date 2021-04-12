import { Guild } from "discord.js";
import { guilds } from "../app";

export const deleteQueue = (guild: Guild): boolean => {
  return guilds.delete(guild.id);
};
