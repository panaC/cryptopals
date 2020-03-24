import { readFileSync } from "fs";
import { join } from "path";
import { findKeyWithEnglishScore, IDecryptXor } from "./c3";


if (process.argv[2]) {
  const filePath = join(__dirname, process.argv[2]);

  const buf = readFileSync(filePath);
  const array = buf.toString().split('\n');
  const bufArray = new Array<Buffer>();
  array.forEach((str) => bufArray.push(Buffer.from(str, 'hex')));

  const resArray = new Array<IDecryptXor>();
  bufArray.forEach((buf) => resArray.push(findKeyWithEnglishScore(buf)));
  const result = resArray
    .reduce<IDecryptXor>((pv, cv) => pv.score > cv.score ? pv : cv
    , {
      score: 0,
      key: 0,
      str: '',
    });

  console.log(`result: KEY=${result.key} SCORE=${result.score} STR='${result.str}'`);
}

// ts-node set1/c4.ts "./4.txt"