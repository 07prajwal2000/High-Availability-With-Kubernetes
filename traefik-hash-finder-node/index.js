// IP's to hex string hash
// http://10.244.0.20:8080 - 6d424008d4f36862
// http://10.244.0.19:8080 - c0088024a22666f2
// http://10.244.0.18:8080 - 295cdd83e1c781cf

// Traefik: hashing impl source file
// https://github.com/traefik/traefik/blob/c1ef7429771104e79f2e87b236b21495cb5765f0/pkg/server/service/service.go#L290
// nodejs hashing algorithm repo: https://github.com/tjwebb/fnv-plus
// const hash = require("./fnv-hash");

// console.log("http://10.244.0.20:8080\t", hash.hash("http://10.244.0.20:8080", 64).hex());
// console.log("http://10.244.0.18:8080\t", hash.hash("http://10.244.0.18:8080", 64).hex());
// console.log("http://10.244.0.19:8080\t", hash.hash("http://10.244.0.19:8080", 64).hex());
// above works perfectly. but hashing impl is too-old, 5yrs 

import fnv1a from "@sindresorhus/fnv1a";
console.log(fnv1a(new TextEncoder().encode('http://10.244.0.19:8080'), {size: 64}).toString(16));