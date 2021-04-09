import { Guild } from "discord.js";
import { guildContracts } from "../app";

export const deleteQueue = (guild: Guild): boolean => {
  return guildContracts.delete(guild.id);
};
