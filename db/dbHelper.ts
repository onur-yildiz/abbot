import { Guild } from "discord.js";
import { GuildSettings, IGuildSettings } from "./dbModels";

export const saveGuildSettings = async (guild: Guild, settings: object) => {
  try {
    await GuildSettings.findOneAndUpdate({ guildId: guild.id }, settings, {
      upsert: true,
    });
  } catch (error) {
    console.error(error);
  }
};

export const getGuildSettings = async (
  guild: Guild
): Promise<IGuildSettings> => {
  try {
    let guildSettings: IGuildSettings;
    await GuildSettings.findOne(
      { guildId: guild.id },
      (error: Error, doc: IGuildSettings) => {
        if (error) console.error(error);
        guildSettings = doc;
      }
    );
    return guildSettings;
  } catch (error) {
    console.error(error);
  }
};
