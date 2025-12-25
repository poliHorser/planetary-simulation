import { Subject } from "./Observer";
import type { PlanetarySystem, Planet, Star } from "./Models";
import { materializeSystem } from "./Models";
import type { OrbitStrategy, SimulationState } from "./Strategies";
import { CircularOrbitStrategy } from "./Strategies";
import { Logger } from "../Logger";

export type EngineSnapshot = {
  system: PlanetarySystem;
  time: number;
  dt: number;
  timeScale: number;
  strategy: "circular" | "newton";
  planetsState: Array<{ position: { x: number; y: number }; velocity: { x: number; y: number } }>;
};

export type RenderPayload = {
  star: Star;
  planets: Planet[];
  time: number;
};

export class SimulationEngine extends Subject<RenderPayload> {
  private state: SimulationState = { star: { mass: 1 }, planets: [], time: 0 };
  private systemConfig: PlanetarySystem | null = null;

  private running = false;
  private dt = 0.016;
  private timeScale = 60;

  private strategy: OrbitStrategy = new CircularOrbitStrategy();

  setSystem(sys: PlanetarySystem) {
    this.systemConfig = sys;
    const m = materializeSystem(sys);
    this.state = { star: m.star, planets: m.planets, time: 0 };
    this.strategy.init?.(this.state);
    Logger.info("System configured", { planets: sys.planets.map(p => p.name) });
  }

  setStrategy(strategy: OrbitStrategy) {
    this.strategy = strategy;
    try {
      this.strategy.init?.(this.state);
      Logger.info("Strategy changed", { strategy: strategy.name });
    } catch (e) {
      Logger.error("Failed to initialize strategy", { error: e });
    }
    this.notify();
  }

  setDt(dt: number) { 
    this.dt = Math.max(dt, 0.001); 
    Logger.info("Time step changed", { dt: this.dt });
  }

  setTimeScale(ts: number) { 
    this.timeScale = Math.max(ts, 1); 
    Logger.info("Time scale changed", { timeScale: this.timeScale });
  }

  start() { 
    this.running = true; 
    Logger.info("Simulation started", { timeScale: this.timeScale, dt: this.dt });
  }

  pause() { 
    this.running = false; 
    Logger.info("Simulation paused", { time: this.state.time });
  }

  step() {
    try {
      this.strategy.step(this.state, this.dt);
      Logger.info("Simulation step executed", { time: this.state.time });
      this.notify();
    } catch (e) {
      Logger.error("Error during simulation step", { error: e });
    }
  }

  tick() {
    if (!this.running) return;
    const steps = Math.max(1, Math.floor(this.timeScale * this.dt));
    const subDt = this.dt;

    for (let i = 0; i < steps; i++) {
      try {
        this.strategy.step(this.state, subDt);
      } catch (e) {
        Logger.error("Error during simulation tick step", { error: e, step: i });
      }
    }
    this.notify();
  }

  notify() {
    this.notifyAll({ star: this.state.star, planets: this.state.planets, time: this.state.time });
  }

  snapshot(): EngineSnapshot {
    if (!this.systemConfig) {
      Logger.error("Cannot create snapshot: system not configured");
      throw new Error("No system configured");
    }

    return {
      system: this.systemConfig,
      time: this.state.time,
      dt: this.dt,
      timeScale: this.timeScale,
      strategy: this.strategy.name === "newton" ? "newton" : "circular",
      planetsState: this.state.planets.map(p => ({
        position: { ...p.position },
        velocity: { ...p.velocity }
      }))
    };
  }

  loadSnapshot(s: EngineSnapshot) {
    try {
      this.setSystem(s.system);
      this.setDt(s.dt);
      this.setTimeScale(s.timeScale);

      this.state.time = s.time;
      this.state.planets.forEach((p, i) => {
        p.position = { ...s.planetsState[i].position };
        p.velocity = { ...s.planetsState[i].velocity };
      });

      Logger.info("Snapshot loaded", { time: s.time });
      this.notify();
    } catch (e) {
      Logger.error("Failed to load snapshot", { error: e });
    }
  }
}
