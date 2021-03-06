import { GuildData, VoiceConnection, VoiceState } from "discord.js";
import DBHelper from "../../db/DBHelper";
import { defaultPrefix } from "../../global/globals";
import voiceStateUpdateHandler from "../../handlers/voiceStateUpdateHandler";
import "../../util/fetchGuildData";

jest.mock("discord.js");

const { Permissions } = jest.requireActual("discord.js");

const mockSetVolume = jest.fn();
const voiceConnection: VoiceConnection = {
  play: jest.fn().mockReturnValue({
    setVolumeLogarithmic: null,
    on: jest.fn().mockReturnValue({
      setVolumeLogarithmic: null,
      on: jest.fn().mockReturnValue({
        setVolumeLogarithmic: mockSetVolume,
        on: null,
      }),
    }),
  }),
} as unknown as VoiceConnection;
const mockConnectToVoiceChannel = jest.fn();
const mockResetGuildData = jest.fn();
const mockFetchGuildData = jest.fn(
  () =>
    <GuildData>{
      textChannel: null,
      voiceChannel: null,
      connection: voiceConnection,
      songs: [],
      volume: 1,
      isQueueActive: false,
      isLoopActive: false,
      greetingEnabled: true,
      audioAliases: [],
      prefix: defaultPrefix,
      lastTrackStart: null,
      isArbitrarySoundsEnabled: false,
      annoyanceList: new Map<string, string>(),
      connectToVoice: mockConnectToVoiceChannel,
      reset: mockResetGuildData,
    }
);
jest.mock("../../util/fetchGuildData", () => () => mockFetchGuildData());

Object.defineProperty(DBHelper, "getGuildSettings", {
  value: jest.fn().mockReturnValue({
    themes: new Map().set("user-id", "test-theme"),
  }),
});

Object.defineProperty(DBHelper, "saveGuildSettings", {
  value: jest.fn(),
});

describe("voiceStateUpdateHandler", () => {
  const perms = new Permissions().add("CONNECT").add("SPEAK");
  const mockPermissionsFor = jest.fn((): Readonly<Permissions> => perms);
  // .play, .on, .on
  const oldVoiceState: VoiceState = {
    guild: {
      me: {
        id: "user-id",
      },
    },
    member: {
      id: "user-id",
      guild: {},
      user: {
        id: "user-id",
        bot: false,
      },
      voice: {
        channel: {},
      },
    },
    channel: {
      guild: {
        id: "guild-id",
      },
      join: jest.fn().mockReturnValue(voiceConnection),
      permissionsFor: mockPermissionsFor,
    },
    channelID: "0",
  } as unknown as VoiceState;
  const newVoiceState: VoiceState = {
    ...oldVoiceState,
    channelID: "1",
  } as unknown as VoiceState;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("run successfully with user theme if guildSettings.themes has user theme", async () => {
    await voiceStateUpdateHandler(oldVoiceState, newVoiceState);
    expect(voiceConnection.play).toBeCalledTimes(1);
    expect(voiceConnection.play).toBeCalledWith("test-theme");
    expect(mockSetVolume).toBeCalledTimes(1);
  });

  it("do not connect or play theme if guildSettings.themes empty", async () => {
    Object.defineProperty(DBHelper, "getGuildSettings", {
      value: jest.fn().mockReturnValue({
        themes: new Map(),
        connectToVoiceChannel: mockConnectToVoiceChannel,
      }),
    });

    await voiceStateUpdateHandler(oldVoiceState, newVoiceState);
    expect(mockConnectToVoiceChannel).toBeCalledTimes(0);
    expect(voiceConnection.play).toBeCalledTimes(0);
    expect(mockSetVolume).toBeCalledTimes(0);
  });

  it("do not connect or play theme if guildSettings falsy", async () => {
    Object.defineProperty(DBHelper, "getGuildSettings", {
      value: jest.fn(),
    });

    await voiceStateUpdateHandler(oldVoiceState, newVoiceState);
    expect(mockConnectToVoiceChannel).toBeCalledTimes(0);
    expect(voiceConnection.play).toBeCalledTimes(0);
    expect(mockSetVolume).toBeCalledTimes(0);
  });

  describe("user bot check", () => {
    beforeAll(() => {
      oldVoiceState.member.user.bot = true;
      newVoiceState.member.user.bot = true;
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("call resetState", async () => {
      const _newVoiceState: VoiceState = {
        ...newVoiceState,
        channel: undefined,
      } as unknown as VoiceState;

      expect(
        await voiceStateUpdateHandler(oldVoiceState, _newVoiceState)
      ).toBeUndefined();
      expect(mockResetGuildData).toBeCalledTimes(1);
      expect(voiceConnection.play).not.toBeCalled();
      expect(mockSetVolume).not.toBeCalled();
    });

    it("return", async () => {
      expect(
        await voiceStateUpdateHandler(oldVoiceState, newVoiceState)
      ).toBeUndefined();
      expect(voiceConnection.play).not.toBeCalled();
      expect(mockSetVolume).not.toBeCalled();
    });
  });

  describe("channelID check", () => {
    it("return if channelID same", async () => {
      const _newVoiceState: VoiceState = {
        ...newVoiceState,
        channelID: oldVoiceState.channelID,
      } as unknown as VoiceState;

      expect(
        await voiceStateUpdateHandler(oldVoiceState, _newVoiceState)
      ).toBeUndefined();
      expect(voiceConnection.play).not.toBeCalled();
      expect(mockSetVolume).not.toBeCalled();
    });

    it("return if channelID falsy", async () => {
      const _newVoiceState: VoiceState = {
        ...newVoiceState,
        channelID: undefined,
      } as unknown as VoiceState;

      expect(
        await voiceStateUpdateHandler(oldVoiceState, _newVoiceState)
      ).toBeUndefined();
      expect(voiceConnection.play).not.toBeCalled();
      expect(mockSetVolume).not.toBeCalled();
    });
  });

  describe("isQueueActive and greetingEnabled check", () => {
    it("return if isQueueActive true", async () => {
      mockFetchGuildData.mockImplementationOnce(() => ({
        ...mockFetchGuildData(),
        greetingEnabled: true,
        isQueueActive: true,
      }));

      expect(
        await voiceStateUpdateHandler(oldVoiceState, newVoiceState)
      ).toBeUndefined();
      expect(voiceConnection.play).not.toBeCalled();
      expect(mockSetVolume).not.toBeCalled();
    });

    it("return if greetingEnabled false", async () => {
      mockFetchGuildData.mockImplementationOnce(() => ({
        ...mockFetchGuildData(),
        isQueueActive: false,
        greetingEnabled: false,
      }));

      expect(
        await voiceStateUpdateHandler(oldVoiceState, newVoiceState)
      ).toBeUndefined();
      expect(voiceConnection.play).not.toBeCalled();
      expect(mockSetVolume).not.toBeCalled();
    });
  });
});
