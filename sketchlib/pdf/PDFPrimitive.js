import { PDFContext } from "./PDFContext.js";

export class PDFPrimitive {
  /**
   * Draw this primitive to a PDF file
   * @param {PDFContext} pdf The PDF rendering context
   */
  draw_pdf(pdf) {
    throw new Error("not implemented");
  }

  /**
   *
   * @param {any} obj Arbitrary object
   * @returns {obj is PDFPrimitive}
   */
  static is_pdf_compatible(obj) {
    return obj.draw_pdf !== undefined;
  }
}
