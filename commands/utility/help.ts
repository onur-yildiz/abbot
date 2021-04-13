import fs from "fs";
import Discord, { Command, Message } from "discord.js";
import { commands, guilds } from "../../app";
import { awaitDone } from "../../util/awaitDone";
import { getDefaultAudios } from "../../util/getDefaultAudios";

require("dotenv").config();
const defaultPrefix = process.env.PREFIX;

export = <Command>{
  name: "help",
  description: "List all of my commands or info about a specific command.",
  aliases: ["commands", "hlp"],
  guildOnly: false,
  usage: "?[command name]?",
  args: Args.flexible,
  cooldown: 1,
  async execute(message: Message, args?: string[]) {
    let prefix = defaultPrefix;
    if (message.channel.type !== "dm")
      prefix = guilds.get(message.guild.id).prefix;

    const data = [];
    const commandContent = args ? args[1] : "";

    const commandsByCat = new Map<string, string[]>();
    const commandCategories = fs.readdirSync("./commands");
    for (const category of commandCategories) {
      const categoryCommands = fs
        .readdirSync(`./commands/${category}`)
        .filter((file) => file.endsWith(".ts"))
        .map((file) => file.slice(0, -3));
      commandsByCat.set(category, categoryCommands);
    }

    let embed: Discord.MessageEmbed;
    if (commandContent == "") {
      commandsByCat.forEach((commands, category) => {
        const commandList = commands.map((cmd) => cmd.toInlineCodeBg());
        const categorySection = {
          name: `${category}:`,
          value: commandList.join(" "),
        };

        data.push(categorySection);
      });

      embed = new Discord.MessageEmbed()
        .attachFiles(["./assets/images/github.png"])
        .setAuthor(
          "Repo",
          "attachment://github.png",
          "https://github.com/onur-yildiz/abbot"
        )
        .setColor("#222222")
        .setTitle("Commands")
        .addFields(...data)
        .setFooter(
          "You can type " +
            `${defaultPrefix}help [command]`.toInlineCodeBg() +
            " to get info on a specific command!"
        );

      try {
        await message.author.send(embed);
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

    if (command.aliases)
      data.push({ name: `Aliases:`, value: `${command.aliases.join(", ")}` });
    if (command.description)
      data.push({ name: `Description:`, value: `${command.description}` });
    if (command.usage)
      data.push({
        name: `Usage:`,
        value: `${prefix}${command.name} ${command.usage}`,
      });
    if (command.argList) {
      let argList = command.argList;
      if (command.name === "horn") argList = argList.concat(getDefaultAudios());

      argList = argList.map((arg) => arg.toInlineCodeBg());
      data.push({ name: `Arguments:`, value: `${argList.join(" ")}` });
    }
    data.push({
      name: `Cooldown:`,
      value: `${command.cooldown || 3} second(s)`,
    });

    embed = new Discord.MessageEmbed()
      .setColor("#222222")
      .setTitle(command.name)
      .addFields(...data);

    try {
      const responseMessage = await message.channel.send(embed);
      awaitDone(responseMessage, message.author);
    } catch (error) {
      console.error(error);
    }
  },
};
