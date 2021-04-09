import { Command, Message } from "discord.js";
import { QUEUE_EMPTY_SKIP } from "../../constants/messages";
import { checkAvailability } from "../../util/checkAvailability";
import { getOrInitQueue } from "../../util/getOrInitQueue";

export = <Command>{
  name: "skip",
  aliases: ["s", "next"],
  description: "Skip the current song.",
  usage: "",
  guildOnly: true,
  execute(message: Message) {
    const error = checkAvailability(message);
    if (error != null) return message.channel.send(error);

    const queueContract = getOrInitQueue(
      message.guild,
      message.channel,
      message.member.voice.channel
    );

    const isQueueEmpty = (): boolean => queueContract.songs.length === 0;
    if (isQueueEmpty()) return message.channel.send(QUEUE_EMPTY_SKIP.toBold());
    if (queueContract.connection.dispatcher != null) {
      queueContract.connection.dispatcher.end();
      if (isQueueEmpty()) queueContract.playing = false;
      return message.channel.send(`Skipped.`.toBold());
    }
    return;
  },
};
