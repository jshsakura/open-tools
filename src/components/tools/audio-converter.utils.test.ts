import { describe, expect, it } from "vitest"

import {
  buildAudioArgs,
  FORMATS,
  type AudioFormat,
} from "./audio-converter.utils"

describe("FORMATS table", () => {
  it("maps mp3 to libmp3lame / mp3 / audio/mpeg (lossy)", () => {
    expect(FORMATS.mp3).toEqual({
      codec: "libmp3lame",
      ext: "mp3",
      mime: "audio/mpeg",
      lossy: true,
    })
  })

  it("maps aac to aac codec with the m4a extension and mp4 mime (lossy)", () => {
    expect(FORMATS.aac).toEqual({
      codec: "aac",
      ext: "m4a",
      mime: "audio/mp4",
      lossy: true,
    })
  })

  it("maps ogg to libvorbis / ogg / audio/ogg (lossy)", () => {
    expect(FORMATS.ogg).toEqual({
      codec: "libvorbis",
      ext: "ogg",
      mime: "audio/ogg",
      lossy: true,
    })
  })

  it("maps wav to pcm_s16le / wav / audio/wav (lossless)", () => {
    expect(FORMATS.wav).toEqual({
      codec: "pcm_s16le",
      ext: "wav",
      mime: "audio/wav",
      lossy: false,
    })
  })

  it("maps flac to flac / flac / audio/flac (lossless)", () => {
    expect(FORMATS.flac).toEqual({
      codec: "flac",
      ext: "flac",
      mime: "audio/flac",
      lossy: false,
    })
  })
})

describe("buildAudioArgs — codec selection", () => {
  const cases: Array<[AudioFormat, string]> = [
    ["mp3", "libmp3lame"],
    ["aac", "aac"],
    ["ogg", "libvorbis"],
    ["wav", "pcm_s16le"],
    ["flac", "flac"],
  ]

  it.each(cases)("uses the correct codec for %s", (format, codec) => {
    // Act
    const args = buildAudioArgs({
      inputName: "input.wav",
      outputName: `output.${FORMATS[format].ext}`,
      format,
      bitrate: 192,
    })

    // Assert
    const idx = args.indexOf("-c:a")
    expect(idx).toBeGreaterThanOrEqual(0)
    expect(args[idx + 1]).toBe(codec)
  })
})

describe("buildAudioArgs — structure", () => {
  it("includes -i with the input name and ends with the output name", () => {
    // Act
    const args = buildAudioArgs({
      inputName: "input.flac",
      outputName: "output.mp3",
      format: "mp3",
      bitrate: 256,
    })

    // Assert
    expect(args).toContain("-i")
    expect(args[args.indexOf("-i") + 1]).toBe("input.flac")
    expect(args.at(-1)).toBe("output.mp3")
  })

  it("disables video with -vn for every format", () => {
    // Act
    const args = buildAudioArgs({
      inputName: "in.m4a",
      outputName: "out.flac",
      format: "flac",
      bitrate: 320,
    })

    // Assert
    expect(args).toContain("-vn")
  })
})

describe("buildAudioArgs — bitrate flag is lossy-only", () => {
  it("adds -b:a <bitrate>k for lossy mp3", () => {
    // Act
    const args = buildAudioArgs({
      inputName: "in.wav",
      outputName: "out.mp3",
      format: "mp3",
      bitrate: 320,
    })

    // Assert
    expect(args).toContain("-b:a")
    expect(args[args.indexOf("-b:a") + 1]).toBe("320k")
  })

  it("adds -b:a for lossy aac and ogg", () => {
    const aac = buildAudioArgs({
      inputName: "in.wav",
      outputName: "out.m4a",
      format: "aac",
      bitrate: 128,
    })
    const ogg = buildAudioArgs({
      inputName: "in.wav",
      outputName: "out.ogg",
      format: "ogg",
      bitrate: 192,
    })

    expect(aac).toContain("-b:a")
    expect(aac[aac.indexOf("-b:a") + 1]).toBe("128k")
    expect(ogg).toContain("-b:a")
    expect(ogg[ogg.indexOf("-b:a") + 1]).toBe("192k")
  })

  it("omits -b:a for lossless wav", () => {
    // Act
    const args = buildAudioArgs({
      inputName: "in.mp3",
      outputName: "out.wav",
      format: "wav",
      bitrate: 320,
    })

    // Assert
    expect(args).not.toContain("-b:a")
  })

  it("omits -b:a for lossless flac", () => {
    // Act
    const args = buildAudioArgs({
      inputName: "in.mp3",
      outputName: "out.flac",
      format: "flac",
      bitrate: 320,
    })

    // Assert
    expect(args).not.toContain("-b:a")
  })
})

describe("buildAudioArgs — validation", () => {
  it("throws for an unsupported format", () => {
    expect(() =>
      buildAudioArgs({
        inputName: "in.wav",
        outputName: "out.xyz",
        // @ts-expect-error intentionally invalid
        format: "xyz",
        bitrate: 192,
      }),
    ).toThrow(/Unsupported audio format/)
  })
})
