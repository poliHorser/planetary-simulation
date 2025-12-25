import type { EngineSnapshot } from "../Core/SimulationEngine";

export class Storage {
  constructor(private key: string) {}

  save(snapshot: EngineSnapshot) {
    localStorage.setItem(this.key, JSON.stringify(snapshot));
    alert("Стан симуляції збережено.");
  }

  load(): EngineSnapshot | null {
    const raw = localStorage.getItem(this.key);
    if (!raw) {
      alert("Немає збереженого стану.");
      return null;
    }
    try {
      return JSON.parse(raw) as EngineSnapshot;
    } catch {
      alert("Збережений стан пошкоджено.");
      return null;
    }
  }
}
