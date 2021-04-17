import { Command, Message } from "discord.js";
import DBHelper from "../../db/dbHelper";
import { urlReachable } from "../../util/urlReachable";
import { SETHORN_NOT_ALLOWED } from "../../constants/messages";
import getDefaultAudios from "../../util/getDefaultAudios";

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

    const regexUrl = new RegExp(
      `(http(s)?:\\/\\/.)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&\\/\\/=]*)`
    );
    if (regexUrl.test(url) && urlReachable(url)) {
      const guildSettings = await DBHelper.getGuildSettings(message.guild, {
        audioAliases: 1,
      });
      const urlAlreadyExists = checkIfValueExists(
        guildSettings.audioAliases,
        url
      );
      try {
        if (urlAlreadyExists) {
          const oldAlias = getOldKey(guildSettings.audioAliases, url);
          if (oldAlias === alias)
            return message.channel.send(`You entered an existing alias :zzz:`);
          await DBHelper.saveGuildSettings(message.guild, {
            $rename: {
              [`audioAliases.${oldAlias}`]: `audioAliases.${alias}`,
            },
          });
          message.channel.send(
            `Horn alias ${oldAlias.toInlineCodeBg()} is changed to ${alias.toInlineCodeBg()}:mega::mega:`
          );
        } else {
          await DBHelper.saveGuildSettings(message.guild, {
            $set: { [`audioAliases.${alias}`]: url },
          });
          const aliasAlreadyExists = guildSettings.audioAliases.has(alias);
          message.channel.send(
            aliasAlreadyExists
              ? `${alias.toInlineCodeBg()}'s URL has changed. :mega::mega:` +
                  `\nRemoved URL: ${guildSettings.audioAliases.get(alias)}`
              : `New horn alias ${alias.toInlineCodeBg()} :mega::mega:`
          );
        }
      } catch (error) {
        console.error(error);
      }
    }
  },
};

const checkIfValueExists = (map: Map<string, string>, val: string): boolean => {
  return Array.from(map.values()).includes(val);
};

const getOldKey = (map: Map<string, string>, keyValue: string): string => {
  for (const [key, val] of map) {
    if (val === keyValue) return key;
  }
};
