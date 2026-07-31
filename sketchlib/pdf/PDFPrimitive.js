/**
 * @interface PDFPrimitive
 */
export class PDFPrimitive {
  /**
   * Draw this primitive to the current PDF page
   * @param {import("pdf-lib")} pdf
   * @param {import("pdf-lib").PDFPage} page
   */
  draw_pdf(pdf, page) {}

  /**
   * Check if an object can be converted to SVG
   * @param {any} x
   * @returns {x is PDFPrimitive}
   */
  static is_pdf_compatible(x) {
    return x.draw_pdf !== undefined;
  }
}
