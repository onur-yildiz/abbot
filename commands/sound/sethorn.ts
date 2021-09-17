import { Command, Message } from "discord.js";
import DBHelper from "../../db/DBHelper";
import { isAudioOk } from "../../util/isAudioOk";
import { SETHORN_NOT_ALLOWED } from "../../constants/messages";
import getDefaultAudios from "../../util/getDefaultAudios";
import { logger } from "../../global/globals";

export = <Command>{
  name: "sethorn",
  aliases: ["sh", "savehorn"],
  description:
    'Set an alias for an audio url. ( "https://www.example.com/example.mp3" )',
  usage: "[horn alias] [url]",
  permissions: "MOVE_MEMBERS",
  isGuildOnly: true,
  args: Args.required,
  cooldown: 5,
  async execute(message: Message, args: string[]) {
    const commandContent = args[1].split(" ");
    const alias = commandContent.shift().toLowerCase();
    if (alias.length > 25)
      message.channel.send("Alias can be maximum 25 characters long.".toBold());

    const url = commandContent[0];
    const audios = getDefaultAudios();

    if (audios.includes(alias) || alias === "reset")
      return message.channel.send(SETHORN_NOT_ALLOWED.toBold());

    const regexUrl = new RegExp(
      `(https:\\/\\/.)(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&\\/\\/=]*).mp3`
    );

    if (regexUrl.test(url)) {
      if (await isAudioOk(url)) {
        try {
          // TODO pull both in one expression
          const audioAliasFoundByName = (
            await DBHelper.getGuildSettings(message.guild, {
              audioAliases: {
                $elemMatch: { name: alias },
              },
            })
          ).audioAliases.find((audioAlias) => audioAlias.name == alias);

          const audioAliasFoundByUrl = (
            await DBHelper.getGuildSettings(message.guild, {
              audioAliases: {
                $elemMatch: { url: url },
              },
            })
          ).audioAliases.find((audioAlias) => audioAlias.name == alias);

          if (audioAliasFoundByUrl) {
            if (audioAliasFoundByUrl.name === alias)
              return message.channel.send(
                `You entered an existing alias :zzz:`
              );
            await DBHelper.saveGuildSettings(
              {
                guildId: message.guild.id,
                "audioAliases.name": audioAliasFoundByUrl.name,
              },
              {
                $set: {
                  "audioAliases.$.name": alias,
                },
              }
            );
            message.channel.send(
              `Horn alias ${audioAliasFoundByUrl.name.toInlineCodeBg()} is changed to ${alias.toInlineCodeBg()}:mega::mega:`
            );
            logger.info(
              `Horn alias changed ::: ${audioAliasFoundByUrl.name} -->> ${alias} @${message.guild.name}<${message.guild.id}>`
            );
          } else if (audioAliasFoundByName) {
            await DBHelper.saveGuildSettings(
              {
                guildId: message.guild.id,
                "audioAliases.url": audioAliasFoundByName.url,
              },
              {
                $set: {
                  "audioAliases.$.url": url,
                },
              }
            );
            message.channel.send(
              `${alias.toInlineCodeBg()}'s URL has changed. :mega::mega:\nRemoved URL: ${
                audioAliasFoundByName.url
              }`
            );

            logger.info(
              `Horn URL changed ::: ${alias}: ${audioAliasFoundByName.url} <<-- ${url} @${message.guild.name}<${message.guild.id}>`
            );
          } else {
            await DBHelper.saveGuildSettings(
              { guildId: message.guild.id },
              {
                $push: { audioAliases: { name: alias, url: url } },
              }
            );
            message.channel.send(
              `New horn alias ${alias.toInlineCodeBg()} :mega::mega:`
            );

            logger.info(
              `New horn ::: ${alias}: ${url} @${message.guild.name}<${message.guild.id}>`
            );
          }
        } catch (error) {
          logger.error(error);
        }
      } else {
        message.channel.send(`Audio is inaccessible or more than 15 seconds.`);

        logger.info(`Inaccessible or long audio for sethorn ::: ${url}:`);
      }
    } else {
      message.channel.send(
        `URL or file type is not suitable. Unfortunately, only mp3 files are supported at the moment.\nExample URL: https://www.example.com/example.mp3`
      );

      logger.info(`Incompatible URL submitted for sethorn ::: ${url}:`);
    }
  },
};

const getOldKey = (map: Map<string, string>, keyValue: string): string => {
  for (const [key, val] of map) {
    if (val === keyValue) return key;
  }
};
