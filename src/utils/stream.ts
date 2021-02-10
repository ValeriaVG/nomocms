import { Readable } from "stream";

const CHUNK_SIZE = 256;

/**
 * Splits text or buffer to small chunks and returns Readable stream
 * @param contents
 */
export const toStream = (contents: string | Buffer): Readable => {
  const arr = [];
  for (let i = 0; i < Math.ceil(contents.length / CHUNK_SIZE); i++) {
    const start = i * CHUNK_SIZE;
    arr.push(contents.slice(start, start + CHUNK_SIZE));
  }
  return Readable.from(arr);
};
