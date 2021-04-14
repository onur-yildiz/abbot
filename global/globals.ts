import Discord, { Collection, Command, Cooldowns, Guilds } from "discord.js";

require("dotenv").config();
export const defaultPrefix = process.env.PREFIX;
export const token = process.env.TOKEN;
export const uri = process.env.DATABASE_URI;

export const commands = new Discord.Collection<string, Command>();
export const guilds: Guilds = new Map();
export const cooldowns: Cooldowns = new Discord.Collection<
  string,
  Collection<string, number>
>();
