// The sketch URL is ./SketchTitleHere/
export function get_sketch_url(title) {
  const pascal_case_parts = title.split(" ").map((x) => {
    const first = x.charAt(0);
    const rest = x.substring(1);
    return first.toUpperCase() + rest.toLowerCase();
  });

  const pascal_case = pascal_case_parts.join("");
  return `./${pascal_case}/`;
}

// Thumbnails are ./thumbnails/sketch-title-here.png
export function get_thumbnail_url(title) {
  const lower_case_parts = title.split(" ").map((x) => x.toLowerCase());

  const kebob_case = lower_case_parts.join("-");
  return `./thumbnails/${kebob_case}.png`;
}
