import { Command, Message } from "discord.js";
import { checkAvailability } from "../../util/checkAvailability";
import { deleteQueue } from "../../util/deleteQueue";
import { getOrInitQueue } from "../../util/getOrInitQueue";

export = <Command>{
  name: "leave",
  aliases: ["l", "quit"],
  description: "Make the bot leave the voice channel.",
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
    if (queueContract.connection.dispatcher != null)
      queueContract.connection.dispatcher.end();
    queueContract.connection.disconnect();
    deleteQueue(message.guild);
    return message.channel.send("Disconnected.".toBold());
  },
};
