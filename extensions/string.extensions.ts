interface String {
  toBold(): string
  toCodeBg(): string
  toSpoiler(): string
}

Object.defineProperty(String.prototype, 'toBold', {
  value: function toBold() {
    return `\*\*${this}\*\*`
  },
  writable: true,
  configurable: true,
})
Object.defineProperty(String.prototype, 'toCodeBg', {
  value: function toCodeBg() {
    return `\`\`\`${this}\`\`\``
  },
  writable: true,
  configurable: true,
})
Object.defineProperty(String.prototype, 'toSpoiler', {
  value: function toSpoiler() {
    return `\|\|${this}\|\|`
  },
  writable: true,
  configurable: true,
})
