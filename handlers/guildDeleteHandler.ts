import { Guild } from "discord.js";
import { deleteGuildSettings } from "../db/dbHelper";
import { guilds } from "../global/globals";

export const guildDeleteHandler = async (guild: Guild) => {
  try {
    guilds.delete(guild.id);
    await deleteGuildSettings(guild);
  } catch (error) {
    console.error(error);
  }
};
