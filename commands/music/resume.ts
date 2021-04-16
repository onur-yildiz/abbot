import { Command, Message } from "discord.js";
import {
  ALREADY_PLAYING,
  NOTHING_IS_PLAYING,
  RESUMING,
} from "../../constants/messages";
import { checkVoiceChannelAvailability } from "../../util/checker";
import { getAndUpdateGuildData } from "../../util/guildActions";

export = <Command>{
  name: "resume",
  aliases: ["pause"],
  description: "Resumes the paused track.",
  usage: "",
  guildOnly: true,
  args: Args.none,
  async execute(message: Message) {
    const error = checkVoiceChannelAvailability(message);
    if (error) return message.channel.send(error.toBold());

    const guildData = getAndUpdateGuildData(
      message.guild,
      message.channel,
      message.member.voice.channel
    );

    const dispatcher = guildData.connection.dispatcher;
    if (!dispatcher.paused)
      return message.channel.send(ALREADY_PLAYING.toBold());

    let responseMessage: Message;
    try {
      if (guildData.queueActive) {
        responseMessage = await message.channel.send(RESUMING.toBold());
        dispatcher.emit("resume");
      } else message.channel.send(NOTHING_IS_PLAYING.toBold());
    } catch (error) {
      responseMessage.edit("Could not resume!");
      console.error(error);
    }
  },
};
