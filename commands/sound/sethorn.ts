import fs from "fs";
import { Command, Message } from "discord.js";
import { getAndUpdateGuildData } from "../../util/getAndUpdateGuildData";
import { saveGuildSettings } from "../../db/dbHelper";
import { urlReachable } from "../../util/urlReachable";
import { SETHORN_NOT_ALLOWED } from "../../constants/messages";
import { getDefaultAudios } from "../../util/getDefaultAudios";

export = <Command>{
  name: "sethorn",
  aliases: ["sh", "savehorn"],
  description:
    'Set an alias for an audio url. ( "https://www.example.com/example.mp3" )',
  usage: "[horn alias] [url]",
  permissions: "MOVE_MEMBERS",
  guildOnly: true,
  args: Args.required,
  cooldown: 5,
  async execute(message: Message, args: string[]) {
    const commandContent = args[1].split(" ");
    const alias = commandContent.shift().toLowerCase();
    const url = commandContent[0];
    const audios = getDefaultAudios();

    if (audios.includes(alias))
      return message.channel.send(SETHORN_NOT_ALLOWED.toBold());

    const guildData = getAndUpdateGuildData(
      message.guild,
      message.channel,
      message.member.voice.channel
    );

    const regexUrl = new RegExp(
      `(http(s)?:\\/\\/.)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&\\/\\/=]*)`
    );
    if (regexUrl.test(url) && urlReachable(url)) {
      const urlAlreadyExists = checkIfValueExists(guildData.audioAliases, url);
      try {
        if (urlAlreadyExists) {
          const oldAlias = getOldKey(guildData.audioAliases, url);
          await saveGuildSettings(message.guild, {
            $rename: {
              [`audioAliases.${oldAlias}`]: `audioAliases.${alias}`,
            },
          });
          message.channel.send(
            `Horn alias ${oldAlias.toInlineCodeBg()} is changed to ${alias.toInlineCodeBg()}:mega::mega:`
          );
        } else {
          await saveGuildSettings(message.guild, {
            $set: { [`audioAliases.${alias}`]: url },
          });
          const aliasAlreadyExists = checkIfKeyExists(
            guildData.audioAliases,
            alias
          );
          message.channel.send(
            aliasAlreadyExists
              ? `${alias.toInlineCodeBg()}'s URL has changed. :mega::mega:` +
                  `\nRemoved URL: ${guildData.audioAliases.get(alias)}`
              : `New horn alias ${alias.toInlineCodeBg()} :mega::mega:`
          );
        }
        guildData.audioAliases.set(alias, url);
      } catch (error) {
        console.error(error);
      }
    }
  },
};

const checkIfValueExists = (map: Map<string, string>, val: string): boolean => {
  return Array.from(map.values()).includes(val);
};

const checkIfKeyExists = (map: Map<string, string>, key: string): boolean => {
  return Array.from(map.keys()).includes(key);
};

const getOldKey = (map: Map<string, string>, keyValue: string): string => {
  for (const [key, val] of map) {
    if (val === keyValue) return key;
  }
};
