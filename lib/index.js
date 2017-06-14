const http = require("http");
const fs = require("fs");
const path = require("path");

const argv = process.argv;
const portIndex = argv.findIndex(arg => arg === "-p");
let port;
if (portIndex === -1 || argv.length === portIndex - 1) port = 7000;
else {
  try {
    port = parseInt(argv[portIndex + 1]);
  } catch (e) {
    console.log("Cannot find port after -p, maybe a malformed port number");
    process.exit(1);
  }
}

const logsFolderPath = path.join(process.cwd(), "http-logs");

fs.mkdir(logsFolderPath, (err) => {
  if (err && err.code !== "EEXIST") {
    console.log("Error while creating logs folder", err);
    process.exit(2);
  } else if (err.code !== "EEXIST") {
    console.log("Logs folder created");
  }
})

const server = http.createServer((req, res) => {
  const ip = req.socket.remoteAddress;
  const date = new Date();
  console.log(`Connection etablished with client ip ${ip} at ${date.toString()}`);
  const logFileName = `data-${ip.replace(/\:\:/g, "-").replace(/\./g, "-")}-${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][date.getDay()]}-${date.getTime() / 1000}.log`;
  const logFileWriteStream = fs.createWriteStream(path.join(logsFolderPath, logFileName), { mode: 0o644 });
  req.on("data", chunk => {
    logFileWriteStream.write(chunk);
  });
  req.on("end", () => {
    logFileWriteStream.end();
    res.writeHead(200);
    res.end();
  });
});

server.listen(port);
