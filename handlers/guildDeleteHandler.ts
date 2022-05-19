import { Guild } from "discord.js";
import DBHelper from "../db/DBHelper";
import { guilds, logger } from "../global/globals";

const guildDeleteHandler = async (guild: Guild) => {
  try {
    if (guilds.has(guild.id)) {
      guilds.delete(guild.id);
      await DBHelper.deleteGuildSettings(guild);
    } else throw new Error(`This guild does not exist in guilds: ${guild.id}`);
  } catch (error) {
    logger.error(error);
  }
};

export default guildDeleteHandler;
