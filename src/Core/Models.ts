import { v2, type Vec2 } from "./math";

export type Star = {
  mass: number;
};

export type Planet = {
  name: string;
  mass: number;
  orbitRadius: number;   // початковий радіус орбіти
  color: string;

  // стан (оновлюється симуляцією)
  position: Vec2;
  velocity: Vec2;
};

export type PlanetarySystem = {
  star: Star;
  planets: Array<Omit<Planet, "position" | "velocity">>;
};

export function createDefaultSystem(): PlanetarySystem {
  return {
    star: { mass: 1.0 },
    planets: [
      { name: "Earth", mass: 0.003, orbitRadius: 3.0, color: "#4e79a7" },
      { name: "Mars", mass: 0.00032, orbitRadius: 4.3, color: "#e15759" }
    ]
  };
}

export function materializeSystem(sys: PlanetarySystem): { star: Star; planets: Planet[] } {
  const planets: Planet[] = sys.planets.map((p, i) => ({
    ...p,
    position: v2(p.orbitRadius, 0),
    velocity: v2(0, 0) 
  }));
  return { star: sys.star, planets };
}
