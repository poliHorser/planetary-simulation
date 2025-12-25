import { describe, it, expect } from "vitest";
import { SimulationEngine } from "../Core/SimulationEngine";
import { CircularOrbitStrategy, NewtonEulerStrategy } from "../Core/Strategies";
import { createDefaultSystem } from "../Core/Models";

describe("SimulationEngine", () => {
  it("updates time and planet positions on step()", () => {
    const e = new SimulationEngine();
    e.setSystem(createDefaultSystem());
    e.setStrategy(new CircularOrbitStrategy());

    const snap1 = e.snapshot();
    e.step();
    const snap2 = e.snapshot();

    expect(snap2.time).toBeGreaterThan(snap1.time);
    // position should change
    expect(snap2.planetsState[0].position.x !== snap1.planetsState[0].position.x
      || snap2.planetsState[0].position.y !== snap1.planetsState[0].position.y).toBe(true);
  });

  it("supports switching strategy (Strategy pattern)", () => {
    const e = new SimulationEngine();
    e.setSystem(createDefaultSystem());

    e.setStrategy(new NewtonEulerStrategy());
    const s1 = e.snapshot();
    e.step();
    const s2 = e.snapshot();

    expect(s2.time).toBeGreaterThan(s1.time);
  });
});
