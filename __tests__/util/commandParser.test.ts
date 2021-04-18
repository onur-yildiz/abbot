import { defaultPrefix } from "../../global/globals";
import { getCommandContent, getCommandName } from "../../util/commandParser";

describe("commandParser", () => {
  describe("getCommandContent", () => {
    describe("with default prefix", () => {
      it("return expectedly", () => {
        const commandMessage = ".play    Frank's choice    ";
        const expectedValue = "Frank's choice";

        expect(getCommandContent(commandMessage, defaultPrefix)).toBe(
          expectedValue
        );
      });
    });

    describe("with custom prefix", () => {
      const customPrefix = "tst ";
      it("return expectedly", () => {
        const commandMessage = "tst play    Frank's choice    ";
        const expectedValue = "Frank's choice";

        expect(getCommandContent(commandMessage, customPrefix)).toBe(
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
