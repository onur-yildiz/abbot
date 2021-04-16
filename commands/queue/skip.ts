import { Command, Message } from "discord.js";
import { QUEUE_EMPTY_SKIP, SKIPPED } from "../../constants/messages";
import { checkVoiceChannelAvailability } from "../../util/checker";
import { getAndUpdateGuildData } from "../../util/guildActions";

export = <Command>{
  name: "skip",
  aliases: ["s", "next"],
  description: "Skip the current song.",
  usage: "",
  args: Args.none,
  guildOnly: true,
  cooldown: 1,
  async execute(message: Message) {
    const error = checkVoiceChannelAvailability(message);
    if (error != null) return message.channel.send(error);

    let guildData = getAndUpdateGuildData(
      message.guild,
      message.channel,
      message.member.voice.channel
    );

    const dispatcher = guildData.connection.dispatcher;
    const isQueueEmpty = (): boolean => guildData.songs.length === 0;
    if (isQueueEmpty()) return message.channel.send(QUEUE_EMPTY_SKIP.toBold());

    let responseMessage: Message;
    try {
      if (dispatcher != null) {
        responseMessage = await message.channel.send(SKIPPED.toBold());
        dispatcher.emit("skip");
      }
    } catch (error) {
      responseMessage.edit("Could not skip!".toBold());
      console.log(error);
    }
  },
};
