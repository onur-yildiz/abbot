interface String {
  toBold(): string;
  toItalic(): string;
  toInlineCodeBg(): string;
  toCodeBg(): string;
  toCodeBgCs(): string;
  toSpoiler(): string;
  toUpperCaseFirstLetter(): string;
}

Object.defineProperty(String.prototype, "toBold", {
  value: function toBold() {
    return `\*\*${this}\*\*`;
  },
  writable: true,
  configurable: true,
});

Object.defineProperty(String.prototype, "toItalic", {
  value: function toItalic() {
    return `\*${this}\*`;
  },
  writable: true,
  configurable: true,
});

Object.defineProperty(String.prototype, "toInlineCodeBg", {
  value: function toInlineCodeBg() {
    return `\`${this}\``;
  },
  writable: true,
  configurable: true,
});

Object.defineProperty(String.prototype, "toCodeBg", {
  value: function toCodeBg() {
    return `\`\`\`${this}\`\`\``;
  },
  writable: true,
  configurable: true,
});

Object.defineProperty(String.prototype, "toCodeBgCs", {
  value: function toCodeBgCs() {
    return `\`\`\`cs\n${this}\n\`\`\``;
  },
  writable: true,
  configurable: true,
});

Object.defineProperty(String.prototype, "toSpoiler", {
  value: function toSpoiler() {
    return `\|\|${this}\|\|`;
  },
  writable: true,
  configurable: true,
});

Object.defineProperty(String.prototype, "toUpperCaseFirstLetter", {
  value: function toSpoiler() {
    return `${this.charAt(0).toUpperCase() + this.slice(1)}`;
  },
  writable: true,
  configurable: true,
});
