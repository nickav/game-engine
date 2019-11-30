const fs = require('fs');
const path = require('path');

const _ = require('hibar');
const glob = require('glob');
const xml2js = require('xml2js');

const parseXMLString = _.promisify(xml2js.parseString);

// Resolve paths
const cwd = process.cwd();
const src = path.resolve(cwd, process.argv[2]);
const dest = process.argv[3]
  ? path.resolve(cwd, process.argv[3])
  : `${src}.json`;

// Do the conversion
const file = fs.readFileSync(src);

parseXMLString(file.toString(), {
  mergeAttrs: true,
  explicitArray: false,
}).then((js) =>
  fs.writeFileSync(dest, JSON.stringify(js, null, 2))
);
