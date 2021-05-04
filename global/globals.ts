import Discord, { Collection, Command, Cooldowns, Guilds } from "discord.js";
import winston, { level } from "winston";
import "winston-mongodb";

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

export const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "combined.log", level: "info" }),
    new winston.transports.File({ filename: "error.log", level: "error" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}
