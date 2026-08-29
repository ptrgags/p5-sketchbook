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
   * @param {string} id
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
  }
}
