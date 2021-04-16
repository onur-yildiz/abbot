import getDefaultAudios from "../../util/getDefaultAudios";

jest.mock("fs");

describe("getDefaultAudios", () => {
  const MOCK_FILE_INFO = {
    "./assets/audio/aot.mp3": null,
    "./assets/audio/inv.mp3": null,
  };
  const MOCK_FILE_NAMES = ["aot", "inv"];

  beforeEach(() => {
    require("fs").__setMockFiles(MOCK_FILE_INFO);
  });

  it("should return file names without extensions", () => {
    expect(getDefaultAudios()).toStrictEqual(MOCK_FILE_NAMES);
  });
});
