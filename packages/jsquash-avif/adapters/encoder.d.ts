/** Narrow adapter for the pinned single-thread jSquash factory; upstream Emscripten globals are incomplete. */
declare module "@jsquash/avif/codec/enc/avif_enc.js" {
  interface Encoder {
    encode(
      data: Uint8Array,
      width: number,
      height: number,
      options: {
        quality: number;
        qualityAlpha: number;
        denoiseLevel: number;
        tileRowsLog2: number;
        tileColsLog2: number;
        speed: number;
        subsample: number;
        chromaDeltaQ: boolean;
        sharpness: number;
        enableSharpYUV: boolean;
        tune: number;
        bitDepth: number;
      },
    ): Uint8Array | null;
  }
  export default function create(options: {
    wasmBinary: Uint8Array;
    noInitialRun: boolean;
  }): Promise<Encoder>;
}
