import mongoose from "mongoose";

const dbTypes = mongoose.SchemaTypes;

export interface IGuildSettings extends mongoose.Document {
  guildId: string;
  greetingEnabled: boolean;
  audioAliases: Map<string, string>;
  prefix: string;
}

export interface IUserSettings extends mongoose.Document {
  userId: string;
  themes: Map<string, string>;
}

const guildSettingsSchema = new mongoose.Schema({
  guildId: {
    type: dbTypes.String,
    unique: true,
  },
  greetingEnabled: {
    type: dbTypes.Boolean,
    required: true,
  },
  audioAliases: {
    type: dbTypes.Map,
  },
  prefix: {
    type: String,
  },
});

const userSettingsSchema = new mongoose.Schema({
  userId: { type: dbTypes.String, unique: true },
  themes: { type: dbTypes.Map },
});

export const GuildSettings = mongoose.model<IGuildSettings>(
  "guildSettings",
  guildSettingsSchema
);

export const UserSettings = mongoose.model<IUserSettings>(
  "userSettings",
  userSettingsSchema
);
