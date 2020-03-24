
import { join } from "path";
import * as crypto from 'crypto';
import * as fs from 'fs';
import { Base64Decode } from "base64-stream";

const algorithm = 'aes-128-ecb';
const password = 'YELLOW SUBMARINE';
// Use the async `crypto.scrypt()` instead.
// const key = crypto.scryptSync(password, '', 16);
// The IV is usually passed along with the ciphertext.
// const iv = Buffer.alloc(16, 0); // Initialization vector.

// Why iv='' and not null or whatever.. solved thanks to https://gist.github.com/AdamMagaluk/6629279
const decipher = crypto.createDecipheriv(algorithm, Buffer.from(password), '');

const filePathIn = join(__dirname, process.argv[2]);
const filePathOut = join(__dirname, process.argv[3]);
const input = fs.createReadStream(filePathIn);
const output = fs.createWriteStream(filePathOut);

input.pipe(new Base64Decode()).pipe(decipher).pipe(output)