import fs from "fs";
import Discord, { Command, Message } from "discord.js";
import { commands, guilds } from "../../app";

export = <Command>{
  name: "help",
  description: "List all of my commands or info about a specific command.",
  aliases: ["commands", "hlp"],
  guildOnly: false,
  usage: "?[command name]?",
  args: Args.flexible,
  cooldown: 1,
  async execute(message: Message, args?: string[]) {
    const prefix = guilds.get(message.guild.id).prefix;
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
        const categorySection = {
          name: `${category}:`,
          value: commands.join(", ").toInlineCodeBg(),
        };

        data.push(categorySection);
      });

      embed = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Commands")
        .addFields(...data)
        .setFooter(
          `You can send ${prefix}help [command] to get info on a specific command!`
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
    //TODO also show preinstalled args
    if (command.argList)
      data.push({ name: `Arguments:`, value: `${command.argList.join(", ")}` });
    data.push({
      name: `Cooldown:`,
      value: `${command.cooldown || 3} second(s)`,
    });

    embed = new Discord.MessageEmbed()
      .setColor("#0099ff")
      .setTitle(command.name)
      .addFields(...data);

    try {
      await (await message.channel.send(embed)).react(":mega:");
    } catch (error) {
      console.error(error);
    }
  },
};
