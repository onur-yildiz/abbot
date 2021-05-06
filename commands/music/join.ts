import { Command, Message } from "discord.js";
import { ERROR_CONNECTING } from "../../constants/messages";
import { logger } from "../../global/globals";
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

      // Hacky way to solve bot appearing always speaking after joining the voice channel.
      const dispatcher = guildData.connection.play("./assets/audio/ww.mp3");
      setTimeout(() => {
        dispatcher.end();
      }, 10);
    } catch (error) {
      message.reply(ERROR_CONNECTING.toBold());
      logger.error(error);
    }
  },
};
