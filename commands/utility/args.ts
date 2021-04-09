import { Command, Message } from "discord.js";
import { getCommandContent } from "../../util/getCommandContent";

export = <Command>{
  name: "args",
  aliases: ["arg"],
  description: "Information about the arguments provided.",
  usage: " [query]",
  guildOnly: true,
  execute(message: Message) {
    const commandContent = getCommandContent(message.content);

    if (commandContent === "anan") {
      return message.channel.send("sqem");
    }
    if (commandContent.startsWith("echo")) {
      return message.channel.send(commandContent.slice(4));
    }

    message.channel.send(
      `Arguments: ${commandContent}\nArguments length: ${commandContent.length}`
    );
  },
};
