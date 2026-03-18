import { expect } from "vitest";
import { CGA_MATCHERS } from "./cga_matchers.js";
import { PGA_MATCHERS } from "./pga_matchers.js";
import { GEOMETRY_MATCHERS } from "./geometry_matchers.js";

expect.extend(CGA_MATCHERS);
expect.extend(PGA_MATCHERS);
expect.extend(GEOMETRY_MATCHERS);
