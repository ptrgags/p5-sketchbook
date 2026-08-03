import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { download_file } from "../sketchlib/dom/download_file.js";
import { griderator } from "../sketchlib/Grid.js";
import { KeywordRecognizer } from "../sketchlib/KeywordRecognizer.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { Rect } from "../sketchlib/primitives/Rect.js";
import { Rigid } from "../sketchlib/primitives/Rigid.js";
import { group, style, xform } from "../sketchlib/primitives/shorthand.js";
import { TextPrimitive } from "../sketchlib/primitives/TextPrimitive.js";
import { TextStyle } from "../sketchlib/primitives/TextStyle.js";
import { Style } from "../sketchlib/Style.js";

const PDF = /** @type {import("pdf-lib")} */ (PDFLib);

const SLASH = new KeywordRecognizer();

const INCH = 72;
const PAGE_SIZE = new Direction(11, 8.5).scale(INCH);

const PANEL_SIZE = new Direction(2.5, 3.5).scale(INCH);
const ZINE_SIZE = PANEL_SIZE.mul_components(new Direction(4, 2));
const MARGIN_SIZE = PAGE_SIZE.sub(ZINE_SIZE).scale(0.5);

const TITLE_BG_SIZE = new Direction(2.5, 0.75).scale(INCH);
const TITLE_BG = new Rect(Point.ORIGIN, TITLE_BG_SIZE);

const TEXT_STYLE_TITLE = new TextStyle(14, "center", "center");
const STYLE_TEXT = Style.flat(Color.BLACK);
const DUMMY_TEXT = new TextPrimitive(
  "TITLE",
  new Point((2.5 * INCH) / 2, (0.75 * INCH) / 2),
);
const TITLE = new GroupPrimitive(DUMMY_TEXT, {
  style: STYLE_TEXT,
  text_style: TEXT_STYLE_TITLE,
});

const PANEL_XFORMS = [
  // front panel is the bottom right corner
  Rigid.translation(new Direction(3 * PANEL_SIZE.x, 0)),
  // next four panels are upside-down in the top row,
  // continuing CCW around the page
  new Rigid({
    rotation: Math.PI,
    translation: PANEL_SIZE.mul_components(new Direction(4, 2)),
  }),
  new Rigid({
    rotation: Math.PI,
    translation: PANEL_SIZE.mul_components(new Direction(3, 2)),
  }),
  new Rigid({
    rotation: Math.PI,
    translation: PANEL_SIZE.mul_components(new Direction(2, 2)),
  }),
  new Rigid({
    rotation: Math.PI,
    translation: PANEL_SIZE.mul_components(new Direction(1, 2)),
  }),
  // last 3 pages are right-side up in the bottom row
  Rigid.IDENTITY,
  Rigid.translation(new Direction(PANEL_SIZE.x, 0)),
  Rigid.translation(new Direction(2 * PANEL_SIZE.x, 0)),
];

const STYLE_PANEL = new Style({
  stroke: Color.BLUE,
  width: 5,
  fill: new Color(0xfe, 0xae, 0x8b),
});
const PANEL_RECT = new Rect(Point.ORIGIN, PANEL_SIZE);
const PANEL_BG = style([PANEL_RECT, TITLE_BG], STYLE_PANEL);

const PAGES = [
  group(),
  group(),
  group(),
  group(),
  group(),
  group(),
  group(),
  group(),
];

const SCENE = xform(
  PAGES.map((x, i) => {
    return xform(group(PANEL_BG, x), PANEL_XFORMS[i]);
  }),
  Rigid.translation(MARGIN_SIZE),
);

// /trace logs a trace of the scene for investigating performance issues.
SLASH.register(["Slash", "KeyZ", "KeyI", "KeyN", "KeyE"], async () => {
  // @ts-ignore
  console.log(PDFLib);
  const document = await PDF.PDFDocument.create();
  const page = document.addPage([PAGE_SIZE.x, PAGE_SIZE.y]);

  SCENE.draw_pdf(PDF, page);

  const pdf_bytes = await document.save();
  // Typescript complains that pdf_bytes isn't allowed as a BlobPart
  // (perhaps pdf-lib is using a SharedBuffer?)
  // See https://github.com/microsoft/TypeScript/issues/62546#issuecomment-3374526284
  const owned = new Uint8Array([...pdf_bytes]);

  const file = new File([owned], "zine.pdf", {
    type: "application/pdf",
  });
  download_file(file);
});

/**
 *
 * @param {import("p5").default} p
 */
export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(PAGE_SIZE.x, PAGE_SIZE.y);
    p.pixelDensity(1);

    p.background(255);
    SCENE.draw(p);
    p.noLoop();
  };

  p.keyReleased = (/** @type {KeyboardEvent} */ e) => {
    SLASH.input(e.code);
  };
};
