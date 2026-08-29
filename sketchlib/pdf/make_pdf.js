import { Direction } from "../pga2d/Direction.js";
import { PDFContext } from "./PDFContext.js";
import { PDFPrimitive } from "./PDFPrimitive.js";

const PDF = /** @type {import("pdf-lib")} */ (PDFLib);

// one inch is 72 points in PDF
const INCH = 72;
const PAGE_SIZE = new Direction(10, 7).scale(INCH);

/**
 * Make a PDF document
 * @param {PDFPrimitive} scene
 * @param {string} filename
 * @returns {Promise<File>}
 */
export async function make_pdf(scene, filename) {
  const document = await PDF.PDFDocument.create();
  const page = document.addPage([PAGE_SIZE.x, PAGE_SIZE.y]);

  const context = new PDFContext(PDF, page);

  scene.draw_pdf(context);

  const pdf_bytes = await document.save();

  const owned = new Uint8Array([...pdf_bytes]);
  return new File([owned], filename, {
    type: "application/pdf",
  });
}
