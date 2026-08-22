import { GroupPrimitive } from "../primitives/GroupPrimitive.js";
import { Primitive } from "../primitives/Primitive.js";
import { Rect } from "../primitives/Rect.js";

export class SceneImporter {
  /**
   *
   * @param {any} scene
   * @returns {Primitive}
   */
  parse_json(scene) {
    if (scene.type === "group") {
      return GroupPrimitive.from_json(this, scene);
    } else if (scene.type === "rect") {
      return Rect.from_json(scene);
    }

    throw new Error(`unsupported scene JSON: ${scene.type}`);
  }
}
