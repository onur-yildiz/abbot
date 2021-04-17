import { Command, Message } from "discord.js";
import { ERROR_CONNECTING } from "../../constants/messages";
import { checkUserInAChannel } from "../../util/checker";
import { connectToVoiceChannel, fetchGuildData } from "../../util/guildActions";

export = <Command>{
  name: "join",
  aliases: ["j", "cmere"],
  description: "Make the bot join the voice channel.",
  usage: "",
  args: Args.none,
  guildOnly: true,
  async execute(message: Message) {
    const error = checkUserInAChannel(message);
    if (error) return message.channel.send(error.toBold());

    try {
      const guildData = await fetchGuildData(
        message.guild,
        message.channel,
        message.member.voice.channel
      );
      await connectToVoiceChannel(guildData);
    } catch (error) {
      message.reply(ERROR_CONNECTING.toBold());
      console.error(error);
    }
  },
};
