import { Command, Message } from "discord.js";
import { DISCONNECTED } from "../../constants/messages";
import { checkVoiceChannelAvailability } from "../../util/checker";
import { disconnectFromVoiceChannel } from "../../util/guildActions";

export = <Command>{
  name: "disconnect",
  aliases: ["l", "quit", "dc", "leave"],
  description: "Disconnects the bot from the voice channel.",
  usage: "",
  args: Args.none,
  guildOnly: true,
  async execute(message: Message) {
    const error = checkVoiceChannelAvailability(message);
    if (error) return message.channel.send(error.toBold());

    try {
      disconnectFromVoiceChannel(message.guild);
      return message.channel.send(DISCONNECTED.toBold());
    } catch (error) {
      console.error(error);
    }
  },
};
