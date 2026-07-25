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

    it("translations commute", () => {
      const a = Rigid.translation(new Direction(2, 3));
      const b = Rigid.translation(new Direction(-1, 4));

      const ab = a.compose(b);
      const ba = b.compose(a);

      expect(ab).toBeRigid(ba);
    });

    it("with two rotations returns rotation with sum of angles", () => {
      const a = Rigid.rotation(Math.PI / 4);
      const b = Rigid.rotation(-Math.PI / 2);

      const result = a.compose(b);

      const expected = Rigid.rotation(-Math.PI / 4);
      expect(result).toBeRigid(expected);
    });

    it("rotations commute", () => {
      const a = Rigid.rotation(Math.PI / 4);
      const b = Rigid.rotation(-Math.PI / 2);

      const ab = a.compose(b);
      const ba = b.compose(a);

      expect(ab).toBeRigid(ba);
    });

    it("with translation and rotation computes correct results in each order", () => {
      const trans = Rigid.translation(Direction.DIR_X);
      const rot = Rigid.rotation(Math.PI / 2);

      const tr = trans.compose(rot);
      const rt = rot.compose(trans);

      // T * R matches the internal representation, so the expected result
      // is straightforward combination of parameters. However, R * T
      // = T(R(d)) * R
      const expected_tr = new Rigid({
        translation: Direction.DIR_X,
        rotation: Math.PI / 2,
      });
      const expected_rt = new Rigid({
        translation: Direction.DIR_Y,
        rotation: Math.PI / 2,
      });
      expect(tr).toBeRigid(expected_tr);
      expect(rt).toBeRigid(expected_rt);
    });

    it("with translation and flip_y computes correct results in each order", () => {
      const trans = Rigid.translation(new Direction(2, 3));
      const flip = Rigid.FLIP_Y;

      const t_flip = trans.compose(flip);
      const flip_t = flip.compose(trans);

      // T * Y matches the internal representation, so the expected result
      // is straightforward combination of parameters. However, Y * T
      // = Y * T(2, 3)
      // = T(2, -3) * Y
      const expected_t_flip = new Rigid({
        translation: new Direction(2, 3),
        flip: true,
      });
      const expected_flip_t = new Rigid({
        translation: new Direction(2, -3),
        flip: true,
      });
      expect(t_flip).toBeRigid(expected_t_flip);
      expect(flip_t).toBeRigid(expected_flip_t);
    });

    it("with TRY, TRY returns correct TR transforms", () => {
      const a = new Rigid({
        translation: Direction.DIR_X,
        rotation: Math.PI / 2,
        flip: true,
      });
      const b = new Rigid({
        translation: Direction.DIR_Y,
        rotation: Math.PI,
        flip: true,
      });

      const ab = a.compose(b);
      const ba = b.compose(a);

      // T(1, 0) * R4 * Y * T(0, 1) * R4^2 * Y
      // = T(1, 0) * R4 * T(0, -1) * R4^2 * Y * Y
      // = T(1, 0) * T(1, 0) * R4 * R4^2
      // = T(2, 1) * R4^3
      // = R4^3
      const expected_ab = new Rigid({
        translation: new Direction(2, 0),
        rotation: (3 * Math.PI) / 2,
      });
      // T(0, 1) * R4^2 * Y * T(1, 0) * R4 * Y
      // = T(0, 1) * T(-1, 0) * R4^2 * Y * R4 * Y
      // = T(-1, 1) * R4^2 * R4^-1 * Y * Y
      // = T(-1, 1) * R4
      const expected_ba = new Rigid({
        translation: new Direction(-1, 1),
        rotation: Math.PI / 2,
      });
      expect(ab).toBeRigid(expected_ab);
      expect(ba).toBeRigid(expected_ba);
    });

    it("with TRY, TR returns correct TRY transform", () => {
      const a = new Rigid({
        translation: Direction.DIR_X,
        rotation: Math.PI / 2,
        flip: true,
      });
      const b = new Rigid({
        translation: Direction.DIR_Y,
        rotation: Math.PI,
      });

      const ab = a.compose(b);
      const ba = b.compose(a);

      // T(1, 0) * R4 * Y * T(0, 1) * R4^2
      // = T(1, 0) * R4 * T(0, -1) * R4^2 * Y
      // = T(1, 0) * T(1, 0) * R4 * R4^2 * Y
      // = T(2, 0) * R4^3 * Y
      const expected_ab = new Rigid({
        translation: new Direction(2, 0),
        rotation: (3 * Math.PI) / 2,
        flip: true,
      });
      // T(0, 1) * R4^2 * T(1, 0) * R4 * Y
      // = T(0, 1) * T(-1, 0) * R4^2 * R4 * Y
      // = T(-1, 1) * R4^3 * Y
      const expected_ba = new Rigid({
        translation: new Direction(-1, 1),
        rotation: (3 * Math.PI) / 2,
        flip: true,
      });
      expect(ab).toBeRigid(expected_ab);
      expect(ba).toBeRigid(expected_ba);
    });
  });

  describe("difference", () => {
    it("difference of two translations is the translation between them", () => {
      const a = Rigid.translation(new Direction(2, -3));
      const b = Rigid.translation(new Direction(-1, -1));

      const result = a.difference(b);

      const expected = Rigid.translation(new Direction(3, -2));
      expect(result).toBeRigid(expected);
    });

    it("difference of two rotations is the rotation between them", () => {
      const a = Rigid.rotation(Math.PI / 4);
      const b = Rigid.rotation(Math.PI);

      const result = a.difference(b);

      const expected = Rigid.rotation(-(3 * Math.PI) / 4);
      expect(result).toBeRigid(expected);
    });

    it("difference of translation and rotation is a TR transformation", () => {
      const a = Rigid.translation(Direction.DIR_X);
      const b = Rigid.rotation(Math.PI / 2);

      const result = a.difference(b);

      const expected = new Rigid({
        translation: Direction.DIR_X,
        rotation: -Math.PI / 2,
      });
      expect(result).toBeRigid(expected);
    });

    it("difference of two transformation chains is computed correctly", () => {
      const a = new Rigid({
        translation: Direction.DIR_X,
        rotation: Math.PI / 2,
        flip: true,
      });
      const b = new Rigid({
        translation: Direction.DIR_Y,
        rotation: Math.PI,
      });

      const result = a.difference(b);

      // T(1, 0) * R4 * Y * R4^2 * T(0, -1)
      // T(1, 0) * R4 * R4^2 * Y * T(0, -1)
      // T(1, 0) * R4^3 * T(0, 1) * Y
      // T(1, 0) * T(1, 0) * R4^3 * Y
      // T(2, 0) * R4^3 * Y
      const expected = new Rigid({
        translation: new Direction(2, 0),
        rotation: (3 * Math.PI) / 2,
        flip: true,
      });
      expect(result).toBeRigid(expected);
    });
  });

  describe("conjugate", () => {
    it("translation conjugate translation returns filling", () => {
      const a = Rigid.translation(Direction.DIR_X);
      const b = Rigid.translation(new Direction(2, -4));

      const result = a.conjugate(b);

      const expected = b;
      expect(result).toBeRigid(expected);
    });

    it("rotation conjugate rotation returns filling", () => {
      const a = Rigid.rotation(Math.PI);
      const b = Rigid.rotation(Math.PI / 4);

      const result = a.conjugate(b);

      const expected = b;
      expect(result).toBeRigid(expected);
    });

    it("flip conjugate flip returns flip", () => {
      const a = Rigid.FLIP_Y;
      const b = Rigid.FLIP_Y;

      const result = a.conjugate(b);

      const expected = Rigid.FLIP_Y;
      expect(result).toBeRigid(expected);
    });

    it("translate conjugate rotation returns correct TR transform", () => {
      const a = Rigid.translation(Direction.DIR_Y);
      const b = Rigid.rotation(Math.PI / 2);

      const result = a.conjugate(b);

      const expected = new Rigid({
        translation: new Direction(1, 1),
        rotation: Math.PI / 2,
      });
      expect(result).toBeRigid(expected);
    });

    it("translate conjugate flip returns correct TY transform", () => {
      const a = Rigid.translation(Direction.DIR_Y);
      const b = Rigid.FLIP_Y;

      const result = a.conjugate(b);

      // T(0, 1) * Y * T(0, -1)
      // = T(0, 1) * T(0, 1) * Y
      // = T(0, 2) * Y
      const expected = new Rigid({
        translation: new Direction(0, 2),
        flip: true,
      });
      expect(result).toBeRigid(expected);
    });

    it("TRY conjugate TRY returns correct TRY transform", () => {
      const a = new Rigid({
        translation: Direction.DIR_X,
        rotation: Math.PI / 2,
        flip: true,
      });

      const b = new Rigid({
        translation: new Direction(1, 2),
        rotation: Math.PI,
        flip: true,
      });

      const result = a.conjugate(b);

      // T(1, 0) * R4 * Y * T(1, 2) * R4^2 * Y * Y * R4^-1 * T(-1, 0)
      // = T(1, 0) * R4 * T(1, -2) * Y * R4^2 * R4^-1 * T(-1, 0)
      // = T(1, 0) * T(2, 1) * R4 * Y * R4 * T(-1, 0)
      // = T(3, 1) * R4 * R4^-1 * Y * T(-1, 0)
      // = T(3, 1) * Y * T(-1, 0)
      // = T(3, 1) * T(-1, 0) * Y
      // = T(2, 1) * Y
      const expected = new Rigid({
        translation: new Direction(2, 1),
        rotation: 0,
        flip: true,
      });
      expect(result).toBeRigid(expected);
    });
  });

  describe("interpolate", () => {
    it("with mismatched flip flags throws error", () => {
      const a = new Rigid({
        translation: new Direction(2, 3),
        flip: true,
      });
      const b = new Rigid({
        rotation: Math.PI / 2,
        flip: false,
      });

      expect(() => {
        return Rigid.interpolate(a, b, 0.5);
      }).toThrowError("a and b must have the same orientation");
    });

    it("with t=0 returns a", () => {
      const a = new Rigid({
        translation: Direction.DIR_X,
        rotation: Math.PI / 2,
      });

      const b = new Rigid({
        translation: new Direction(1, 2),
        rotation: Math.PI,
      });

      const result = Rigid.interpolate(a, b, 0);

      const expected = a;
      expect(result).toBeRigid(expected);
    });

    it("with t=1 returns b", () => {
      const a = new Rigid({
        translation: Direction.DIR_X,
        rotation: Math.PI / 2,
      });

      const b = new Rigid({
        translation: new Direction(1, 2),
        rotation: Math.PI,
      });

      const result = Rigid.interpolate(a, b, 1);

      const expected = b;
      expect(result).toBeRigid(expected);
    });

    it("with t in range interpolates parameters", () => {
      const a = new Rigid({
        translation: Direction.DIR_X,
        rotation: Math.PI / 2,
        flip: true,
      });

      const b = new Rigid({
        translation: new Direction(1, 2),
        rotation: Math.PI,
        flip: true,
      });

      const result = Rigid.interpolate(a, b, 0.75);

      const expected = new Rigid({
        translation: new Direction(1, 1.5),
        rotation: (7 * Math.PI) / 8,
        flip: true,
      });
      expect(result).toBeRigid(expected);
    });

    it("with t greater than 1 extrapolates", () => {
      const a = new Rigid({
        translation: Direction.DIR_X,
        rotation: Math.PI / 2,
        flip: true,
      });

      const b = new Rigid({
        translation: new Direction(1, 2),
        rotation: Math.PI,
        flip: true,
      });

      const result = Rigid.interpolate(a, b, 2);

      const expected = new Rigid({
        translation: new Direction(1, 4),
        rotation: (3 * Math.PI) / 2,
        flip: true,
      });
      expect(result).toBeRigid(expected);
    });

    it("with translation and rotation interpolates gracefully", () => {
      const a = Rigid.translation(Direction.DIR_X);
      const b = Rigid.rotation(Math.PI);

      const result = Rigid.interpolate(a, b, 0.75);

      const expected = new Rigid({
        translation: new Direction(0.25, 0),
        rotation: (3 * Math.PI) / 4,
      });
      expect(result).toBeRigid(expected);
    });
  });
});
