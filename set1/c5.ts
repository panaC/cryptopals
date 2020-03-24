import { cryptKeyXor } from "./c3";

let str = `Burning 'em, if you ain't quick and nimble
I go crazy when I hear a cymbal`;

let expected = "0b3637272a2b2e63622c2e69692a23693a2a3c6324202d623d63343c2a26226324272765272a282b2f20430a652e2c652a3124333a653e2b2027630c692b20283165286326302e27282f";
let key = "ICE";

// Becareful with the escaping character in shell
// '\n' isn't converted to '\n' 0x0A char
console.log(Buffer.from(str).toString('hex'));
console.log(Buffer.from(process.argv[2]).toString('hex'));
console.log(Buffer.from(str));
console.log(Buffer.from(process.argv[2]));


if (process.argv.length > 3) {

  // with the shell "\n" is printed has 2 characters and not converted to '\n' character
  str = process.argv[2].replace(/\\n/g, '\n');
  key = process.argv[3];
  expected = process.argv[4];

}

const strBuf = Buffer.from(str);
const keyBuf = Buffer.from(key);
const res = cryptKeyXor(strBuf, keyBuf).toString('hex');

if (expected) {
  console.log(res === expected);
  console.log(res);
  console.log(expected);

} else {
  console.log(res);

}