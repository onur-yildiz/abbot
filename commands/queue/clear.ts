import { Command, Message } from "discord.js";
import { QUEUE_CLEARED, QUEUE_EMPTY_CLEAR } from "../../constants/messages";
import { checkAvailability } from "../../util/checkAvailability";
import { getAndUpdateGuildData } from "../../util/getAndUpdateGuildData";

export = <Command>{
  name: "clear",
  aliases: ["cl", "c"],
  description: "Clears the queue.",
  usage: "",
  args: Args.none,
  guildOnly: true,
  execute(message: Message) {
    const error = checkAvailability(message);
    if (error) return message.channel.send(error.toBold());

    const guildData = getAndUpdateGuildData(
      message.guild,
      message.channel,
      message.member.voice.channel
    );

    if (guildData.songs.length == 0)
      return message.channel.send(QUEUE_EMPTY_CLEAR.toBold());

    guildData.songs.splice(1, guildData.songs.length - 1);
    return message.channel.send(QUEUE_CLEARED.toBold());
  },
};
