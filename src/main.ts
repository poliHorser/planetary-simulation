import "./UI/styles.css"; // CSS
import { buildUI } from "./UI/ui";
import { SimulationEngine } from "./Core/SimulationEngine";
import { createDefaultSystem } from "./Core/Models";
import { ThreeRenderer } from "./Infra/ThreeRenderer";
import { Storage } from "./Data/Storage";
import { CircularOrbitStrategy, NewtonEulerStrategy } from "./Core/Strategies";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const panel = document.getElementById("panel") as HTMLElement;

const engine = new SimulationEngine();
const renderer = new ThreeRenderer(canvas);

engine.subscribe(renderer); // Observer: engine -> renderer

// default system
engine.setSystem(createDefaultSystem());
engine.setStrategy(new CircularOrbitStrategy());

// UI wiring
const storage = new Storage("ods_state_v1");

buildUI(panel, {
  onStart: () => engine.start(),
  onPause: () => engine.pause(),
  onStep: () => engine.step(),
  onReset: () => {
    engine.pause();
    engine.setSystem(createDefaultSystem());
    engine.notify();
  },
  onSetTimeScale: (v) => engine.setTimeScale(v),
  onSetDt: (v) => engine.setDt(v),
  onSetStrategy: (name) => {
    engine.setStrategy(name === "circular" ? new CircularOrbitStrategy() : new NewtonEulerStrategy());
  },
  onApplyParams: (params) => {
    engine.pause();
    engine.setSystem(params);
    engine.notify();
  },
  onSave: () => storage.save(engine.snapshot()),
  onLoad: () => {
    const snap = storage.load();
    if (snap) {
      engine.loadSnapshot(snap);
    }
  }
});

// Animation loop
function tick() {
  engine.tick();
  renderer.render();
  requestAnimationFrame(tick);
}
tick();
