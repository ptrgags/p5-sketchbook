export class PDFContext {
  /**
   * Constructor
   * @param {import('pdf-lib')} lib The PDF library for access to top-level functions
   * @param {import('pdf-lib').PDFPage} page The current page to draw
   */
  constructor(lib, page) {
    this.lib = lib;
    this.page = page;
  }
}
