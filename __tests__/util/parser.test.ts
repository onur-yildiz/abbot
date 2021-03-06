import { defaultPrefix } from "../../global/globals";
import getCommandArgs, {
  getCommandName,
} from "../../util/parser/commandParser";

describe("commandParser", () => {
  describe("getCommandArgs", () => {
    describe("with default prefix", () => {
      it("return expectedly", () => {
        const commandMessage = ".play    Frank's choice    ";
        const expectedValue = ["Frank's", "choice"];

        expect(getCommandArgs(commandMessage, defaultPrefix)).toStrictEqual(
          expectedValue
        );
      });
    });

    describe("with custom prefix", () => {
      const customPrefix = "tst ";
      it("return expectedly", () => {
        const commandMessage = "tst play    Frank's choice    ";
        const expectedValue = ["Frank's", "choice"];

        expect(getCommandArgs(commandMessage, customPrefix)).toStrictEqual(
          expectedValue
        );
      });
    });
  });

  describe("getCommandName", () => {
    describe("with default prefix", () => {
      it("return expectedly", () => {
        const commandMessage = ".play    Frank's choice    ";
        const expectedValue = "play";

        expect(getCommandName(commandMessage, defaultPrefix)).toBe(
          expectedValue
        );
      });

      it("return as lowercase", () => {
        const commandMessage = ".hOrN    Frank's choice    ";
        const expectedValue = "horn";

        expect(getCommandName(commandMessage, defaultPrefix)).toBe(
          expectedValue
        );
      });

      it("return '' if wrong prefix", () => {
        const commandMessage = "pls hOrN    Frank's choice    ";
        const expectedValue = "";

        expect(getCommandName(commandMessage, defaultPrefix)).toBe(
          expectedValue
        );
      });
    });

    describe("with custom prefix", () => {
      const customPrefix = "tst ";
      it("return expectedly", () => {
        const commandMessage = "tst pLaY    Frank's choice    ";
        const expectedValue = "play";

        expect(getCommandName(commandMessage, customPrefix)).toBe(
          expectedValue
        );
      });

      it("return as lowercase", () => {
        const commandMessage = "tst hOrN    Frank's choice    ";
        const expectedValue = "horn";

        expect(getCommandName(commandMessage, customPrefix)).toBe(
          expectedValue
        );
      });

      it("return '' if wrong prefix", () => {
        const commandMessage = "!!hOrN    Frank's choice    ";
        const expectedValue = "";

        expect(getCommandName(commandMessage, customPrefix)).toBe(
          expectedValue
        );
      });
    });
  });
});
