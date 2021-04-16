import { Message, MessageReaction, User } from "discord.js";

export const sendDefaultHelpMessage = (message: Message, prefix: string) => {
  message.reply(
    "Hi! You can type " +
      ` ${prefix}help `.toInlineCodeBg() +
      " to see my commands!"
  );
};

export const awaitDone = async (message: Message, author: User) => {
  const r = await message.react("✅");

  const filter = (reaction: MessageReaction, user: User) =>
    reaction.emoji.name === "✅" && user.id === author.id;
  const options = { time: 60000 };
  const collector = message.createReactionCollector(filter, options);

  collector.on("collect", (r) => message.delete());
  collector.on("end", (collected) => {
    if (!message.deleted) r.remove();
  });
};