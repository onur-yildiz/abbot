import { Message, Permissions } from "discord.js";
import {
  BOT_NOT_IN_CHANNEL,
  BOT_NOT_IN_SAME_CHANNEL,
  JOIN_CHANNEL_GENERIC,
  PERMISSIONS_PLAY,
} from "../../constants/messages";
import {
  checkVoiceChannelAvailability,
  checkUserInAChannel,
} from "../../util/checker";

describe("checker", () => {
  let message: Message;
  const mockPermissionsFor = jest.fn((): Readonly<Permissions> => null);

  beforeEach(() => {
    message = null;
  });

  describe("#checkVoiceChannelAvailability", () => {
    it("return null if both in same channel and bot has perms", () => {
      message = ({
        member: {
          voice: {
            channel: {
              id: "same-id",
            },
          },
        },
        guild: {
          voice: {
            channel: {
              id: "same-id",
            },
          },
        },
      } as unknown) as Message;
      const perms = new Permissions().add("CONNECT").add("SPEAK");
      message.member.voice.channel.permissionsFor = mockPermissionsFor.mockReturnValue(
        perms
      );
      expect(checkVoiceChannelAvailability(message)).toBeNull();
    });

    it("return BOT_NOT_IN_SAME_CHANNEL if in different channels", () => {
      message = ({
        member: {
          voice: {
            channel: {
              id: "same-id",
            },
          },
        },
        guild: {
          voice: {
            channel: {
              id: "diff-id",
            },
          },
        },
      } as unknown) as Message;
      const perms = new Permissions().add("CONNECT").add("SPEAK");
      message.member.voice.channel.permissionsFor = mockPermissionsFor.mockReturnValue(
        perms
      );
      expect(checkVoiceChannelAvailability(message)).toBe(
        BOT_NOT_IN_SAME_CHANNEL
      );
    });

    describe("user not in a channel", () => {
      test("if user voiceState is falsy", () => {
        message = ({
          member: {},
          guild: {
            voice: {
              channel: {
                id: "same-id",
              },
            },
          },
        } as unknown) as Message;
        expect(message.member.voice).toBeFalsy();
        expect(checkVoiceChannelAvailability(message)).toBe(
          JOIN_CHANNEL_GENERIC
        );
      });

      test("if user voice channel is falsy", () => {
        message = ({
          member: {
            voice: {},
          },
          guild: {
            voice: {
              channel: {
                id: "same-id",
              },
            },
          },
        } as unknown) as Message;
        expect(checkVoiceChannelAvailability(message)).toBe(
          JOIN_CHANNEL_GENERIC
        );
      });
    });

    describe("false permissions", () => {
      test("if no `CONNECT` perm", () => {
        message = ({
          member: {
            voice: {
              channel: {
                id: "same-id",
              },
            },
          },
          guild: {
            voice: {
              channel: {
                id: "same-id",
              },
            },
          },
        } as unknown) as Message;
        const perms = new Permissions().add("VIEW_GUILD_INSIGHTS").add("SPEAK");
        message.member.voice.channel.permissionsFor = mockPermissionsFor.mockReturnValue(
          perms
        );
        expect(checkVoiceChannelAvailability(message)).toBe(PERMISSIONS_PLAY);
      });

      test("if no `SPEAK` perm", () => {
        message = ({
          member: {
            voice: {
              channel: {
                id: "same-id",
              },
            },
          },
          guild: {
            voice: {
              channel: {
                id: "same-id",
              },
            },
          },
        } as unknown) as Message;
        const perms = new Permissions().add("CONNECT").add("VIEW_AUDIT_LOG");
        message.member.voice.channel.permissionsFor = mockPermissionsFor.mockReturnValue(
          perms
        );
        expect(checkVoiceChannelAvailability(message)).toBe(PERMISSIONS_PLAY);
      });

      test("if no `SPEAK` and `CONNECT` perm", () => {
        message = ({
          member: {
            voice: {
              channel: {
                id: "same-id",
              },
            },
          },
          guild: {
            voice: {
              channel: {
                id: "same-id",
              },
            },
          },
        } as unknown) as Message;
        const perms = new Permissions().add("USE_VAD").add("VIEW_AUDIT_LOG");
        message.member.voice.channel.permissionsFor = mockPermissionsFor.mockReturnValue(
          perms
        );
        expect(checkVoiceChannelAvailability(message)).toBe(PERMISSIONS_PLAY);
      });
    });

    describe("bot not in a channel", () => {
      test("if bot voice state is falsy", () => {
        message = ({
          member: {
            voice: {
              channel: {
                id: "same-id",
              },
            },
          },
          guild: {},
        } as unknown) as Message;
        const perms = new Permissions().add("CONNECT").add("SPEAK");
        message.member.voice.channel.permissionsFor = mockPermissionsFor.mockReturnValue(
          perms
        );
        expect(checkVoiceChannelAvailability(message)).toBe(BOT_NOT_IN_CHANNEL);
      });

      test("if bot voice channel is falsy", () => {
        message = ({
          member: {
            voice: {
              channel: {
                id: "same-id",
              },
            },
          },
          guild: { voice: {} },
        } as unknown) as Message;
        const perms = new Permissions().add("CONNECT").add("SPEAK");
        message.member.voice.channel.permissionsFor = mockPermissionsFor.mockReturnValue(
          perms
        );
        expect(checkVoiceChannelAvailability(message)).toBe(BOT_NOT_IN_CHANNEL);
      });
    });
  });

  describe("#checkUserInAChannel", () => {
    it("return null if user in a channel", () => {
      message = ({
        member: {
          voice: {
            channel: {},
          },
        },
      } as unknown) as Message;
      expect(checkUserInAChannel(message)).toBeNull();
    });
    describe("user not in a channel", () => {
      test("if user voice state is falsy", () => {
        message = ({
          member: {},
        } as unknown) as Message;
        expect(checkUserInAChannel(message)).toBe(JOIN_CHANNEL_GENERIC);
      });
      test("if user voice channel is falsy", () => {
        message = ({
          member: {},
        } as unknown) as Message;
        expect(checkUserInAChannel(message)).toBe(JOIN_CHANNEL_GENERIC);
      });
    });
  });
});
