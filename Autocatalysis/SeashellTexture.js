function fixed_mod(x, n) {
  return ((x % n) + n) % n;
}

const DEFAULT_PALETTE = {
  A: "#FF0000",
  B: "#00FF00",
  C: "#0000FF",
  D: "#FFFFFF",
};

class SeashellTexture {
  constructor(options) {
    this.delta_time = options.delta_time || 1;
    
    this.reaction_diffusion = options.reaction_diffusion;
    
    const max_width = options.max_width || 500;
    const max_height = options.max_height || 700;
    
    this.read_buffer = new Array(max_width);
    this.write_buffer = new Array(max_width);
    this.shell = new Array(max_width * max_height);
    this.shell_widths = new Array(max_height);
    
    const current_width = options.initial_width || max_width;
    this.shell_widths[0] = current_width;
    
    this.palette = options.palette || DEFAULT_PALETTE;
    
    this.max_width = max_width;
    this.max_height = max_height;
    this.current_width = current_width;
    this.current_row = 0;
    this.current_shift = 0;
    
    this.initialize();
  }
  
  initialize() {
    for (let i = 0; i < this.current_width; i++) {
      var concentrations = aggregate_concentration();
      this.read_buffer[i] = concentrations;
      this.write_buffer[i] = clone(concentrations);
    }
    
    for (let i = 0; i < this.max_height; i++) {
      for (let j = 0; j < this.max_width; j++) {
        const index = i * this.max_width + j;
        this.shell[index] = empty_concentrations();
      }
    }
  }
  
  read(index) {
    const read_index = fixed_mod(index - this.current_shift, this.current_width);
    return this.read_buffer[read_index];
  }
  
  write(index, values) {
    set_concentrations(this.write_buffer[index], values);
  }
  
  // Swap the read and write buffers
  swap_buffers() {
    [this.read_buffer, this.write_buffer] = [this.write_buffer, this.read_buffer];
  }
  
  // deposit the current distribution of chemicals into the shell texture
  // and advance to a new row.
  deposit() {
    if (this.current_row >= this.max_height) {
      return;
    }
    
    for (let i = 0; i < this.current_width; i++) {
      const shell_index = this.max_width * this.current_row + i;
      add_concentrations(this.shell[shell_index], this.read(shell_index));
    }
    
    this.shell_widths[this.current_row] = this.current_width;
    this.current_row++;
  }
  
  // shift the chemicals around the shell's surface
  shift(n) {
    this.current_shift += n;
  }
  
  react(n) {
    for (let i = 0; i < n; i++) {
      this.reaction_diffusion.compute(this, this.delta_time);
    }
  }
  
  reverse_diffusion() {
    this.reaction_diffusion.reverse_diffusion();
  }
  
  display_chemical(x, y, concentrations) {
    const [chemical, max_concentration] = get_max_concentration(concentrations);
    const chemical_color = color(PALETTE[chemical]);
    
    texture.noFill();
    texture.stroke(PALETTE[chemical]);
    texture.point(x, y);
  }

  // map (-inf, inf) into the range [0, 1].
  // Negative values are flipped
  tone_map(x) {
    x = Math.abs(x);
    return x / (1 + x);
  }

  display_blended(x, y, concentrations, shell_img) {
    const a = this.tone_map(concentrations.A);
    const b = this.tone_map(concentrations.B);
    const c = this.tone_map(concentrations.C);
    const d = this.tone_map(concentrations.D);
    const weights = [a, b, c, d];
    
    const a_color = color(PALETTE.A);
    const b_color = color(PALETTE.B);
    const c_color = color(PALETTE.C);
    const d_color = color(PALETTE.D);
    const colors = [a_color, b_color, c_color, d_color];
    
    let avg_r = 0;
    let avg_g = 0;
    let avg_b = 0;
    for (let i = 0; i < 4; i++) {
      const c = colors[i];
      for (let j = 0; j < 4; j++) {
        avg_r += weights[j] * red(c);
        avg_g += weights[j] * green(c);
        avg_b += weights[j] * blue(c);
      }
    }
    avg_r /= 4.0;
    avg_g /= 4.0;
    avg_b /= 4.0;
    
    shell_img.noFill();
    shell_img.stroke(color(avg_r, avg_g, avg_b));
    shell_img.point(x, y);
  }
  
  display_chemicals(y) {
    for (let i = 0; i < WIDTH; i++) {
      //display_chemical(i, y, CHEMICALS[READ][i]);
      display_blended(i, y, CHEMICALS[READ][i]);
    }
  }
  
  draw_shell(shell_img) {
    for (let i = 0; i < this.current_width; i++) {
      //this.display_chemical(j, i, this.read_buffer[j]);
      this.display_blended(i, this.current_row, this.read_buffer[i], shell_img);
    }
  }
  
  draw_texture() {
    
  }
  
  display_concentration_phase(concentrations) {
    const a = concentrations.A;
    const b = concentrations.B;
    const c = concentrations.C;
    const d = concentrations.D;
    let total = a + b + c + d;
    if (total === 0) {
      total = 0;
    }
    const weight_a = a / total;
    const weight_b = b / total;
    const weight_c = c / total;
    const weight_d = d / total;
    
    const [ax, ay] = [0, 0];
    const [bx, by] = [0, WIDTH];
    const [cx, cy] = [WIDTH, WIDTH];
    const [dx, dy] = [WIDTH, 0];
    
    const x = weight_a * ax + weight_b * bx + weight_c * cx + weight_d * dx;
    const y = weight_a * ay + weight_b * by + weight_c * cy + weight_d * dy;
    
    // TODO: What's the best way to distinguish even distributions from skewed ones?
    const max_weight = Math.max(weight_a, weight_b, weight_c, weight_d);
    stroke(max_weight * 255);
    point(x, y);
  }
  
  draw_phase_plot() {
    const plot_width = this.max_width;
    const square_width = plot_width / 2;
    
    noFill();
    noStroke();
    fill(PALETTE.A);
    rect(0, 0, square_width, square_width);
    fill(PALETTE.B);
    rect(0, square_width, square_width, square_width);
    fill(PALETTE.C);
    rect(square_width, square_width, square_width, square_width);
    fill(PALETTE.D);
    rect(square_width, 0, square_width, square_width);
    
    noStroke();
    fill(255);
    textSize(20);
    textAlign(LEFT, TOP);
    text("A", 0, 0);
    textAlign(LEFT, BASELINE);
    text("B", 0, plot_width);
    textAlign(RIGHT, BASELINE);
    text("C", plot_width, plot_width);
    textAlign(RIGHT, TOP);
    text("D", plot_width, 0);
    
    
    noFill();
    strokeWeight(4);
    for (let i = 0; i < this.current_width; i++) {
      const concentrations = this.read_buffer[i];
      this.display_concentration_phase(concentrations);
    }
  }
}
