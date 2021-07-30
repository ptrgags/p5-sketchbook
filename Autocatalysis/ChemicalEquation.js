const CHEMICAL_SYMBOLS = ['A', 'B', 'C', 'D'];
class ChemicalEquation {
  constructor(equation, forward_rate, reverse_rate) {
    this.reactant_coefficients = {
      A: 0,
      B: 0,
      C: 0,
      D: 0
    };
    this.product_coefficients = {
      A: 0,
      B: 0,
      C: 0,
      D: 0
    };
    this.reversible = undefined;
    this.forward_rate = forward_rate;
    this.reverse_rate = reverse_rate;
    
    this.parse_equation(equation);
  }
  
  parse_equation(equation) {
    const [reactants, products] = this.split_equation(equation);
    this.parse_terms(reactants, this.reactant_coefficients);
    this.parse_terms(products, this.product_coefficients);
  }
  
  split_equation(equation) {
    let parts = equation.split('<->');
    if (parts.length === 2) {
      this.reversible = true;
      return parts;
    }
    
    parts = equation.split('->');
    if (parts.length === 2) {
      this.reversible = false;
      return parts;
    }
    
    throw new Error("equation must have the form '[reactants] -> [products]' or '[reactants] <-> [products]'");
  }
  
  parse_terms(term_list, coefficients) {
    // split on " + " for any amount of whitespace
    const terms = term_list.trim().split(/\s+\+\s+/);
    for (const term of terms) {
      const [chemical, coefficient] = this.parse_term(term);
      coefficients[chemical] += coefficient;
    }
  }
  
  parse_term(term) {
    // terms are of the form <coefficient:int>[ABCD]
    const n = term.length;
    let coefficient_str = term.slice(0, n - 1);
    if (coefficient_str === '') {
      coefficient_str = '1';
    }
    
    const coefficient = parseInt(coefficient_str);
    if (isNaN(coefficient)) {
      throw new Error(`${term}: coefficient must be an integer`);
    }
    
    const chemical = term.charAt(n - 1);
    
    if (!CHEMICAL_SYMBOLS.includes(chemical)) {
      throw new Error(`${term}: chemical symbol must be A, B, C or D`);
    }
    
    return [chemical, coefficient];
  }
  
  /**
   * Compute changes in each chemical concentration for
   * aA + bB + cC + dD [<]-> eA + fB + gC + hD
   */
  compute_changes(values) {
    const results = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
    };
    
    // the rate of the reaction is forward_rate * (A^a * B^b * C^c * D^d)
    let reaction_rate = this.forward_rate;
    for (const chemical of CHEMICAL_SYMBOLS) {
      const coefficient = this.reactant_coefficients[chemical];
      reaction_rate *= Math.pow(values[chemical], coefficient);
    }
 
    // Each chemical reduces when it appears in the reactants list, but increases if it
    // appears in the products list
    for (const chemical of CHEMICAL_SYMBOLS) {
      const net_change = this.product_coefficients[chemical] - this.reactant_coefficients[chemical];
      results[chemical] += net_change * reaction_rate;
    }
    
    if (!this.reversible) {
      return results;
    }
    
    // Add in the reverse reaction!
    
    // the rate of the reaction is reverse_rate * (A^e * B^f * C^g * D^h)
    reaction_rate = this.reverse_rate;
    for (const chemical of CHEMICAL_SYMBOLS) {
      const coefficient = this.product_coefficients[chemical];
      reaction_rate *= Math.pow(values[chemical], coefficient);
    }
 
    // Each chemical reduces when it appears in the products list, but increases if it
    // appears in the reactants list
    for (const chemical of CHEMICAL_SYMBOLS) {
      const net_change = this.reactant_coefficients[chemical] - this.product_coefficients[chemical];
      results[chemical] += net_change * reaction_rate;
    }
    
    return results;
  }
}
