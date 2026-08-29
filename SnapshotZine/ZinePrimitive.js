import { WIDTH } from "../sketchlib/dimensions.js";
import { PDFContext } from "../sketchlib/pdf/PDFContext.js";
import { PDFPrimitive } from "../sketchlib/pdf/PDFPrimitive.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Primitive } from "../sketchlib/primitives/Primitive.js";
import { SimpleGroupPrimitive } from "../sketchlib/primitives/SimpleGroupPrimitive.js";

// coordinates come from screen pixels, but we want dots on paper instead.
// Snapshots are on 500x700 px canvas, this is a trading card at 200 PPI
// we want to convert to PDF which uses points (1/72 of an inch) so we need
// to shrink everything down
const PPI_SCREEN = 200; // pixels
const PPI_PDF = 72; // points
const SCALE_FACTOR = PPI_PDF / PPI_SCREEN;

const ZINE_PAGE_SIZE = new Direction(2.5 * PPI_PDF, 3.5 * PPI_PDF);

/**
 * @typedef {{
 *  front: PDFPrimitive,
 *  back: PDFPrimitive,
 *  page1: PDFPrimitive,
 *  page2: PDFPrimitive,
 *  page3: PDFPrimitive,
 *  page4: PDFPrimitive,
 *  page5: PDFPrimitive,
 *  page6: PDFPrimitive
 * }} ZinePages
 */

/**
 * @type {{
 *  page: keyof ZinePages,
 *  origin_x: number
 *  rotate: boolean
 * }[]}
 */
const LAYOUT = [
  {
    page: "front",
    // all of the origin points are on the center line of the
    // document. also, this is measured in pages
    origin_x: 3,
    // if true, rotate the coordinate system 180 degrees
    // this is due the way a zine is folded
    rotate: false,
  },
  {
    page: "page1",
    origin_x: 4,
    rotate: true,
  },
  {
    page: "page2",
    origin_x: 3,
    rotate: true,
  },
  {
    page: "page3",
    origin_x: 2,
    rotate: true,
  },
  {
    page: "page4",
    origin_x: 1,
    rotate: true,
  },
  {
    page: "page5",
    origin_x: 0,
    rotate: false,
  },
  {
    page: "page6",
    origin_x: 1,
    rotate: false,
  },
  {
    page: "back",
    origin_x: 2,
    rotate: false,
  },
];

/**
 * @implements {PDFPrimitive}
 */
export class ZinePrimitive {
  constructor() {
    /**
     * @type {ZinePages}
     */
    this.pages = {
      front: SimpleGroupPrimitive.EMPTY,
      back: SimpleGroupPrimitive.EMPTY,
      page1: SimpleGroupPrimitive.EMPTY,
      page2: SimpleGroupPrimitive.EMPTY,
      page3: SimpleGroupPrimitive.EMPTY,
      page4: SimpleGroupPrimitive.EMPTY,
      page5: SimpleGroupPrimitive.EMPTY,
      page6: SimpleGroupPrimitive.EMPTY,
    };
  }

  /**
   *
   * @param {keyof ZinePages} id
   * @param {PDFPrimitive} contents
   */
  set_page(id, contents) {
    this.pages[id] = contents;
  }

  /**
   * Draw the 8 pages
   * @param {PDFContext} pdf
   */
  draw_pdf(pdf) {
    // push state
    // translate to origin
    // rotate 180 if needed
    // scale by scale factor (can be combined with rotation)
    // <draw page>
    // pop state

    for (const page_layout of LAYOUT) {
      // PDF uses a y-up coordinate system but screens use y-down
      // so for right-side up pages we want to flip y.
      // however, if the page is rotated, we flip x instead.
      const x_dir = page_layout.rotate ? -1 : 1;
      const y_dir = page_layout.rotate ? 1 : -1;

      pdf.page.pushOperators(
        pdf.lib.pushGraphicsState(),

        pdf.lib.translate(
          page_layout.origin_x * ZINE_PAGE_SIZE.x,
          ZINE_PAGE_SIZE.y,
        ),
        pdf.lib.scale(x_dir * SCALE_FACTOR, y_dir * SCALE_FACTOR),

        // TEMP: Draw a rectangle from the top left corner of the page
        // covering most of the page. This is to make sure we positioned
        // the coordinate system correctly.
        pdf.lib.setStrokingRgbColor(0.0, 0.0, 0.0),
        pdf.lib.setFillingRgbColor(1.0, 0.0, 0.0),
        // Note: this is drawn in _pixel_ coordinates!
        pdf.lib.rectangle(0, 0, 400, 600),
        pdf.lib.fillAndStroke(),

        pdf.lib.popGraphicsState(),
      );
    }

    /*
    // front cover
    pdf.page.pushOperators(
      pdf.lib.pushGraphicsState(),
      // we want a y-down coordinate system in the bottom right-hand
      // coordinate
      pdf.lib.translate(3 * ZINE_PAGE_SIZE.x, ZINE_PAGE_SIZE.y),
      pdf.lib.scale(SCALE_FACTOR, -SCALE_FACTOR),
      //pdf.lib.scale(SCALE_FACTOR, -SCALE_FACTOR),

      pdf.lib.setStrokingRgbColor(0.0, 0.0, 0.0),
      pdf.lib.setFillingRgbColor(1.0, 0.0, 0.0),
      // rectangles in _pixels_
      pdf.lib.rectangle(0, 0, 400, 600),
      pdf.lib.fillAndStroke(),
    );
    //this.pages.front.draw_pdf(pdf);
    pdf.page.pushOperators(pdf.lib.popGraphicsState());
    */
  }
}
