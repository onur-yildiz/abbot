import { Command, Message } from "discord.js";
import {
  ALREADY_PAUSED,
  NOTHING_IS_PLAYING,
  PAUSED,
} from "../../constants/messages";
import { checkAvailability } from "../../util/checkAvailability";
import { getAndUpdateGuildData } from "../../util/getAndUpdateGuildData";

export = <Command>{
  name: "pause",
  aliases: ["pause", "stop"],
  description: "Pauses the current playing track.",
  usage: "",
  guildOnly: true,
  args: Args.none,
  async execute(message: Message) {
    const error = checkAvailability(message);
    if (error) return message.channel.send(error.toBold());

    const guildData = getAndUpdateGuildData(
      message.guild,
      message.channel,
      message.member.voice.channel
    );

    if (guildData.connection.dispatcher.paused)
      return message.channel.send(ALREADY_PAUSED.toBold());
    if (guildData.queueActive) {
      guildData.connection.dispatcher.pause();
      message.channel.send(PAUSED.toBold());
    } else message.channel.send(NOTHING_IS_PLAYING.toItalic());
  },
};
