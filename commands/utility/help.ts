import fs from "fs";
import { Command, Message } from "discord.js";
import { commands } from "../../app";
import { getCommandContent } from "../../util/getCommandContent";

export = <Command>{
  name: "help",
  description: "List all of my commands or info about a specific command.",
  aliases: ["commands", "hlp"],
  guildOnly: false,
  usage: "",
  cooldown: 5,
  async execute(message: Message) {
    const prefix = process.env.PREFIX;
    const data = [];
    const commandContent = getCommandContent(message.content);

    const commandsByCat = new Map<string, string[]>();
    const commandCategories = fs.readdirSync("./commands");
    for (const category of commandCategories) {
      const categoryCommands = fs
        .readdirSync(`./commands/${category}`)
        .filter((file) => file.endsWith(".ts"))
        .map((file) => file.slice(0, -3));
      commandsByCat.set(category, categoryCommands);
    }

    if (commandContent == "") {
      data.push("Here's a list of all my commands:");

      commandsByCat.forEach((commands, category) => {
        const categorySection =
          `${category}:` + "\n" + commands.join(", ").toInlineCodeBg();

        data.push(categorySection);
      });

      data.push(
        `\nYou can send \`${prefix}help [command]\` to get info on a specific command!`
      );

      try {
        await message.author.send(data, { split: true });
        if (message.channel.type === "dm") return;
        return message.reply("I've sent you a DM with all my commands!");
      } catch (error) {
        console.error(
          `Could not send help DM to ${message.author.tag}.\n`,
          error
        );
        message.reply(
          "it seems like I can't DM you! Do you have DMs disabled?"
        );
      }
    }

    const command =
      commands.get(commandContent) ||
      commands.find((c) => c.aliases && c.aliases.includes(commandContent));

    if (command == null) {
      return message.reply("that's not a valid command!");
    }

    data.push(`[Name]: ${command.name}`);

    if (command.aliases != null)
      data.push(`[Aliases]: ${command.aliases.join(", ")}`);
    if (command.description != null)
      data.push(`[Description]: ${command.description}`);
    if (command.usage != null)
      data.push(`[Usage]: ${prefix}${command.name} ${command.usage}`);

    data.push(`[Cooldown]: ${command.cooldown || 3} second(s)`);

    const msg = data.join("\n").toCodeBgCs();
    message.channel.send(msg, { split: true });
  },
};
