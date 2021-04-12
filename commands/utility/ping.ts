import { Command, Message } from "discord.js";
import { PONG } from "../../constants/messages";

export = <Command>{
  name: "ping",
  aliases: ["pnig"],
  description: "Ping!",
  usage: "",
  args: Args.none,
  guildOnly: false,
  cooldown: 5,
  execute(message: Message) {
    message.channel.send(PONG);
  },
};
