import { Message } from "discord.js";

const sendDefaultHelpMessage = (message: Message, prefix: string) => {
  message.reply(
    "Hi! You can type " +
      ` ${prefix}help `.toInlineCodeBg() +
      " to see my commands!"
  );
};

export default sendDefaultHelpMessage;
