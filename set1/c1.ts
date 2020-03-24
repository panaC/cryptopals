
if (process.argv.length > 2) {

  const res = Buffer.from(process.argv[2], 'hex').toString('base64');

  if (process.argv.length === 4) {
    console.log(res === process.argv[3]);
  } else {
    console.log(res);
  }

} else {
  console.error("error")
}

// ts-node set1/c1.ts "49276d206b696c6c696e6720796f757220627261696e206c696b65206120706f69736f6e6f7573206d757368726f6f6d" "SSdtIGtpbGxpbmcgeW91ciBicmFpbiBsaWtlIGEgcG9pc29ub3VzIG11c2hyb29t"