#!/usr/bin/env node

var fs = require("fs");
var path = require("path");
var minimist = require("minimist");
var childProcess = require("child_process");
var phantomjs = require("phantomjs");
var binPath = phantomjs.path;

// Parse command args
var args = minimist(process.argv.slice(2), {
  default: {
    crop: false,
    dataUri: false,
    debug: false,
    scale: 1,
  },
});

if (args.debug) console.log(args);

// Ensure a path for the src file was passed
if (!args._ || (args._ && !args._.length)) {
  console.error("Path to a .piskel file is required");
  process.exit(1);
}

var src = args._[0];

// Ensure the src file exists
if (!fs.existsSync(src)) {
  console.error("No such file: " + src);
  process.exit(1);
}

// Read src piskel file
var piskelFile = fs.readFileSync(src, "utf-8");

var dest = args.dest || path.basename(src, ".piskel");

console.log("Piskel CLI is exporting...");

// Get path to Piskel's app js bundle
var piskelAppJsDir = path.resolve(__dirname + "/../dest/prod/js/");
var minJsFiles = fs
  .readdirSync(piskelAppJsDir)
  .filter(function (filename) { return filename.indexOf("min") > -1; });
var piskelAppJsFileName = minJsFiles[0];
var piskelAppJsPath = piskelAppJsFileName
  ? path.join(piskelAppJsDir, piskelAppJsFileName)
  : "";

if (!fs.existsSync(piskelAppJsPath)) {
  console.error(
    "Piskel's application JS file not found in: " + piskelAppJsDir + ". Run prod build and try again."
  );

  process.exit(1);
}

// Prepare args to pass to phantom script
var options = {
  dest: dest,
  zoom: args.scale,
  crop: !!args.crop,
  rows: args.rows,
  columns: args.columns,
  frame: args.frame,
  dataUri: !!args.dataUri,
  debug: args.debug,
  piskelAppJsPath: piskelAppJsPath,
  scaledWidth: args.scaledWidth,
  scaledHeight: args.scaledHeight,
};

var childArgs = [
  path.join(__dirname, "piskel-export.js"),
  piskelFile,
  JSON.stringify(options),
];

if (args.debug) {
  childArgs.unshift(
    "--remote-debugger-port=9035",
    "--remote-debugger-autorun=yes"
  );
}

// Run phantom script
childProcess.execFile(binPath, childArgs, function (err, stdout, stderr) {
  // Print any output the from child process
  if (err) console.log(err);
  if (stderr) console.log(stderr);
  if (stdout) console.log(stdout);

  console.log("Export complete");
});
