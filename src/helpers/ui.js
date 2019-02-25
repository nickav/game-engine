import { rectAbs, rectIntersect } from '@/helpers/functions';

export const onClick = (pointer, bounds) => {
  if (pointer.press()) {
    return rectIntersect(rectAbs(bounds), pointer.getBounds());
  }
}
