class SeashellParameters {
  constructor(options) {
    options = options || {};
    
    // The original BASIC simulation assumes cells are 1 unit apart
    // and each call to update() is 1 unit in time.
    this.delta_time = options.delta_time || 1;
    this.delta_x = options.delta_x || 1;
    
    // How many iterations per call to update(). Essentially, the chemicals
    // are reacting continuously, but the shell grows slower.
    this.iters_per_update = options.iters_per_update || 1;
    
    // Diffusion of the activator (D_a)
    this.activator_diffusion = options.activator_diffusion || 0;
    // Activator decay rate (mu)
    this.activator_decay = options.activator_decay || 0;
    
    // Initial amount of catalysis (rho_0)
    this.initial_catalysis = options.initial_catalysis || 0;
    // Saturation of autocatalysis (k)
    this.saturation = options.saturation || 0;
    
    // Basic production rate of the inhibitor (rho)
    this.inhibitor_production = options.inhibitor_production || 0;
    // Michaelis-Menten constant of inhibition (h_0) 
    this.inhibitor_constant = options.inhibitor_constant || 0;
    // Diffusion of the inhibitor (D_h)
    this.inhibitor_diffusion = options.inhibitor_diffusion || 0;
    // Decay rate of the inhibitor (nu)
    this.inhibitor_decay = options.inhibitor_decay || 0;
    
    // Production rate of the hormone (rho')
    this.hormone_production = options.hormone_production || 0;
    // Decay rate of the hormone (eta)
    this.hormone_decay = options.hormone_decay || 0;
    
    // colors for rendering the shell. Substrate is the background,
    // pigment is the foreground
    this.substrate_color = options.substrate_color || [255, 255, 255];
    this.pigment_color = options.pigment_color || [0, 0, 0];
  }
}

SeashellParameters.CONSTANT = new SeashellParameters();

SeashellParameters.OLIVIA_PORPHYRIA = new SeashellParameters({
  iters_per_update: 12,
  activator_diffusion: 0.015,
  activator_decay: 0.1,
  inhibitor_constant: 0.1,
  inhibitor_decay: 0.014,
  saturation: 0.25,
  hormone_production: 0.1,
  hormone_decay: 0.1,
  substrate_color: [255, 231, 179], // tan
  pigment_color: [133, 78, 44] // brown
});
