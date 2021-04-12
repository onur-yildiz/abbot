import { GuildData } from "discord.js";

export const connect = async (guildData: GuildData) => {
  const connection = await guildData.voiceChannel.join();
  guildData.connection = connection;
  return guildData;
};
