function rgb8(r, g, b) {
  return [r / 255, g / 255, b / 255];
}

function hex_color(hex_string) {
  const red_string = hex_string.slice(0, 2);
  const green_string = hex_string.slice(2, 4);
  const blue_string = hex_string.slice(4);

  const red = parseInt(red_string, 16);
  const green = parseInt(green_string, 16);
  const blue = parseInt(blue_string, 16);

  return rgb8(red, green, blue);
}

export class Palette {
  constructor(coolors_url) {
    const colors = Palette.parse_url(coolors_url);
    this.background_color = colors.shift();
    this.colors = colors;
  }

  static parse_url(coolors_url) {
    const color_string = coolors_url.split("/").pop();
    const hex_codes = color_string.split("-");
    return hex_codes.map(hex_color);
  }
}
