import { parseSpriteFont } from '@/helpers/gl';

export default class SpriteFontRenderer {
  constructor(spriteBatch, spriteAtlas) {
    this.spriteBatch = spriteBatch;
    this.spriteAtlas = spriteAtlas;
  }

  setFont(name, fontAtlas) {
    const { w: width, h: height } = this.spriteAtlas.meta.size;
    const frame = this.spriteAtlas.frames[name].frame;
    const size = { width, height };
    const offset = { x: frame.x, y: frame.y };

    this.font = parseSpriteFont(fontAtlas, size, offset);
  }

  setViewMatrix(viewMatrix) {
    this.spriteBatch.setViewMatrix(viewMatrix);
  }

  add(text) {
    const { spriteBatch, font } = this;

    // create characters
    const str = text.text.toString().replace(/(?:\r\n|\r)/g, '\n');
    const letterSpacing =
      typeof text.letterSpacing === 'number' ? text.letterSpacing : 0;
    const maxWidth = typeof text.maxWidth === 'number' ? text.maxWidth : 0;
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
        y: pos.y + charData.yoffset - lineHeight / 2 - 1,
        line,
      });

      pos.x += charData.xadvance + letterSpacing;
      lastLineWidth = pos.x;
      prevChar = char;
    }

    lineWidths.push(lastLineWidth);
    maxLineWidth = Math.max(maxLineWidth, lastLineWidth);

    const scalex = typeof text.scalex === 'number' ? text.scalex : 1;
    const scaley = typeof text.scaley === 'number' ? text.scaley : 1;
    const width = typeof text.width === 'number' ? text.width : maxWidth;

    if (width) {
      maxLineWidth = width / scalex;
    }

    // compute horizontal offsets
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
    const anchorx = typeof text.anchorx === 'number' ? text.anchorx : 0;
    const anchory = typeof text.anchory === 'number' ? text.anchory : 0;
    const textWidth = maxLineWidth * scalex;
    const textHeight = (pos.y + lineHeight) * scaley;

    // vertical align
    const height = typeof text.height === 'number' ? text.height : 0;
    const valign = text.valign || 'top';
    let heightOffset = 0;

    if (valign === 'center') {
      heightOffset = (height - textHeight) / 2;
    } else if (valign === 'bottom') {
      heightOffset = height - textHeight;
    }

    const offsetx = textWidth * anchorx;
    const offsety = textHeight * anchory;

    for (let i = 0, n = chars.length; i < n; i++) {
      const char = chars[i];
      spriteBatch.add({
        ...char,
        x: text.x + (char.x + alignOffests[chars[i].line]) * scalex + offsetx,
        y: text.y + char.y * scaley + offsety + heightOffset,
        scalex,
        scaley,
      });
    }
  }
}
