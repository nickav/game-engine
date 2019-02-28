const fs = require('fs');
const path = require('path');

const _ = require('hibar');
const glob = require('glob');
const xml2js = require('xml2js');

const parseXMLString = _.promisify(xml2js.parseString);

const file = fs.readFileSync('assets/fonts/tinyunicode.xml');

parseXMLString(file.toString(), {
  mergeAttrs: true,
  explicitArray: false,
}).then((js) =>
  fs.writeFileSync('public/tinyunicode.json', JSON.stringify(js, null, 2))
);
