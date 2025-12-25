import { Subject } from "./Observer";
import type { PlanetarySystem, Planet, Star } from "./Models";
import { materializeSystem } from "./Models";
import type { OrbitStrategy, SimulationState } from "./Strategies";
import { CircularOrbitStrategy } from "./Strategies";

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
  }

  setStrategy(strategy: OrbitStrategy) {
    this.strategy = strategy;
    // переініціалізувати швидкості під нову стратегію
    this.strategy.init?.(this.state);
    this.notify();
  }

  setDt(dt: number) { this.dt = Math.max(dt, 0.001); }
  setTimeScale(ts: number) { this.timeScale = Math.max(ts, 1); }

  start() { this.running = true; }
  pause() { this.running = false; }

  step() {
    // один крок (як у твоєму "Simulation Step Cycle")
    this.strategy.step(this.state, this.dt);
    this.notify();
  }

  tick() {
    if (!this.running) return;

    // робимо кілька кроків за кадр залежно від timeScale
    const steps = Math.max(1, Math.floor(this.timeScale * this.dt));
    const subDt = this.dt;

    for (let i = 0; i < steps; i++) {
      this.strategy.step(this.state, subDt);
    }
    this.notify();
  }

  notify() {
    this.notifyAll({ star: this.state.star, planets: this.state.planets, time: this.state.time });
  }

  snapshot(): EngineSnapshot {
    if (!this.systemConfig) throw new Error("No system configured");
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
    this.setSystem(s.system);
    this.setDt(s.dt);
    this.setTimeScale(s.timeScale);

    // стратегію виставляє UI, але тут теж підтримаємо
    // (щоб відновлення працювало)
    // імпорт циклічний не робимо — UI і так смикає setStrategy.
    this.state.time = s.time;
    this.state.planets.forEach((p, i) => {
      p.position = { ...s.planetsState[i].position };
      p.velocity = { ...s.planetsState[i].velocity };
    });

    this.notify();
  }
}
