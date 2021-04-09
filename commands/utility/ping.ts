import { Command, Message } from "discord.js";

export = <Command>{
  name: "ping",
  aliases: ["pnig"],
  description: "Ping!",
  usage: "",
  guildOnly: false,
  cooldown: 5,
  execute(message: Message) {
    message.channel.send("Pong.");
  },
};
