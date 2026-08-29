import { download_file } from "../sketchlib/dom/download_file.js";
import { expect_element } from "../sketchlib/dom/expect_element.js";
import { SceneImporter } from "../sketchlib/json/SceneImporter.js";
import { make_pdf } from "../sketchlib/pdf/make_pdf.js";
import { Primitive } from "../sketchlib/primitives/Primitive.js";
import { group } from "../sketchlib/primitives/shorthand.js";
import { ZinePrimitive } from "./ZinePrimitive.js";

const PAGE_NAMES = [
  "front",
  "page1",
  "page2",
  "page3",
  "page4",
  "page5",
  "page6",
  "back",
];

const IMPORTER = new SceneImporter();

export class SnapshotZineMaker {
  constructor() {
    this.zine = new ZinePrimitive();

    /**
     * @type {string[]}
     */
    this.old_urls = [];
  }

  init_ui() {
    PAGE_NAMES.forEach((name) => {
      const input = expect_element(`import-${name}`, HTMLInputElement);

      input.addEventListener("input", async () => {
        const files = input.files;
        if (!files || files.length === 0) {
          throw new Error("Please select a .scene.json file!");
        }

        const [scene_file] = files;
        const json = await scene_file.text();
        const obj = JSON.parse(json);

        const page_primitive = IMPORTER.parse_json(obj);
        this.zine.set_page(name, group(page_primitive));
        this.update_preview();
      });
    });
  }

  async update_preview() {
    // Free the data for previous PDF files
    if (this.old_urls.length > 0) {
      this.old_urls.forEach(URL.revokeObjectURL);
      this.old_urls.length = 0;
    }

    const file = await make_pdf(this.zine, "zine.pdf");

    const url = URL.createObjectURL(file);
    this.old_urls.push(url);

    const preview_object = document.createElement("object");
    preview_object.setAttribute("type", "application/pdf");
    preview_object.setAttribute("width", "800");
    preview_object.setAttribute("height", "1000");
    preview_object.setAttribute("data", url);

    const output_div = expect_element("output", HTMLDivElement);
    output_div.replaceChildren(preview_object);
  }

  /**
   *
   * @param {ArrayBuffer} buffer
   */
  download(buffer) {
    const file = new File([buffer], "zine.pdf", {
      type: "application/pdf",
    });
  }
}
