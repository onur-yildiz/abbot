import { Command, Message } from "discord.js";
import { DISCONNECTED } from "../../constants/messages";
import { checkAvailability } from "../../util/checkAvailability";
import { deleteGuild } from "../../util/deleteGuild";
import { getAndUpdateGuildData } from "../../util/getAndUpdateGuildData";

export = <Command>{
  name: "disconnect",
  aliases: ["l", "quit", "dc", "leave"],
  description: "Disconnects the bot from the voice channel.",
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

    if (guildData.connection.dispatcher != null)
      guildData.connection.dispatcher.destroy();
    guildData.connection.disconnect();
    deleteGuild(message.guild);
    return message.channel.send(DISCONNECTED.toBold());
  },
};
