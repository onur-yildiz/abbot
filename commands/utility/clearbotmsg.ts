import { Collection, Command, Message } from "discord.js";

export = <Command>{
  name: "clearbotmsg",
  aliases: ["clbm", "clrbotmsg", "clbotmsg"],
  description: "Clear the bot messages. (message cache is limited to 200)",
  usage: "",
  permissions: "MANAGE_MESSAGES",
  args: Args.none,
  isGuildOnly: true,
  cooldown: 8,
  async execute(message: Message) {
    const messageCache = message.channel.messages.cache;
    sweepDeleted(messageCache);
    deleteMessages(messageCache);
    sweepDeleted(messageCache);
  },
};

const sweepDeleted = (messageCache: Collection<string, Message>) => {
  messageCache.sweep((message) => message.deleted && message.author.bot);
};

const deleteMessages = (messageCache: Collection<string, Message>) => {
  const messages = messageCache.array().reverse();
  messages.forEach((message) => {
    if (message.deletable && message.author.bot) {
      message.delete();
    }
  });
};
