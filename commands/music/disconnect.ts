import { Command, Message } from "discord.js";
import { ERROR_EXECUTION_ERROR } from "../../constants/messages";
import { logger } from "../../global/globals";
import c from "../../util/checker";
import fetchGuildData from "../../util/fetchGuildData";

export = <Command>{
  name: "disconnect",
  aliases: ["l", "quit", "dc", "leave"],
  description: "Disconnects the bot from the voice channel.",
  usage: "",
  args: Args.none,
  isGuildOnly: true,
  async execute(message: Message) {
    const error = c.isVoiceChannelAvailable(message);
    if (error) return message.channel.send(error.toBold());

    try {
      const guildData = await fetchGuildData(message.guild);
      guildData.connection.disconnect();
    } catch (error) {
      message.reply(ERROR_EXECUTION_ERROR.toBold());
      message.react("❗");
      logger.error(error);
    }
  },
};
