"use strict";

import fs from "fs";

const path = require("path");

const mockFs: typeof fs = jest.createMockFromModule("fs");

// This is a custom function that our tests can use during setup to specify
// what the files on the "mock" filesystem should look like when any of the
// `fs` APIs are used.
let mockFiles = Object.create(null);

function __setMockFiles(newMockFiles: object) {
  mockFiles = Object.create(null);
  for (const file in newMockFiles) {
    const dir = path.dirname(file);

    if (!mockFiles[dir]) {
      mockFiles[dir] = [];
    }
    mockFiles[dir].push(path.basename(file));
  }
}

// A custom version of `readdirSync` that reads from the special mocked out
// file list set via __setMockFiles
function readdirSync(directoryPath) {
  return mockFiles[directoryPath] || [];
}

Object.defineProperty(mockFs, "__setMockFiles", { value: __setMockFiles });
mockFs.readdirSync = readdirSync;

module.exports = mockFs;
