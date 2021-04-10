import { Command, Message } from "discord.js";
import { checkUserInAChannel } from "../../util/checkUserInAChannel";
import { connect } from "../../util/connect";
import { getOrInitQueue } from "../../util/getOrInitQueue";

export = <Command>{
  name: "join",
  aliases: ["cmere"],
  description: "Make the bot join the voice channel.",
  usage: "",
  guildOnly: true,
  execute(message: Message) {
    const error = checkUserInAChannel(message);
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
