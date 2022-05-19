import fs from "fs";
import Discord, { Command, Message } from "discord.js";
import { commands, defaultPrefix, guilds, logger } from "../../global/globals";
import DBHelper from "../../db/DBHelper";
import { ERROR_EXECUTION_ERROR } from "../../constants/messages";
import awaitDone from "../../util/message/awaitDone";

export = <Command>{
  name: "help",
  description: "List all of my commands or info about a specific command.",
  aliases: ["commands", "hlp"],
  isGuildOnly: false,
  usage: "[?command name?]",
  args: Args.flexible,
  cooldown: 1,
  async execute(message: Message, args?: string[]) {
    let prefix = defaultPrefix;
    if (message.channel.type !== "dm")
      prefix = guilds.get(message.guild.id).prefix;

    const data = [];
    const commandContent = args[1] ?? "";

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
      let commandCount = 0;
      commandsByCat.forEach((commands, category) => {
        commandCount += commands.length;
        const commandList = commands.map((cmd) =>
          cmd.toInlineCodeBg().toBold()
        );
        const categorySection = {
          name: `${category.toUpperCaseFirstLetter()} [${commandList.length}]:`,
          value: commandList.join(", "),
        };

        data.push(categorySection);
      });

      embed = new Discord.MessageEmbed()
        .attachFiles(["./assets/images/discord.png"])
        .setAuthor(
          "Abbot",
          "attachment://discord.png",
          "https://onur-yildiz.github.io/abbot/"
        )
        .setColor("#FFD700")
        .setTitle(`Commands [${commandCount}]`)
        .setDescription(
          "For more information on a command, type " +
            `${defaultPrefix}help [command]`.toInlineCodeBg().toBold() +
            "\n\n" +
            "Server prefix: ".toBold() +
            prefix
        )
        .addFields(...data)
        .setTimestamp();

      try {
        return await message.channel.send(embed);
      } catch (error) {
        logger.error(
          `Could not send help message @${message.guild.name}<${message.guild.id}>. `,
          error
        );
        return message.reply(ERROR_EXECUTION_ERROR);
      }
    }

    const command =
      commands.get(commandContent) ||
      commands.find((c) => c.aliases && c.aliases.includes(commandContent));

    if (!command) {
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

    data.push({
      name: `Cooldown:`,
      value: `${command.cooldown || 3} second(s)`,
    });

    if (command.argList) {
      let argList: string[] = [...command.argList];

      if (command.name === "horn" && message.channel.type !== "dm") {
        const guildSettings = await DBHelper.getGuildSettings(message.guild, {
          audioAliases: 1,
        });

        for (const audioAlias of guildSettings.audioAliases) {
          argList.push(audioAlias.name);
        }
        argList.sort();
      }

      argList = argList.map((arg) => arg.toInlineCodeBg());

      //? Only horn arguments can be too long currently, currently this is should be printed only horn command
      let argsStr = argList.join(" ");
      if (argsStr.length > 1024)
        data.push({
          name: `Arguments:`,
          value:
            `Argument list is too long. (${argList.length})\nType ` +
            ` ${prefix}args horn `.toInlineCodeBg() +
            ` (aliases accepted) to see all arguments.`,
        });
      else data.push({ name: `Arguments:`, value: `${argsStr}` });
    }

    embed = new Discord.MessageEmbed()
      .attachFiles(["./assets/images/discord.png"])
      .setAuthor(
        "Abbot",
        "attachment://discord.png",
        "https://onur-yildiz.github.io/abbot/"
      )
      .setColor("#FFD700")
      .setTitle(command.name)
      .addFields(...data);

    try {
      const responseMessage = await message.channel.send(embed);
      if (message.channel.type !== "dm") awaitDone(responseMessage, message);
    } catch (error) {
      logger.error(error);
    }
  },
};
