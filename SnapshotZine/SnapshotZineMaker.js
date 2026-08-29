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
    const file = await make_pdf(this.zine, "zine.pdf");
    download_file(file);
  }
}
