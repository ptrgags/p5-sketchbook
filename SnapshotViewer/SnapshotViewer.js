import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { expect_element } from "../sketchlib/dom/expect_element.js";
import { SceneImporter } from "../sketchlib/json/SceneImporter.js";
import { group } from "../sketchlib/primitives/shorthand.js";

const SCENE = group();
const IMPORTER = new SceneImporter();

// @ts-ignore
export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(WIDTH, HEIGHT);
    p.pixelDensity(1);

    const import_input = expect_element("import", HTMLInputElement);
    import_input.addEventListener("input", async (e) => {
      const files = import_input.files ?? [];

      try {
        const file = files[0];
        const json = await file.text();
        const obj = JSON.parse(json);

        const imported_scene = IMPORTER.parse_json(obj);
        SCENE.regroup(imported_scene);
      } catch (err) {
        console.error(err);
      }
    });
  };

  p.draw = () => {
    p.background(0);

    SCENE.draw(p);
  };
};
