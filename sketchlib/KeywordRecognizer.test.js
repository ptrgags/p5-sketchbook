import { describe, it, expect } from "vitest";
import { KeywordRecognizer } from "./KeywordRecognizer.js";

describe("KeywordRecognizer", () => {
  describe("input", () => {
    it("with partial input does not trigger callback", () => {
      const kw = new KeywordRecognizer();
      let result = false;
      kw.register(["Slash", "A", "B", "C"], () => {
        result = true;
      });

      kw.input("Slash");
      kw.input("A");

      expect(result).toBe(false);
    });

    it("with correct input triggers callback", () => {
      const kw = new KeywordRecognizer();
      let call_count = 0;
      kw.register(["Slash", "A", "B", "C"], () => {
        call_count++;
      });

      kw.input("Slash");
      kw.input("A");
      kw.input("B");
      kw.input("C");

      expect(call_count).toBe(1);
    });

    it("with incorrect input does not trigger callback", () => {
      const kw = new KeywordRecognizer();
      let call_count = 0;
      kw.register(["Slash", "A", "B", "C"], () => {
        call_count++;
      });

      kw.input("A");
      kw.input("B");
      kw.input("C");

      expect(call_count).toBe(0);
    });

    it("with incorrect prefix then correct input triggers callback", () => {
      const kw = new KeywordRecognizer();
      let call_count = 0;
      kw.register(["Slash", "A", "B", "C"], () => {
        call_count++;
      });

      // Bad input should be ignored and return to the start of the tree
      kw.input("Slash");
      kw.input("D");
      // correct command
      kw.input("Slash");
      kw.input("A");
      kw.input("B");
      kw.input("C");

      expect(call_count).toBe(1);
    });
  });

  describe("slash", () => {
    it("without slash throws error", () => {
      const kw = new KeywordRecognizer();

      expect(() => {
        return kw.slash("noslash", () => {});
      }).toThrowError("slash_command must begin with a /");
    });

    it("with letters produces correct keyword", () => {
      const kw = new KeywordRecognizer();
      let call_count = 0;

      kw.slash("/abc", () => {
        call_count++;
      });
      kw.input("Slash");
      kw.input("KeyA");
      kw.input("KeyB");
      kw.input("KeyC");

      expect(call_count).toBe(1);
    });

    it("with digits produces correct keyword for digit keys", () => {
      const kw = new KeywordRecognizer();
      let call_count = 0;

      kw.slash("/42", () => {
        call_count++;
      });
      kw.input("Slash");
      kw.input("Digit4");
      kw.input("Digit2");

      expect(call_count).toBe(1);
    });

    it("with digits does not respond to numpad keys (for now)", () => {
      const kw = new KeywordRecognizer();
      let call_count = 0;

      kw.slash("/42", () => {
        call_count++;
      });
      kw.input("Slash");
      kw.input("Numpad4");
      kw.input("Numpad2");

      expect(call_count).toBe(0);
    });
  });
});
