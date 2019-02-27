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
    const str = text.text.toString().replace(/(?:\r\n|\r)/g, '\n');
    const letterSpacing = text.letterSpacing || 0;
    const maxWidth = text.maxWidth || 0;
    const lineHeight = text.lineHeight || font.lineHeight || 0;

    const pos = { x: 0, y: 0 };
    const chars = [];
    let prevChar = null;
    let line = 0;
    const lineWidths = [];
    let lastLineWidth = 0;
    let maxLineWidth = 0;

    for (let i = 0, n = str.length; i < n; i++) {
      const char = str.charAt(i);
      const charCode = str.charCodeAt(i);

      // handle newlines and max width
      if (char === '\n' || (maxWidth > 0 && pos.x > maxWidth)) {
        // go to next line
        lineWidths.push(lastLineWidth);
        maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
        pos.x = 0;
        pos.y += lineHeight;
        prevChar = null;
        line++;

        // skip adding character
        if (char === '\n') {
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
        y: pos.y + charData.yoffset - lineHeight / 2,
        line,
      });

      pos.x += charData.xadvance + letterSpacing;
      lastLineWidth = pos.x;
      prevChar = char;
    }

    lineWidths.push(lastLineWidth);
    maxLineWidth = Math.max(maxLineWidth, lastLineWidth);

    if (text.width) {
      maxLineWidth = text.width;
    }

    const alignOffests = [];
    const align = text.align || 'left';

    for (let i = 0; i <= line; i++) {
      let alignOffset = 0;

      if (align === 'right') {
        alignOffset = maxLineWidth - lineWidths[i];
      } else if (align === 'center') {
        alignOffset = (maxLineWidth - lineWidths[i]) / 2;
      }

      alignOffests.push(alignOffset);
    }

    // render characters
    const scalex = text.scalex || 1;
    const scaley = text.scaley || 1;

    const anchorx = text.anchorx || 0;
    const anchory = text.anchory || 0;
    const textWidth = maxLineWidth * scalex;
    const textHeight = (pos.y + lineHeight) * scaley;
    const offsetx = textWidth * anchorx;
    const offsety = textHeight * anchory;

    for (let i = 0, n = chars.length; i < n; i++) {
      const char = chars[i];
      spriteBatch.add({
        ...char,
        x: text.x + (char.x + alignOffests[chars[i].line]) * scalex + offsetx,
        y: text.y + char.y * scaley + offsety,
        scalex,
        scaley,
      });
    }
  }
}
