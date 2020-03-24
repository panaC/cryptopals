
if (process.argv.length > 4) {

  const in1 = process.argv[2];
  const in2 = process.argv[3];
  const expected = process.argv[4];

  if (in1.length === in2.length) {

    const in1Buf = Buffer.from(in1, 'hex');
    const in2Buf = Buffer.from(in2, 'hex');

    const resArray = new Array<number>(in1Buf.length);
    for (let i = 0; i < in1Buf.length; i++) {
      resArray[i] = in1Buf[i] ^ in2Buf[i];
    }

    const resBuf = Buffer.from(resArray);

    if (expected) {
      console.log(resBuf.toString('hex') === expected);
    } else {
      console.log(resBuf.toString('hex'));
    }

  } else {
    console.error('not the same length');
    
  }


} else {
  console.error('error');
  
}

// ts-node  set1/c2.ts "1c0111001f010100061a024b53535009181c" "686974207468652062756c6c277320657965" "746865206b696420646f6e277420706c6179"