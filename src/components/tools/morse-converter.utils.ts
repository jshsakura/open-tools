// Text <-> Morse code mapping and encode/decode helpers.

export const MORSE_CODE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
  I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
  Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....",
  "6": "-....", "7": "--...", "8": "---..", "9": "----.", "0": "-----", ".": ".-.-.-", ",": "--..--",
  "?": "..--..", "'": ".----.", "!": "-.-.--", "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...",
  ":": "---...", ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", _: "..--.-", '"': ".-..-.",
  $: "...-..-", "@": ".--.-.", " ": "/",
}

export const REVERSE_MORSE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_CODE).map(([key, value]) => [value, key]),
)

// Encode plain text into Morse. Letters are separated by a single space,
// words (the " " char) map to "/" surrounded by spaces. Unknown chars are dropped.
export function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split("")
    .map((char) => MORSE_CODE[char] ?? "")
    .filter(Boolean)
    .join(" ")
    .trim()
}

// Decode Morse back into text. Word boundaries are "/" tokens (or any run of
// whitespace around them). Unknown morse tokens are dropped.
export function morseToText(morse: string): string {
  return morse
    .trim()
    .split("/")
    .map((word) =>
      word
        .trim()
        .split(/\s+/)
        .map((token) => REVERSE_MORSE[token] ?? "")
        .join(""),
    )
    .join(" ")
    .trim()
}
