import { Command, Message } from "discord.js";
import { getAndUpdateGuildData } from "../../util/getAndUpdateGuildData";
import { saveGuildSettings } from "../../db/dbHelper";
import { urlReachable } from "../../util/urlReachable";

export = <Command>{
  name: "deletehorn",
  aliases: ["dh", "delhorn"],
  description: "Delete a saved alias.",
  usage: "[horn alias]",
  permissions: "MOVE_MEMBERS",
  guildOnly: true,
  args: Args.required,
  cooldown: 5,
  async execute(message: Message, args: string[]) {
    const alias = args[1];

    const guildData = getAndUpdateGuildData(
      message.guild,
      message.channel,
      message.member.voice.channel
    );

    const exists = checkIfKeyExists(guildData.audioAliases, alias);
    console.log(exists);
    if (!exists) return message.reply(`this alias does not exist.`);
    try {
      await saveGuildSettings(message.guild, {
        $unset: { [`audioAliases.${alias}`]: "" },
      });
      guildData.audioAliases.delete(alias);
      message.channel.send(`:x: ${alias.toInlineCodeBg()} is deleted. :x:`);
    } catch (error) {
      console.error(error);
    }
  },
};

const checkIfKeyExists = (map: Map<string, string>, key: string): boolean => {
  return Array.from(map.keys()).includes(key);
};
