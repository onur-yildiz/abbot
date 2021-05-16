import fs from "fs";
import { stringify } from "yaml";
import { Command, Message } from "discord.js";
import { ERROR_EXECUTION_ERROR } from "../../constants/messages";
import DBHelper from "../../db/DBHelper";
import { logger } from "../../global/globals";

export = <Command>{
  name: "exporthorn",
  aliases: ["exph"],
  description: "Export saved horns.",
  usage: "",
  isGuildOnly: true,
  args: Args.none,
  async execute(message: Message) {
    try {
      const guildSettings = await DBHelper.getGuildSettings(message.guild, {
        audioAliases: 1,
      });

      const audioAliasMap = new Map<string, string>();
      for (const audioAlias of guildSettings.audioAliases) {
        audioAliasMap.set(audioAlias.name, audioAlias.url);
      }

      const filePath = `horns_${message.guild.id}.yaml`;
      fs.writeFileSync(filePath, stringify(audioAliasMap));
      await message.channel.send({
        files: [filePath],
      });
      fs.rmSync(filePath);
    } catch (error) {
      logger.error(error);
      message.reply(ERROR_EXECUTION_ERROR);
    }
  },
};
