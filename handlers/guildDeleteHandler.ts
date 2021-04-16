import { Guild } from "discord.js";
import DBHelper from "../db/dbHelper";
import { guilds } from "../global/globals";

export const guildDeleteHandler = async (guild: Guild) => {
  try {
    guilds.delete(guild.id);
    await DBHelper.deleteGuildSettings(guild);
  } catch (error) {
    console.error(error);
  }
};
