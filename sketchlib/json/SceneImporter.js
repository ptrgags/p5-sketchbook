import { GroupPrimitive } from "../primitives/GroupPrimitive.js";
import { Primitive } from "../primitives/Primitive.js";
import { Rect } from "../primitives/Rect.js";
import { SimpleGroupPrimitive } from "../primitives/SimpleGroupPrimitive.js";

/**
 * @type {{[type: string]: function(any): Primitive}}
 */
const PARSERS = {
  rect: Rect.from_json,
};

/**
 * Object that can import a scene from JSON.
 *
 * This is still at the prototype stage, details are subject to change. Use
 * at your own risk!
 *
 * Right now this doesn't really need to be a class. However, in the future
 * some sketches with custom primitives may need to register more parsers.
 */
export class SceneImporter {
  /**
   *
   * @param {any} scene
   * @returns {Primitive}
   */
  parse_json(scene) {
    if (!scene.type) {
      throw new Error(`scene.type must be specified!: ${scene.type}`);
    }

    if (scene.type === "group") {
      // Groups need careful treatment since the inner types are dynamic
      return this.parse_group(scene);
    }

    const parse_func = PARSERS[scene.type];
    if (!parse_func) {
      throw new Error(`unsupported scene JSON: ${scene.type}`);
    }

    return parse_func(scene);
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
