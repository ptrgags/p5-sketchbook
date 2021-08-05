const TEMP_OUTPUT = empty_concentrations();
const TEMP_DERIVATIVES = empty_concentrations();

const DEFAULT_LINEAR_RATES = [
  0, 0, 0, 0,
  0, 0, 0, 0,
  0, 0, 0, 0,
  0, 0, 0, 0
];

class ReactionDiffusion {
  constructor(options) {
    this.delta_time = options.delta_time || 1;
    this.reactions = options.reaction_equations || [];
    this.diffusion_rates = options.diffusion_rates || empty_concentrations();
    
    // technically linear and constant terms are redundant
    // as they can be expressed with ChemicalEquations,
    // however, these are easier to express and more efficient
    this.linear_scale = options.linear_scale || 1;
    this.linear_rates = options.linear_rates || DEFAULT_LINEAR_RATES;
    this.constant_rates = options.constant_rates || empty_concentrations();
  }
  
  compute(shell, delta_time) {
    for (let i = 0; i < shell.current_width; i++) {
      const left_index = fixed_modulo(i - 1, current_width);
      const right_index = fixed_modulo(i + 1, current_width);
      const left_neighbor = shell.read(left_index);
      const right_neighbor = shell.read(right_index);
      const input = shell.read(i);
      
      // start with dx = 0
      scale_concentrations(TEMP_DERIVATIVES, 0);
    
      // Reaction terms
      // dx = reaction(x)
      for (const equation of this.reactions) {
        const reaction_terms = equation.compute_changes(input);
        add_concentrations(TEMP_DERIVATIVES, reaction_terms);
      }
    
      // diffusion terms
      // dx = D * laplacian(x)
      const diffusion_terms = laplacian(left_neighbor, input, right_neighbor);
      multiply_concentrations(diffusion_terms, this.diffusion_rates);
      add_concentrations(derivatives, diffusion_terms);
    
      // Exponential growth/decay and other linear ODE terms
      // dx = M * x
      const linear_terms = linear_transform(input, LINEAR_RATES);
      scale_concentrations(linear_terms, LINEAR_SCALE);
      add_concentrations(TEMP_DERIVATIVES, linear_terms);
    
      // Constant addition/removal
      // dx = C
      add_concentrations(TEMP_DERIVATIVES, CONSTANT_RATES);
    
      // Euler's Method
      // output = input + dt * derivatives
      set_concentrations(TEMP_OUTPUT, input);
      scale_concentrations(TEMP_DERIVATIVES, delta_time);
      add_concentrations(TEMP_OUTPUT, TEMP_DERIVATIVES);
      
      // write this to the write buffer
      shell.write(i, TEMP_OUTPUT);
    }
  }
}
