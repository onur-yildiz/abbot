import { Guild } from "discord.js";
import DBHelper from "../../db/DBHelper";
import { guilds, logger } from "../../global/globals";
import { guildDeleteHandler } from "../../handlers/guildDeleteHandler";

describe("guildDeleteHandler", () => {
  const guild: Guild = ({
    id: "1234",
  } as unknown) as Guild;
  const guild2: Guild = ({
    id: "12345",
  } as unknown) as Guild;
  guilds.set(guild.id, null);

  beforeAll(() => {
    DBHelper.deleteGuildSettings = jest.fn();
  });

  beforeEach(() => {
    guilds.set(guild.id, null);
  });

  it("call `deleteGuildSettings` and delete from `guilds`", async () => {
    await guildDeleteHandler(guild);
    expect(guilds.has(guild.id)).toBe(false);
    expect(DBHelper.deleteGuildSettings).toBeCalledWith(guild);
  });

  it("throw if `guild` does not exist in `guilds`", async () => {
    logger.error = jest.fn();
    await guildDeleteHandler(guild2);
    expect(logger.error).toBeCalled();
  });
});
