import { Command, Message, NewsChannel, TextChannel } from "discord.js";

export = <Command>{
  name: "clearmessage",
  aliases: ["clm", "clrmsg"],
  description: "Clear the past [?] messages.",
  usage: "[message amount]",
  guildOnly: true,
  args: Args.required,
  cooldown: 8,
  async execute(message: Message, args: string[]) {
    const commandContent = args[1];
    const amountText = commandContent.split(" ")[0];
    const amount = parseInt(amountText);
    if (isNaN(amount)) return;

    try {
      (<TextChannel | NewsChannel>message.channel).bulkDelete(amount + 1);
      const responseMessage = await message.channel.send(
        (`${amount}`.toBold() + ` messages deleted.`).toItalic()
      );
      setTimeout(() => {
        responseMessage.delete();
      }, 3000);
    } catch (error) {
      console.error(error);
      message.reply(`Something went wrong deleting the messages.`);
    }
  },
};
