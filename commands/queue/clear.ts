import { Command, Message } from "discord.js";
import { QUEUE_CLEARED, QUEUE_EMPTY_CLEAR } from "../../constants/messages";
import { checkAvailability } from "../../util/checkAvailability";
import { getOrInitQueue } from "../../util/getOrInitQueue";

export = <Command>{
  name: "clear",
  aliases: ["cl", "c"],
  description: "Clears the queue.",
  usage: "",
  guildOnly: true,
  execute(message: Message) {
    const error = checkAvailability(message);
    if (error) return message.channel.send(error.toBold());

    const queueContract = getOrInitQueue(
      message.guild,
      message.channel,
      message.member.voice.channel
    );

    if (queueContract.songs.length == 0)
      return message.channel.send(QUEUE_EMPTY_CLEAR.toBold());

    queueContract.songs = [];
    return message.channel.send(QUEUE_CLEARED.toBold());
  },
};
