import { GroupPrimitive } from "../primitives/GroupPrimitive.js";
import { Primitive } from "../primitives/Primitive.js";
import { Rect } from "../primitives/Rect.js";
import { SimpleGroupPrimitive } from "../primitives/SimpleGroupPrimitive.js";

export class SceneImporter {
  /**
   *
   * @param {any} scene
   * @returns {Primitive}
   */
  parse_json(scene) {
    if (scene.type === "group") {
      // Groups need careful treatment since the inner types are dynamic
      return this.parse_group(scene);
    } else if (scene.type === "rect") {
      return Rect.from_json(scene);
    }

    throw new Error(`unsupported scene JSON: ${scene.type}`);
  }

  /**
   *
   * @param {any} obj A scene JSON that was determined to be a group
   * @returns {GroupPrimitive | SimpleGroupPrimitive}
   */
  parse_group(obj) {
    const parsed_children = obj.children.map((/** @type {any} */ x) =>
      this.parse_json(x),
    );

    return GroupPrimitive.from_json(obj, parsed_children);
  }
}
