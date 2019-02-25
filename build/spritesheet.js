const _ = require('hibar');
const fs = require('fs');
const path = require('path');
const Spritesmith = require('spritesmith');
const glob = require('glob');

const options = {
  name: 'sprites',
  ext: 'png',
  verbose: true,
  spaces: 2,
  padding: 2
};

function generateSpritesheet(spritePath, outputPath, opts = options) {
  spritePath = stripTrailingSlash(spritePath);
  outputPath = path.resolve(outputPath);

  const files = glob.sync(`${spritePath}/**`, { nodir: true });
  const sprites = files.filter(file => file.endsWith(`.${opts.ext}`));

  opts.verbose && console.log(sprites);

  Spritesmith.run({ src: sprites, padding: opts.padding }, (err, res) => {
    if (err) throw err;

    const spriteName = `${opts.name}.png`;
    const spriteMap = _.mapKeys(res.coordinates, k =>
      k.substring(spritePath.length + 1, k.length)
    );

    const json = toTexturePackFormat(spriteName, spriteMap, res.properties);

    fs.writeFileSync(`${outputPath}/${spriteName}`, res.image);

    fs.writeFileSync(
      `${outputPath}/${opts.name}.json`,
      JSON.stringify(json, null, opts.spaces)
    );

    opts.verbose && console.log(res.properties);
  });
}

function toTexturePackFormat(name, sprites, meta) {
  return {
    meta: {
      image: name,
      size: { w: meta.width, h: meta.height },
      scale: 1
    },
    frames: _.mapValues(sprites, v => {
      const frameSize = { w: v.width, h: v.height };
      const frame = { x: v.x, y: v.y, ...frameSize };
      return {
        frame,
        rotated: false,
        trimmed: false,
        spriteSourceSize: frame,
        sourceSize: frameSize
      };
    })
  };
}

function stripTrailingSlash(str) {
  return str.endsWith('/') ? str.substring(0, str.length - 1) : str;
}

exports.default = generateSpritesheet;
