import { Guild, User } from "discord.js";
import { UpdateQuery } from "mongoose";
import {
  GuildSettings,
  IGuildSettings,
  IUserSettings,
  UserSettings,
} from "./dbModels";

export const saveGuildSettings = async (
  guild: Guild,
  query: UpdateQuery<IGuildSettings>
) => {
  try {
    await GuildSettings.findOneAndUpdate({ guildId: guild.id }, query, {
      upsert: true,
    });
  } catch (error) {
    console.error(error);
  }
};

export const getGuildSettings = async (
  guild: Guild,
  projection?: any
): Promise<IGuildSettings> => {
  try {
    const guildSettings = await GuildSettings.findOne(
      {
        guildId: guild.id,
      },
      projection
    ).exec();
    return guildSettings;
  } catch (error) {
    console.error(error);
  }
};

export const saveUserSettings = async (
  user: User,
  query: UpdateQuery<IUserSettings>
) => {
  try {
    await UserSettings.findOneAndUpdate({ userId: user.id }, query, {
      upsert: true,
    });
  } catch (error) {
    console.error(error);
  }
};

export const getUserSettings = async (
  user: User,
  projection?: any
): Promise<IUserSettings> => {
  try {
    const userSettings = await UserSettings.findOne(
      {
        userId: user.id,
      },
      projection
    ).exec();
    return userSettings;
  } catch (error) {
    console.error(error);
  }
};
