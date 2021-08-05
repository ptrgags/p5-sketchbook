function fixed_mod(x, n) {
  return ((x % n) + n) % n;
}

class SeashellTexture {
  constructor(options) {
    this.delta_time = options.delta_time || 1;
    
    this.reaction_diffusion = options.reaction_diffusion;
    
    const max_width = options.max_width;
    const max_height = options.max_height;
    
    this.read_buffer = new Array(max_width);
    this.write_buffer = new Array(max_width);
    this.shell = new Array(max_width * max_height);
    this.shell_widths = new Array(max_height);
    
    this.max_width = max_width;
    this.max_height = max_height;
    this.current_width = options.initial_width;
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
        this.shell[index] = empty_concentration();
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
}
