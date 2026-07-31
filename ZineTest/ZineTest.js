import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { download_file } from "../sketchlib/dom/download_file.js";
import { KeywordRecognizer } from "../sketchlib/KeywordRecognizer.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";

const PDF = /** @type {import("pdf-lib")} */ (PDFLib);

const SLASH = new KeywordRecognizer();

const INCH = 72;
const MARGIN_SIZE = new Direction(0.5, 0.75).scale(INCH);
const PANEL_SIZE = new Direction(2.5, 3.5).scale(INCH);
const ZINE_SIZE = PANEL_SIZE.mul_components(new Direction(4, 2));
const PAGE_SIZE = new Direction(11, 8.5).scale(INCH);

// /trace logs a trace of the scene for investigating performance issues.
SLASH.register(["Slash", "KeyZ", "KeyI", "KeyN", "KeyE"], async () => {
  // @ts-ignore
  console.log(PDFLib);
  const document = await PDF.PDFDocument.create();
  const page = document.addPage([PAGE_SIZE.x, PAGE_SIZE.y]);
  page.drawText("WELCOME TO THE PRINTER", {
    x: 0.5 * INCH,
    y: 0.2 * INCH,
    size: 24,
  });

  page.pushOperators(
    PDF.pushGraphicsState(),

    // styling
    PDF.setStrokingColor(PDF.rgb(0, 0, 0)),
    PDF.setLineWidth(5),
    PDF.setFillingColor(PDF.rgb(1, 0, 0)),
    PDF.translate(MARGIN_SIZE.x, MARGIN_SIZE.y),
    PDF.rectangle(0, 0, PANEL_SIZE.x, PANEL_SIZE.y),
    PDF.fillAndStroke(),

    // transform node
    PDF.pushGraphicsState(),
    PDF.translate(PANEL_SIZE.x, PANEL_SIZE.y),

    PDF.rectangle(0, 0, PANEL_SIZE.x, PANEL_SIZE.y),
    PDF.fillAndStroke(),

    PDF.popGraphicsState(),

    PDF.popGraphicsState(),
  );

  /*
  page.drawCircle({
    x: 2 * INCH,
    y: 2 * INCH,
    size: 2 * INCH,
  });
  8?

  page.pushOperators();

  /*
  page.drawRectangle({
    x: MARGIN_SIZE.x,
    y: MARGIN_SIZE.y,
    width: PANEL_SIZE.x,
    height: PANEL_SIZE.y,

    /*    color: PDF.rgb(1, 1, 1),
    borderWidth: 1,
    borderColor: PDF.rgb(0, 0, 0),

  });
  */

  //page.pushOperators(PDF.popGraphicsState());
  /*
  page.drawRectangle({
    x: MARGIN_SIZE.x + PANEL_SIZE.x,
    y: MARGIN_SIZE.y,
    width: PANEL_SIZE.x,
    height: PANEL_SIZE.y,
  });
  */

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
    p.createCanvas(WIDTH, HEIGHT);
    p.pixelDensity(1);
  };

  p.draw = () => {
    p.background(0);
  };

  p.keyReleased = (/** @type {KeyboardEvent} */ e) => {
    SLASH.input(e.code);
  };
};
