import { describe, it, expect } from "vitest";
import { Rigid } from "./Rigid.js";
import { Direction } from "../pga2d/Direction.js";

describe("Rigid", () => {
  it("translation sets correct settings", () => {
    const result = Rigid.translation(new Direction(2, -1));

    const expected = new Rigid({
      translation: new Direction(2, -1),
      rotation: 0,
      flip: false,
    });
    expect(result).toBeRigid(expected);
  });

  it("rotation sets correct settings", () => {
    const result = Rigid.rotation(Math.PI);

    const expected = new Rigid({
      translation: Direction.ZERO,
      rotation: Math.PI,
      flip: false,
    });
    expect(result).toBeRigid(expected);
  });

  it("reflection sets correct settings", () => {
    const result = Rigid.reflection(Math.PI / 4);

    const expected = new Rigid({
      translation: Direction.ZERO,
      rotation: Math.PI / 2,
      flip: true,
    });
    expect(result).toBeRigid(expected);
  });

  describe("inverse", () => {
    it("inverse of translation is translation with the opposite direction", () => {
      const translation = Rigid.translation(new Direction(2, -1));

      const result = translation.inverse();

      const expected = Rigid.translation(new Direction(-2, 1));
      expect(result).toBeRigid(expected);
    });

    it("inverse of rotation is rotation with reversed angle", () => {
      const rotation = Rigid.rotation(Math.PI / 4);

      const result = rotation.inverse();

      const expected = Rigid.rotation(-Math.PI / 4);
      expect(result).toBeRigid(expected);
    });

    it("inverse of FLIP_Y is itself", () => {
      const result = Rigid.FLIP_Y.inverse();

      const expected = Rigid.FLIP_Y;
      expect(result).toBeRigid(expected);
    });

    it("inverse of rigid without flip computes correct transformation", () => {
      const rigid = new Rigid({
        translation: Direction.DIR_X,
        rotation: Math.PI / 2,
      });

      const result = rigid.inverse();

      const expected = new Rigid({
        translation: Direction.DIR_Y,
        rotation: -Math.PI / 2,
      });
      expect(result).toBeRigid(expected);
    });

    it("inverse of rigid with flip computes correct transformation", () => {
      const rigid = new Rigid({
        translation: Direction.DIR_X,
        rotation: Math.PI / 2,
        flip: true,
      });

      const result = rigid.inverse();

      const expected = new Rigid({
        translation: Direction.DIR_Y.neg(),
        rotation: Math.PI / 2,
        flip: true,
      });
      expect(result).toBeRigid(expected);
    });
  });

  describe("compose", () => {
    it("IDENTIY obeys the identity law", () => {
      const id = Rigid.IDENTITY;
      const rigid = new Rigid({
        translation: Direction.DIR_X,
        rotation: Math.PI / 2,
        flip: true,
      });

      const id_rigid = id.compose(rigid);
      const rigid_id = rigid.compose(id);

      expect(id_rigid).toBeRigid(rigid);
      expect(rigid_id).toBeRigid(rigid);
    });

    it("with two translations returns vector sum", () => {
      const a = Rigid.translation(new Direction(2, 3));
      const b = Rigid.translation(new Direction(-1, 4));

      const result = a.compose(b);

      const expected = Rigid.translation(new Direction(1, 7));
      expect(result).toBeRigid(expected);
    });
  });
});
