import { readFileSync } from "fs";
import { join } from "path";
import { findKeyWithEnglishScore, cryptKeyXor } from "./c3";
import * as assert from "assert";

export function hamming(s1: Buffer, s2: Buffer): number {
  const length = s1.length > s2.length ? s1.length : s2.length;

  let distance = 0;
  for (let i = 0; i < length; i++) {
    const diff = s1[i] ^ s2[i];
    const bit = Array.from({ length: 8 }, (_v, k) => 2 ** k);
    bit.forEach((bit) => distance += (diff & bit) / bit);
  }

  return distance;
}

// 3/ KEYSIZE
function getKeysize(cypherText: Buffer): number {

  const normalizedArray = Array.from({ length: 39 }, (_v, k) => k + 2)
    .map((KEYSIZE) => {

      // 3/

      const chunckLength = Math.floor(cypherText.length / KEYSIZE);
      const chunks = Array.from({ length: chunckLength }, (v, k) => k)
        .map(
          (i) =>
            [
              cypherText.subarray(i, i + KEYSIZE),
              cypherText.subarray(i + KEYSIZE, i + 2 * KEYSIZE)
            ]
        );

      // average
      const normalize = chunks.reduce(
        (pv, chunk) =>
          pv += hamming(chunk[0], chunk[1]) / KEYSIZE, 0
      ) / chunckLength;

      return [
        normalize,
        KEYSIZE
      ];

    });

  const [, keysize] = normalizedArray.reduce(
    ([pNormalize, pKEYSIZE], [normalize, KEYSIZE]) =>
      normalize < pNormalize
        ? [normalize, KEYSIZE]
        : [pNormalize, pKEYSIZE]
    , [Number.MAX_SAFE_INTEGER, -1]
  );

  return keysize;

}

// 5/
function breakCypherTextWithKeysizeBlock(cypherText: Buffer, keysize: number): Buffer[] {

  let startSubBuffer = 0;

  const block = new Array<Buffer>();
  while (startSubBuffer + keysize <= cypherText.length) {

    block.push(cypherText.subarray(startSubBuffer, startSubBuffer + keysize));
    startSubBuffer += keysize;
  }

  return block;
}

// 6/
function transposeBlock(blocks: Buffer[]): Buffer[] {

  if (blocks.length) {

    const length = blocks[0].length;

    if (blocks.filter((block) => block.length !== length).length) {
      return [];
      // error
    }

    const trBlocks = new Array<Buffer>();
    let bitPos = 0;

    while (bitPos < length) {

      trBlocks.push(
        Buffer.concat(
          blocks.map(
            (block) =>
              block.subarray(bitPos, bitPos + 1)
          )
        )
      );
      ++bitPos;
    }

    return trBlocks;
  }

  return [];
}

if (typeof require !== 'undefined' && require.main === module) {

  const filePath = join(__dirname, process.argv[2]);

  const buf = readFileSync(filePath);
  const str = buf.toString().split('\n').join()
  const cypherText = Buffer.from(str, 'base64');

  assert(hamming(Buffer.from("this is a test"), Buffer.from("wokka wokka!!!")) === 37);

  const keysize = getKeysize(cypherText);
  console.log(`KEYSIZE=${keysize}`);

  const blocks = breakCypherTextWithKeysizeBlock(cypherText, keysize);
  const trBlocks = transposeBlock(blocks);
  // console.log(trBlocks.length, trBlocks[0].length, cypherText.length);

  const key = trBlocks
    .map(
      (trBlock, i) => {

        const result = findKeyWithEnglishScore(trBlock);
        console.log(`${i}: KEY=${String.fromCharCode(result.key)} SCORE=${result.score}`);

        return String.fromCharCode(result.key);
      }
    )
    .join('');

  const decrypt = cryptKeyXor(cypherText, Buffer.from(key));

  console.log("FINISH");

  console.log(`KEY=${key}`);
  console.log(`MESSAGE=
  ${decrypt.toString()}`);

}