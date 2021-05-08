import mongoose from "mongoose";
import { defaultPrefix } from "../global/globals";

const dbTypes = mongoose.SchemaTypes;

export interface IGuildSettings extends mongoose.Document {
  guildId: string;
  greetingEnabled: boolean;
  audioAliases: Map<string, string>;
  themes: Map<string, string>;
  prefix: string;
}

const guildSettingsSchema = new mongoose.Schema({
  guildId: {
    type: dbTypes.String,
    unique: true,
  },
  greetingEnabled: {
    type: dbTypes.Boolean,
    require: true,
    default: true,
  },
  audioAliases: {
    type: dbTypes.Map,
    require: true,
    default: new Map<string, string>(),
  },
  themes: {
    type: dbTypes.Map,
    require: true,
    default: new Map<string, string>(),
  },
  prefix: {
    type: String,
    require: true,
    default: defaultPrefix,
  },
});

export const GuildSettings = mongoose.model<IGuildSettings>(
  "guildSettings",
  guildSettingsSchema
);
