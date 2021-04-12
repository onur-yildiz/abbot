import { Command, Message } from "discord.js";
import { checkAvailability } from "../../util/checkAvailability";
import { getAndUpdateGuildData } from "../../util/getAndUpdateGuildData";

export = <Command>{
  name: "resume",
  aliases: ["pause"],
  description: "Resumes the paused track.",
  usage: "",
  guildOnly: true,
  args: Args.none,
  async execute(message: Message) {
    const error = checkAvailability(message);
    if (error) return message.channel.send(error.toBold());

    const guildData = getAndUpdateGuildData(
      message.guild,
      message.channel,
      message.member.voice.channel
    );

    const dispatcher = guildData.connection.dispatcher;
    if (!dispatcher.paused)
      return message.channel.send(`Already playing.`.toBold());

    let responseMessage: Message;
    try {
      if (guildData.queueActive) {
        responseMessage = await message.channel.send(
          `Resuming :play_pause:`.toBold()
        );
        dispatcher.emit("resume");
      } else message.channel.send(`No songs are playing.`.toBold());
    } catch (error) {
      responseMessage.edit("Could not resume!");
      console.error(error);
    }
  },
};
