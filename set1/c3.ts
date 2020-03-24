const freqs = {
  'a': 0.0651738,
  'b': 0.0124248,
  'c': 0.0217339,
  'd': 0.0349835,
  'e': 0.1041442,
  'f': 0.0197881,
  'g': 0.0158610,
  'h': 0.0492888,
  'i': 0.0558094,
  'j': 0.0009033,
  'k': 0.0050529,
  'l': 0.0331490,
  'm': 0.0202124,
  'n': 0.0564513,
  'o': 0.0596302,
  'p': 0.0137645,
  'q': 0.0008606,
  'r': 0.0497563,
  's': 0.0515760,
  't': 0.0729357,
  'u': 0.0225134,
  'v': 0.0082903,
  'w': 0.0171272,
  'x': 0.0013692,
  'y': 0.0145984,
  'z': 0.0007836,
  ' ': 0.1918182 
};

function englishScore(buf: Buffer): number {
  return buf.reduce((pv, cv) => {
    return pv + (freqs[
      String.fromCharCode(cv).toLowerCase()
    ] || 0);
  }
    , 0);
}

export function cryptKeyXor(buf: Buffer, key: Buffer): Buffer {
  const resArray = new Array<number>(buf.length);

  let keyIndex = 0;

  for (let i = 0; i < buf.length; i++) {

    if (keyIndex >= key.length) {
      keyIndex = 0;
    }

    resArray[i] = buf[i] ^ key[keyIndex];
    ++keyIndex;
  }

  return Buffer.from(resArray);
}

export interface IDecryptXor {
  str: string,
  key: number;
  score: number;
}

export function findKeyWithEnglishScore(buf: Buffer): IDecryptXor {

  const decryptMap = new Map<number, { str: string, key: number }>();
  const keyArray = Array.from({ length: 128 }, (v, i) => i);
  keyArray.forEach((key) => {

    const decrypt = cryptKeyXor(buf, Buffer.from([key]));
    decryptMap.set(englishScore(decrypt), { str: decrypt.toString(), key, });

    //console.log(`${decrypt.toString()}\t\t(${key})\t\t(${englishScore(decrypt)})`)
  });

  const index = Array.from(decryptMap.keys())
    .reduce((pv, cv) => cv > pv ? cv : pv, 0);
  const result = decryptMap.get(index);

  return {
    score: index,
    key: result.key,
    str: result.str,
  }

}

if (typeof require !== 'undefined' && require.main === module) {

  if (process.argv.length > 2) {
  
    const encoded = process.argv[2];
    const buf = Buffer.from(encoded, 'hex');
  
    const result = findKeyWithEnglishScore(buf);
    console.log(`result: KEY=${result.key} SCORE=${result.score} STR='${result.str}'`);
  
  } else {
    console.error('error');
  
  }
}

// ts-node set1/c3.ts "1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736"