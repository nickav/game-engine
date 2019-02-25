import * as twgl from 'twgl.js';

import { stripExt } from '@/helpers/functions';

export const createDefaultTextures = (gl) =>
  twgl.createTextures(gl, {
    checker: {
      mag: gl.NEAREST,
      min: gl.LINEAR,
      // prettier-ignore
      src: [
        255, 255, 255, 255,
        192, 192, 192, 255,
        192, 192, 192, 255,
        255, 255, 255, 255,
      ]
    },
    pixel: {
      mag: gl.NEAREST,
      min: gl.LINEAR,
      src: [255, 255, 255, 255],
    },
  });

export const parseTextureAtlas = (atlas) => {
  const { w: width, h: height } = atlas.meta.size;

  return Object.entries(atlas.frames).reduce((sprites, [k, v]) => {
    const { x, y, w, h } = v.frame;

    sprites[stripExt(k)] = {
      width: w,
      height: h,
      uvs: [x / width, y / height, (x + w) / width, (y + h) / height],
    };

    return sprites;
  }, {});
};

export const applyVertexColors = (
  array,
  numVertices,
  color,
  alpha,
  ...indicies
) => {
  const a = typeof alpha === 'number' ? alpha : 1;

  if (!color) {
    // use default colors for each vertex
    for (let i = 0; i < numVertices; i++) {
      array.push(1, 1, 1, a);
    }

    return;
  }

  for (let i = 0; i < numVertices; i++) {
    let vc = color;

    // extract particluar vertex color from color array
    if (Array.isArray(vc[0])) {
      // possibly use a custom color winding order
      const index = indicies.length ? indicies[i] : i;
      vc = vc[index % color.length];
    }

    // add color to vertex array
    array.push(vc[0], vc[1], vc[2], vc[3] * a);
  }
};
