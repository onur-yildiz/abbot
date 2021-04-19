import { Guild } from "discord.js";
import dbHelper from "../db/dbHelper";
import { guilds } from "../global/globals";

export const guildDeleteHandler = async (guild: Guild) => {
  try {
    if (guilds.has(guild.id)) {
      guilds.delete(guild.id);
      await dbHelper.deleteGuildSettings(guild);
    } else throw new Error(`This guild does not exist in guilds: ${guild.id}`);
  } catch (error) {
    console.error(error);
  }
};
