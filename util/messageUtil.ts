import { Message, MessageReaction, User } from "discord.js";

export const sendDefaultHelpMessage = (message: Message, prefix: string) => {
  message.reply(
    "Hi! You can type " +
      ` ${prefix}help `.toInlineCodeBg() +
      " to see my commands!"
  );
};

export const awaitDone = async (botMessage: Message, userMessage: Message) => {
  const r = await botMessage.react("✅");

  const filter = (reaction: MessageReaction, user: User) =>
    reaction.emoji.name === "✅" && user.id === userMessage.author.id;
  const options = { time: 60000 };
  const collector = botMessage.createReactionCollector(filter, options);

  collector.on("collect", () => {
    botMessage.delete();
    userMessage.delete();
  });
  collector.on("end", () => {
    if (!botMessage.deleted) r.remove();
  });
};
