import { parseSpriteFont } from '@/helpers/gl';

export default class SpriteFontRenderer {
  constructor(spriteBatch, atlas) {
    this.spriteBatch = spriteBatch;
    this.font = parseSpriteFont(atlas, { width: 64, height: 64 });
  }

  setViewMatrix(viewMatrix) {
    this.spriteBatch.setViewMatrix(viewMatrix);
  }

  setFont(spriteFont) {
    this.spriteFont = spriteFont;
  }

  add(text) {
    const { spriteBatch, font } = this;

    const str = text.text;
    const scalex = text.scalex || 1;
    const scaley = text.scaley || 1;
    let x = text.x;
    let y = text.y;

    for (let i = 0, n = str.length; i < n; i++) {
      const letter = str.charAt(i);

      if (letter === '\n') {
        x = text.x;
        y += font.lineHeight * scaley;
        continue;
      }

      const char = font.charMap[letter];

      if (!char) continue;

      spriteBatch.add({
        width: char.width,
        height: char.height,
        uvs: char.uvs,
        ...text,
        x: x + char.xoffset * scalex,
        y: y + char.yoffset * scaley,
      });

      x += char.xadvance * scalex;
    }
  }
}
