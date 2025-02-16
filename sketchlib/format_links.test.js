import { describe, it, expect } from "vitest";
import { get_sketch_url, get_thumbnail_url } from "./format_links";

describe("get_sketch_url", () => {
  it("Title Case title creates PascalCase URL", () => {
    const title = "Amazing Title Here";

    const result = get_sketch_url(title);

    expect(result).toBe("./AmazingTitleHere/");
  });

  it("WoNkY CaSe TiTlE creates PascalCase URL", () => {
    const title = "SoMeThiNg Is WrOnG";

    const result = get_sketch_url(title);

    expect(result).toBe("./SomethingIsWrong/");
  });

  it("single word title creates PascalCase URL", () => {
    const title = "Title";

    const result = get_sketch_url(title);

    expect(result).toBe("./Title/");
  });

  it("lowercase title creates PascalCase URL", () => {
    const title = "lowercase title here";

    const result = get_sketch_url(title);

    expect(result).toBe("./LowercaseTitleHere/");
  });
});

describe("get_thumbnail_url", () => {
  it("Title Case title creates lower-kebab-case URL", () => {
    const title = "Amazing Title Here";

    const result = get_thumbnail_url(title);

    expect(result).toBe("./thumbnails/amazing-title-here.png");
  });

  it("WoNkY CaSe TiTlE creates lower-kebab-case URL", () => {
    const title = "SoMeThiNg Is WrOnG";

    const result = get_thumbnail_url(title);

    expect(result).toBe("./thumbnails/something-is-wrong.png");
  });

  it("single word title creates lowercase URL", () => {
    const title = "Title";

    const result = get_thumbnail_url(title);

    expect(result).toBe("./thumbnails/title.png");
  });

  it("lowercase title creates kebab-case URL", () => {
    const title = "lowercase title here";

    const result = get_thumbnail_url(title);

    expect(result).toBe("./thumbnails/lowercase-title-here.png");
  });
});
