import { Guild } from "discord.js";
import mongoose from "mongoose";
import { uri } from "../global/globals";
import { GuildSettings, IGuildSettings } from "./dbModels";

const connectToDatabase = async () => {
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
};

const createGuildSettings = async (guild: Guild) => {
  try {
    return await GuildSettings.create({
      guildId: guild.id,
    });
  } catch (error) {
    console.error(error);
  }
};

const saveGuildSettings = async (
  guild: Guild,
  updateQuery: mongoose.UpdateQuery<IGuildSettings>
) => {
  try {
    await GuildSettings.findOneAndUpdate({ guildId: guild.id }, updateQuery, {
      upsert: true,
    });
  } catch (error) {
    console.error(error);
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
    console.error(error);
  }
};

const deleteGuildSettings = async (guild: Guild) => {
  try {
    await GuildSettings.findOneAndDelete({ guildId: guild.id });
  } catch (error) {
    console.error(error);
  }
};

export default {
  connectToDatabase,
  createGuildSettings,
  saveGuildSettings,
  getGuildSettings,
  deleteGuildSettings,
};
