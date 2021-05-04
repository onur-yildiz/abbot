import { Command, Message } from "discord.js";
import { QUEUE_EMPTY_SKIP, SKIPPED } from "../../constants/messages";
import { logger } from "../../global/globals";
import { checkVoiceChannelAvailability } from "../../util/checker";
import { fetchGuildData } from "../../util/guildActions";

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
    if (error) return message.channel.send(error);

    let responseMessage: Message;
    try {
      let guildData = await fetchGuildData(
        message.guild,
        message.channel,
        message.member.voice.channel
      );

      const dispatcher = guildData.connection.dispatcher;
      if (guildData.songs.length === 0)
        return message.channel.send(QUEUE_EMPTY_SKIP.toBold());

      if (dispatcher) {
        responseMessage = await message.channel.send(SKIPPED.toBold());
        dispatcher.emit("skip");
      }
    } catch (error) {
      responseMessage.edit("Could not skip!".toBold());
      logger.log(error);
    }
  },
};
