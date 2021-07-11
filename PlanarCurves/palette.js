function hex_color(hex_string) {
  const red_string = hex_string.slice(0, 2);
  const green_string = hex_string.slice(2, 4);
  const blue_string = hex_string.slice(4);
  
  const red = parseInt(red_string, 16);
  const green = parseInt(green_string, 16);
  const blue = parseInt(blue_string, 16);
  
  // Unlike Hyperbolic connections, return values in 0-255 instead of 0-1
  return [red, green, blue];
}

class Palette {
  // Unlike Hyperbolic connections, this palette doesn't distinguish a background color
  constructor(coolors_url) {
    const colors = Palette.parse_url(coolors_url);
    this.colors = colors;
  }
  
  // Parse a coolors.co URL
  static parse_url(coolors_url) {
    const color_string = coolors_url.split('/').pop();
    const hex_codes = color_string.split('-');
    return hex_codes.map(hex_color);
  }
}
