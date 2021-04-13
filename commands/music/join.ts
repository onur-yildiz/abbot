import { Command, Message } from "discord.js";
import { ERROR_CONNECTING } from "../../constants/messages";
import { checkUserInAChannel } from "../../util/checkUserInAChannel";
import { connect } from "../../util/connect";
import { getAndUpdateGuildData } from "../../util/getAndUpdateGuildData";

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

    const guildData = getAndUpdateGuildData(
      message.guild,
      message.channel,
      message.member.voice.channel
    );

    try {
      await connect(guildData);
    } catch (error) {
      message.reply(ERROR_CONNECTING.toBold());
      console.error(error);
    }
  },
};
