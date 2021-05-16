import { Guild } from "discord.js";
import mongoose from "mongoose";
import winston from "winston";
import { logger, uri } from "../global/globals";
import { GuildSettings, IGuildSettings } from "./DBModels";

const connectToDatabase = async () => {
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });

  logger.add(
    new winston.transports.MongoDB({
      db: uri,
      storeHost: true,
      options: { useNewUrlParser: true, useUnifiedTopology: true },
    })
  );
};

const createGuildSettings = async (guild: Guild) => {
  try {
    return await GuildSettings.create({
      guildId: guild.id,
    });
  } catch (error) {
    logger.error(error);
  }
};

const saveGuildSettings = async (
  filterQuery: mongoose.FilterQuery<IGuildSettings>,
  updateQuery: mongoose.UpdateQuery<IGuildSettings>
) => {
  try {
    await GuildSettings.findOneAndUpdate(filterQuery, updateQuery, {
      upsert: true,
    });
  } catch (error) {
    logger.error(error);
  }
};

const getGuildSettings = async (
  guild: Guild,
  projection?: any
): Promise<IGuildSettings> => {
  try {
    return await GuildSettings.findOne(
      {
        guildId: guild.id,
      },
      projection
    ).exec();
  } catch (error) {
    logger.error(error);
  }
};

const deleteGuildSettings = async (guild: Guild) => {
  try {
    await GuildSettings.findOneAndDelete({ guildId: guild.id });
  } catch (error) {
    logger.error(error);
  }
};

export default {
  connectToDatabase,
  createGuildSettings,
  saveGuildSettings,
  getGuildSettings,
  deleteGuildSettings,
};
