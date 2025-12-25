import type { PlanetarySystem } from "../Core/Models";

type Handlers = {
  onStart: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onSave: () => void;
  onLoad: () => void;
  onSetTimeScale: (v: number) => void;
  onSetDt: (v: number) => void;
  onSetStrategy: (name: "circular" | "newton") => void;
  onApplyParams: (sys: PlanetarySystem) => void;
};

export function buildUI(root: HTMLElement, h: Handlers) {
  root.innerHTML = `
    <h2>Orbital Dynamics Simulator</h2>
    <div class="small">Параметри + керування симуляцією (UI → Core)</div>
    <hr/>

    <div class="field">
      <label>Алгоритм (Strategy)</label>
      <select id="strategy">
        <option value="circular">Circular (спрощено)</option>
        <option value="newton">Newton + Euler (наближено)</option>
      </select>
    </div>

    <div class="row">
      <button id="start">Start</button>
      <button id="pause">Pause</button>
      <button id="step">Step</button>
      <button id="reset">Reset</button>
    </div>

    <hr/>

    <div class="field">
      <label>dt (крок часу, умовні одиниці)</label>
      <input id="dt" type="number" value="0.016" step="0.001" min="0.001" />
    </div>

    <div class="field">
      <label>Time scale (прискорення)</label>
      <input id="ts" type="number" value="60" step="1" min="1" />
    </div>

    <hr/>

    <div class="field">
      <label>Маса зірки (M*)</label>
      <input id="starMass" type="number" value="1.0" step="0.1" min="0.1" />
    </div>

    <div class="field">
      <label>Планети (JSON)</label>
      <textarea id="planets" rows="10"></textarea>
      <div class="small">Формат: [{"name":"Earth","mass":0.003,"radius":3.0,"color":"#4e79a7"}, ...]</div>
    </div>

    <div class="row">
      <button id="apply">Apply params</button>
      <button id="save">Save</button>
      <button id="load">Load</button>
    </div>
  `;

  const planetsText = root.querySelector<HTMLTextAreaElement>("#planets")!;
  planetsText.value = JSON.stringify(
    [
      { name: "Mercury", mass: 0.00016, radius: 1.6, color: "#9e9e9e" },
      { name: "Earth", mass: 0.003, radius: 3.0, color: "#4e79a7" },
      { name: "Mars", mass: 0.00032, radius: 4.3, color: "#e15759" }
    ],
    null,
    2
  );

  root.querySelector<HTMLButtonElement>("#start")!.onclick = h.onStart;
  root.querySelector<HTMLButtonElement>("#pause")!.onclick = h.onPause;
  root.querySelector<HTMLButtonElement>("#step")!.onclick = h.onStep;
  root.querySelector<HTMLButtonElement>("#reset")!.onclick = h.onReset;
  root.querySelector<HTMLButtonElement>("#save")!.onclick = h.onSave;
  root.querySelector<HTMLButtonElement>("#load")!.onclick = h.onLoad;

  root.querySelector<HTMLSelectElement>("#strategy")!.onchange = (e) => {
    const v = (e.target as HTMLSelectElement).value as "circular" | "newton";
    h.onSetStrategy(v);
  };

  root.querySelector<HTMLInputElement>("#dt")!.oninput = (e) => h.onSetDt(Number((e.target as HTMLInputElement).value));
  root.querySelector<HTMLInputElement>("#ts")!.oninput = (e) => h.onSetTimeScale(Number((e.target as HTMLInputElement).value));

  root.querySelector<HTMLButtonElement>("#apply")!.onclick = () => {
    const starMass = Number(root.querySelector<HTMLInputElement>("#starMass")!.value);
    let planets: any;
    try {
      planets = JSON.parse(planetsText.value);
    } catch {
      alert("Некоректний JSON у полі Планети.");
      return;
    }

    const sys: PlanetarySystem = {
      star: { mass: starMass },
      planets: planets.map((p: any) => ({
        name: String(p.name ?? "Planet"),
        mass: Number(p.mass ?? 0.001),
        orbitRadius: Number(p.radius ?? 3),
        color: String(p.color ?? "#888888")
      }))
    };

    h.onApplyParams(sys);
  };
}
