import { parseSpriteFont } from '@/helpers/gl';

export default class SpriteFontRenderer {
  constructor(spriteBatch, atlas) {
    this.spriteBatch = spriteBatch;
    this.font = parseSpriteFont(atlas, { width: 64, height: 64 });
  }

  setViewMatrix(viewMatrix) {
    this.spriteBatch.setViewMatrix(viewMatrix);
  }

  add(text) {
    const { spriteBatch, font } = this;

    // create characters
    const str = text.text.toString();
    const letterSpacing = text.letterSpacing || 0;
    const maxWidth = text.maxWidth || 0;

    const pos = { x: 0, y: 0 };
    const chars = [];
    let prevChar = null;

    for (let i = 0, n = str.length; i < n; i++) {
      const char = str.charAt(i);
      const charCode = str.charCodeAt(i);

      // handle newlines and max width
      const isNewline = char === '\n' || char === '\r';

      if (isNewline || (maxWidth > 0 && pos.x > maxWidth)) {
        // go to next line
        pos.x = 0;
        pos.y += font.lineHeight;
        prevChar = null

        // skip rendering character
        if (isNewline) {
          continue;
        }
      }

      const charData = font.chars[char];

      if (!charData) {
        continue;
      }

      // add kerning
      if (prevChar && charData.kerning[prevChar]) {
        pos.x += charData.kerning[prevChar];
      }

      chars.push({
        width: charData.width,
        height: charData.height,
        uvs: charData.uvs,
        x: pos.x + charData.xoffset + letterSpacing / 2,
        y: pos.y + charData.yoffset,
      });

      pos.x += charData.xadvance + letterSpacing;
      prevChar = char;
    }

    // render characters
    const scalex = text.scalex || 1;
    const scaley = text.scaley || 1;

    for (let i = 0, n = chars.length; i < n; i++) {
      const char = chars[i];
      spriteBatch.add({
        ...char,
        x: text.x + char.x * scalex,
        y: text.y + char.y * scaley,
        scalex,
        scaley,
      });
    }
  }
}
