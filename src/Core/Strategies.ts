import type { Planet, Star } from "./Models";
import { G } from "./constants";
import { len, norm, sub, mul, add, v2 } from "./math";

export type SimulationState = {
  star: Star;
  planets: Planet[];
  time: number;
};

export interface OrbitStrategy {
  readonly name: string;
  // один крок симуляції
  step(state: SimulationState, dt: number): void;
  // опціонально — ініціалізація швидкостей
  init?(state: SimulationState): void;
}

/**
 * Strategy 1: ідеально кругові орбіти (демонстраційно).
 * Планети рухаються з кутовою швидкістю, що залежить від M* та r.
 */
export class CircularOrbitStrategy implements OrbitStrategy {
  readonly name = "circular";

  init(state: SimulationState): void {
    for (const p of state.planets) {
      // v = sqrt(G*M/r) у наших умовних одиницях
      const v = Math.sqrt((G * state.star.mass) / p.orbitRadius);
      p.position = v2(p.orbitRadius, 0);
      p.velocity = v2(0, v);
    }
  }

  step(state: SimulationState, dt: number): void {
    for (const p of state.planets) {
      // для кругової орбіти просто інтегруємо v
      p.position = add(p.position, mul(p.velocity, dt));
      // легка корекція на радіус (щоб не "розпливалося")
      const r = len(p.position);
      const dir = norm(p.position);
      p.position = mul(dir, p.orbitRadius);
      // швидкість перпендикулярна радіус-вектору
      const vmag = Math.sqrt((G * state.star.mass) / p.orbitRadius);
      p.velocity = v2(-dir.y * vmag, dir.x * vmag);
    }
    state.time += dt;
  }
}

/**
 * Strategy 2: Ньютонова гравітація + простий інтегратор Ейлера (навчально).
 * a = -G*M * r_hat / r^2
 */
export class NewtonEulerStrategy implements OrbitStrategy {
  readonly name = "newton";

  init(state: SimulationState): void {
    for (const p of state.planets) {
      const v = Math.sqrt((G * state.star.mass) / p.orbitRadius);
      p.position = v2(p.orbitRadius, 0);
      p.velocity = v2(0, v); // стартуємо з приблизно кругової
    }
  }

  step(state: SimulationState, dt: number): void {
    for (const p of state.planets) {
      const rVec = sub(p.position, v2(0, 0));
      const r = Math.max(len(rVec), 1e-6);
      const rHat = norm(rVec);

      const accelMag = -(G * state.star.mass) / (r * r);
      const a = mul(rHat, accelMag);

      p.velocity = add(p.velocity, mul(a, dt));
      p.position = add(p.position, mul(p.velocity, dt));
    }
    state.time += dt;
  }
}
