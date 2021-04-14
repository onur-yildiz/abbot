import { Command, Message } from "discord.js";
import { getAndUpdateGuildData } from "../../util/getAndUpdateGuildData";
import { getGuildSettings, saveGuildSettings } from "../../db/dbHelper";

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

    const guildSettings = await getGuildSettings(message.guild, {
      [`audioAliases.${alias}`]: 1,
    });
    const exists = checkIfKeyExists(guildSettings.audioAliases, alias);
    console.log(exists);
    if (!exists) return message.reply(`this alias does not exist.`);
    try {
      await saveGuildSettings(message.guild, {
        $unset: { [`audioAliases.${alias}`]: "" },
      });
      await saveGuildSettings(message.guild, {
        $unset: { [`audioAliases.${alias}`]: "" },
      });
      message.channel.send(
        `${alias.toInlineCodeBg()} is deleted. :wastebasket:`
      );
    } catch (error) {
      console.error(error);
    }
  },
};

const checkIfKeyExists = (map: Map<string, string>, key: string): boolean => {
  return Array.from(map.keys()).includes(key);
};
