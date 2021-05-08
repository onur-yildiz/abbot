import { Client, GuildData, Message } from "discord.js";
import { ERROR_EXECUTION_ERROR } from "../../constants/messages";
import { commands, guilds, logger } from "../../global/globals";
import { messageHandler } from "../../handlers/messageHandler";
import * as parser from "../../util/commandParser";
import "../../extensions/string";
import * as ga from "../../util/guildActions";
import { fetchGuildData } from "../../util/guildActions";

Object.defineProperty(parser, "getCommandName", {
  value: jest.fn().mockReturnValue("test"),
});

Object.defineProperty(parser, "getCommandContent", {
  value: jest.fn().mockReturnValue(""),
});

describe("messageHandler", () => {
  const client: Client = ({
    user: {
      id: "user-id",
    },
  } as unknown) as Client;
  const message: Message = ({
    author: {
      id: "author-id",
      bot: false,
    },
    channel: {
      type: "text",
      send: jest.fn(),
    },
    guild: {
      id: "guild-id",
    },
    content: "!!togglegreeting",
    reply: jest.fn(),
  } as unknown) as Message;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    guilds.set(message.guild.id, ({ prefix: "!!" } as unknown) as GuildData);
    commands.set("test", {
      name: "test",
      description: "desc",
      aliases: ["tst", "t"],
      args: Args.none,
      isGuildOnly: false,
      usage: "usage",
      execute: jest.fn(),
    });

    commands.set("test2", {
      name: "test2",
      description: "desc2",
      aliases: ["tst2", "t2"],
      args: Args.flexible,
      isGuildOnly: false,
      usage: "usage2",
      execute: jest.fn(),
    });

    commands.set("error", {
      name: "error",
      description: "error",
      aliases: ["err", "e"],
      args: Args.flexible,
      isGuildOnly: false,
      usage: "err",
      execute: jest.fn().mockImplementation(() => {
        throw new Error();
      }),
    });
  });

  it("run command.execute 1 arg", async () => {
    const cmd = commands.get("test");
    await messageHandler(client, message);
    expect(cmd.execute).toBeCalledWith(message);
  });

  it("run command.execute 2 args", async () => {
    Object.defineProperty(parser, "getCommandName", {
      value: jest.fn().mockReturnValue("test2"),
    });

    const cmd = commands.get("test2");
    await messageHandler(client, message);
    expect(cmd.execute).toBeCalledWith(message, ["test2", ""]);
  });

  it("reply execution error msg", async () => {
    Object.defineProperty(parser, "getCommandName", {
      value: jest.fn().mockReturnValue("error"),
    });
    logger.error = jest.fn();

    await messageHandler(client, message);
    expect(logger.error).toBeCalled();
    expect(message.reply).toBeCalledWith(ERROR_EXECUTION_ERROR.toBold());
  });

  it("return if author bot", async () => {
    const _message: Message = ({
      ...message,
      author: { bot: true },
    } as unknown) as Message;
    guilds.get = jest.fn();

    expect(await messageHandler(client, _message)).toBeUndefined();
    expect(guilds.get).not.toBeCalled();
  });

  it("not get guild if channel type 'dm'", async () => {
    const _message: Message = ({
      ...message,
      channel: { type: "dm" },
    } as unknown) as Message;
    guilds.get = jest.fn();

    expect(await messageHandler(client, _message)).toBeUndefined();
    expect(guilds.get).not.toBeCalled();
  });

  it("call fetchGuildData if guild not in memory", async () => {
    guilds.clear();
    Object.defineProperty(ga, "fetchGuildData", { value: jest.fn() });

    expect(await messageHandler(client, message)).toBeUndefined();
    expect(fetchGuildData).toBeCalled();
  });
});
