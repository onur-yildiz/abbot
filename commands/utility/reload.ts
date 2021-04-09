import fs from "fs";

import { Command, Message } from "discord.js";
import { commands } from "../../app";
import { getCommandContent } from "../../util/getCommandContent";

//! PICKS CHANGES IN DIST/COMMANDS/
//! IF YOU WANT TO CHANGE 'EXECUTE' FUNCTION OF A COMMAND, YOU SHOULD CHANGE THE ORIGINAL .TS FILE AND RECOMPILE!
//! STRING AND BOOLEAN CHANGES ON RUN SHOULD BE FINE.

export = <Command>{
  name: "reload",
  aliases: ["rl"],
  guildOnly: false,
  usage: "[command]",
  description: "Reloads a command",
  execute(message: Message) {
    const reloadCommandName = getCommandContent(message.content); // ~reload [Command to be reloaded]
    const command =
      commands.get(reloadCommandName) ||
      commands.find((cmd) => cmd.aliases.includes(reloadCommandName));

    if (command == null)
      return message.channel.send(
        `There is no command with name or alias \`${reloadCommandName}\`, ${message.author}!`
      );

    const commandFolders = fs.readdirSync("./commands");
    const folderName = commandFolders.find((folder) =>
      fs.readdirSync(`./commands/${folder}`).includes(`${command.name}.ts`)
    );

    delete require.cache[require.resolve(`../${folderName}/${command.name}`)];

    try {
      const newCommand = require(`../${folderName}/${command.name}`);
      commands.set(newCommand.name, newCommand);
      message.channel.send(`Command \`${command.name}\` was reloaded!`);
    } catch (error) {
      console.error(error);
      message.channel.send(
        `There was an error while reloading \`${command.name}\`:\n\`${error.message}\``
      );
    }
  },
};