import { Command, Message } from "discord.js";
import { checkAvailability } from "../../util/checkAvailability";
import { connect } from "../../util/connect";
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
    try {
      connect(queueContract);
    } catch (error) {
      console.log(error);
    }
  },
};
// TODO TEST
