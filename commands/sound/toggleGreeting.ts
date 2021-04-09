import { Command, Message } from "discord.js";
import { getOrInitQueue } from "../../util/getOrInitQueue";

export = <Command>{
  name: "toggle greeting",
  aliases: ["greeting", "tg", "toggle greet", "greet"],
  description: "Clears the queue.",
  usage: "",
  permissions: ["ADMINISTRATOR", "MOVE_MEMBERS"],
  guildOnly: true,
  execute(message: Message) {
    const queueContract = getOrInitQueue(
      message.guild,
      message.channel,
      message.member.voice.channel
    );
    queueContract.enableGreeting = !queueContract.enableGreeting;
    message.channel.send(
      `Greeting is ${
        queueContract.enableGreeting ? "enabled" : "disabled"
      }.`.toBold()
    );
  },
};
