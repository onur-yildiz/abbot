import mongoose from "mongoose";

const dbTypes = mongoose.SchemaTypes;

export interface IGuildSettings extends mongoose.Document {
  guildId: string;
  greetingEnabled: boolean;
  audioAliases: Map<string, string>;
  prefix: string;
}

export const guildSettingsSchema = new mongoose.Schema({
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

export const GuildSettings = mongoose.model<IGuildSettings>(
  "guildSettings",
  guildSettingsSchema
);
