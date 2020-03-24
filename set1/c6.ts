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

// ts-node set1/c6.ts ./6.txt

/* 
KEYSIZE=29
0: KEY=T SCORE=6.682071100000004
1: KEY=e SCORE=7.410828700000002
2: KEY=r SCORE=6.243285400000002
3: KEY=m SCORE=8.923142900000009
4: KEY=i SCORE=7.075824000000005
5: KEY=n SCORE=7.189039600000002
6: KEY=a SCORE=8.055122700000004
7: KEY=t SCORE=6.906525600000005
8: KEY=o SCORE=7.745722000000003
9: KEY=r SCORE=7.253734300000003
10: KEY=  SCORE=7.297289100000004
11: KEY=X SCORE=6.548810700000005
12: KEY=: SCORE=8.363630400000003
13: KEY=  SCORE=7.0261403000000024
14: KEY=B SCORE=6.718334000000004
15: KEY=r SCORE=7.9996760000000044
16: KEY=i SCORE=7.615848000000005
17: KEY=n SCORE=6.741744500000005
18: KEY=g SCORE=7.975147300000005
19: KEY=  SCORE=5.910769900000003
20: KEY=t SCORE=7.382397800000004
21: KEY=h SCORE=7.335069100000004
22: KEY=e SCORE=7.435678500000005
23: KEY=  SCORE=8.150579700000009
24: KEY=n SCORE=6.492815700000004
25: KEY=o SCORE=7.201123100000003
26: KEY=i SCORE=6.405898200000004
27: KEY=s SCORE=8.538463000000009
28: KEY=e SCORE=6.535511300000004
FINISH
KEY=Terminator X: Bring the noise
MESSAGE=
  I'm back and I'm ringin' the bell 
A rockin' on the mike while the fly girls yell 
In ecstasy in the back of me 
Well that's my DJ Deshay cuttin' all them Z's 
Hittin' hard and the girlies goin' crazy 
Vanilla's on the mike, man I'm not lazy. 

I'm lettin' my drug kick in 
It controls my mouth and I begin 
To just let it flow, let my concepts go 
My posse's to the side yellin', Go Vanilla Go! 

Smooth 'cause that's the way I will be 
And if you don't give a damn, then 
Why you starin' at me 
So get off 'cause I control the stage 
There's no dissin' allowed 
I'm in my own phase 
The girlies sa y they love me and that is ok 
And I can dance better than any kid n' play 

Stage 2 -- Yea the one ya' wanna listen to 
It's off my head so let the beat play through 
So I can funk it up and make it sound good 
1-2-3 Yo -- Knock on some wood 
For good luck, I like my rhymes atrocious 
Supercalafragilisticexpialidocious 
I'm an effect and that you can bet 
I can take a fly girl and make her wet. 

I'm like Samson -- Samson to Delilah 
There's no denyin', You can try to hang 
But you'll keep tryin' to get my style 
Over and over, practice makes perfect 
But not if you're a loafer. 

You'll get nowhere, no place, no time, no girls 
Soon -- Oh my God, homebody, you probably eat 
Spaghetti with a spoon! Come on and say it! 

VIP. Vanilla Ice yep, yep, I'm comin' hard like a rhino 
Intoxicating so you stagger like a wino 
So punks stop trying and girl stop cryin' 
Vanilla Ice is sellin' and you people are buyin' 
'Cause why the freaks are jockin' like Crazy Glue 
Movin' and groovin' trying to sing along 
All through the ghetto groovin' this here song 
Now you're amazed by the VIP posse. 

Steppin' so hard like a German Nazi 
Startled by the bases hittin' ground 
There's no trippin' on mine, I'm just gettin' down 
Sparkamatic, I'm hangin' tight like a fanatic 
You trapped me once and I thought that 
You might have it 
So step down and lend me your ear 
'89 in my time! You, '90 is my year. 

You're weakenin' fast, YO! and I can tell it 
Your body's gettin' hot, so, so I can smell it 
So don't be mad and don't be sad 
'Cause the lyrics belong to ICE, You can call me Dad 
You're pitchin' a fit, so step back and endure 
Let the witch doctor, Ice, do the dance to cure 
So come up close and don't be square 
You wanna battle me -- Anytime, anywhere 

You thought that I was weak, Boy, you're dead wrong 
So come on, everybody and sing this song 

Say -- Play that funky music Say, go white boy, go white boy go 
play that funky music Go white boy, go white boy, go 
Lay down and boogie and play that funky music till you die. 

Play that funky music Come on, Come on, let me hear 
Play that funky music white boy you say it, say it 
Play that funky music A little louder now 
Play that funky music, white boy Come on, Come on, Come on 
Play that funky music 

*/