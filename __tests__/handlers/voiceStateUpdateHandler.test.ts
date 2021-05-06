import { GuildData, VoiceConnection, VoiceState } from "discord.js";
import dbHelper from "../../db/dbHelper";
import { defaultPrefix } from "../../global/globals";
import { voiceStateUpdateHandler } from "../../handlers/voiceStateUpdateHandler";
import * as ga from "../../util/guildActions";
import { resetState } from "../../util/guildActions";

jest.mock("../../util/guildActions");
jest.mock("discord.js");

const { Permissions } = jest.requireActual("discord.js");

const mockSetVolume = jest.fn();
const voiceConnection: VoiceConnection = ({
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
} as unknown) as VoiceConnection;

Object.defineProperty(ga, "fetchGuildData", {
  value: jest.fn().mockReturnValue(<GuildData>{
    textChannel: null,
    voiceChannel: null,
    connection: voiceConnection,
    songs: [],
    volume: 1,
    queueActive: false,
    greetingEnabled: true,
    audioAliases: [],
    prefix: defaultPrefix,
    lastTrackStart: null,
  }),
});

Object.defineProperty(dbHelper, "getGuildSettings", {
  value: jest.fn().mockReturnValue({
    themes: new Map().set("user-id", "test-theme"),
  }),
});

Object.defineProperty(dbHelper, "saveGuildSettings", {
  value: jest.fn(),
});

describe("voiceStateUpdateHandler", () => {
  const perms = new Permissions().add("CONNECT").add("SPEAK");
  const mockPermissionsFor = jest.fn((): Readonly<Permissions> => perms);
  // .play, .on, .on
  const oldVoiceState: VoiceState = ({
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
      join: jest.fn().mockReturnValue(voiceConnection),
      permissionsFor: mockPermissionsFor,
    },
    channelID: "0",
  } as unknown) as VoiceState;
  const newVoiceState: VoiceState = ({
    ...oldVoiceState,
    channelID: "1",
  } as unknown) as VoiceState;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("run successfully with user theme if guildSettings.themes has user theme", async () => {
    await voiceStateUpdateHandler(oldVoiceState, newVoiceState);
    expect(voiceConnection.play).toBeCalledTimes(1);
    expect(voiceConnection.play).toBeCalledWith("test-theme");
    expect(mockSetVolume).toBeCalledTimes(1);
  });

  it("run successfully with default theme if guildSettings.themes empty", async () => {
    Object.defineProperty(dbHelper, "getGuildSettings", {
      value: jest.fn().mockReturnValue({
        themes: new Map(),
      }),
    });

    await voiceStateUpdateHandler(oldVoiceState, newVoiceState);
    expect(voiceConnection.play).toBeCalledTimes(1);
    expect(voiceConnection.play).toBeCalledWith("./assets/audio/ww.mp3");
    expect(mockSetVolume).toBeCalledTimes(1);
  });

  it("run successfully with default theme if guildSettings falsy", async () => {
    Object.defineProperty(dbHelper, "getGuildSettings", {
      value: jest.fn(),
    });

    await voiceStateUpdateHandler(oldVoiceState, newVoiceState);
    expect(voiceConnection.play).toBeCalledTimes(1);
    expect(voiceConnection.play).toBeCalledWith("./assets/audio/ww.mp3");
    expect(mockSetVolume).toBeCalledTimes(1);
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
      const _newVoiceState: VoiceState = ({
        ...newVoiceState,
        channel: undefined,
      } as unknown) as VoiceState;

      expect(
        await voiceStateUpdateHandler(oldVoiceState, _newVoiceState)
      ).toBeUndefined();
      expect(resetState).toBeCalledTimes(1);
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
      const _newVoiceState: VoiceState = ({
        ...newVoiceState,
        channelID: oldVoiceState.channelID,
      } as unknown) as VoiceState;

      expect(
        await voiceStateUpdateHandler(oldVoiceState, _newVoiceState)
      ).toBeUndefined();
      expect(voiceConnection.play).not.toBeCalled();
      expect(mockSetVolume).not.toBeCalled();
    });

    it("return if channelID falsy", async () => {
      const _newVoiceState: VoiceState = ({
        ...newVoiceState,
        channelID: undefined,
      } as unknown) as VoiceState;

      expect(
        await voiceStateUpdateHandler(oldVoiceState, _newVoiceState)
      ).toBeUndefined();
      expect(voiceConnection.play).not.toBeCalled();
      expect(mockSetVolume).not.toBeCalled();
    });
  });

  describe("queueActive and greetingEnabled check", () => {
    it("return if queueActive true", async () => {
      Object.defineProperty(ga, "fetchGuildData", {
        value: jest.fn().mockReturnValue(<GuildData>{
          queueActive: true,
          greetingEnabled: true,
        }),
      });

      expect(
        await voiceStateUpdateHandler(oldVoiceState, newVoiceState)
      ).toBeUndefined();
      expect(voiceConnection.play).not.toBeCalled();
      expect(mockSetVolume).not.toBeCalled();
    });

    it("return if greetingEnabled false", async () => {
      Object.defineProperty(ga, "fetchGuildData", {
        value: jest.fn().mockReturnValue(<GuildData>{
          queueActive: false,
          greetingEnabled: false,
        }),
      });

      expect(
        await voiceStateUpdateHandler(oldVoiceState, newVoiceState)
      ).toBeUndefined();
      expect(voiceConnection.play).not.toBeCalled();
      expect(mockSetVolume).not.toBeCalled();
    });
  });
});
