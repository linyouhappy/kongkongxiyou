var rsa = require("./lib/rsa");
var key = new rsa.Key();

var message = "All your bases are belong to us.";
console.log("Message:\n"+message+"\n");

// Generate a key
key.generate(1024, "10001");
console.log("Key:\n");
console.log("n:" + key.n.toString(16));
console.log("e:" + key.e.toString(16));
console.log("d:" + key.d.toString(16));
console.log("\n");

// Encrypt
var encrypted = key.encrypt(message);
console.log("Encrypted:\n" + rsa.linebrk(encrypted, 64) + "\n" );

// Decrypt
var decrypted = key.decrypt(encrypted);
console.log("Decrypted:" + rsa.linebrk(decrypted, 64) + "\n");

var sig = key.signString(message, "sha256");
console.log("String signature: \n" + rsa.linebrk(sig, 64));

var pubkey = new rsa.Key();
pubkey.n = key.n;
pubkey.e = key.e;

var verified = pubkey.verifyString(message, sig);

console.log("Verfied: " + verified);