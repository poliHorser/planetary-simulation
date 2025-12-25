// import type { EngineSnapshot } from "../Core/SimulationEngine";

// export class Storage {
//   constructor(private key: string) {}

//   save(snapshot: EngineSnapshot) {
//     localStorage.setItem(this.key, JSON.stringify(snapshot));
//     alert("Стан симуляції збережено.");
//   }

//   load(): EngineSnapshot | null {
//     const raw = localStorage.getItem(this.key);
//     if (!raw) {
//       alert("Немає збереженого стану.");
//       return null;
//     }
//     try {
//       return JSON.parse(raw) as EngineSnapshot;
//     } catch {
//       alert("Збережений стан пошкоджено.");
//       return null;
//     }
//   }
// }
import type { EngineSnapshot } from "../Core/SimulationEngine";
import { Logger } from "../Logger";

export class Storage {
  constructor(private key: string) {}

  save(snapshot: EngineSnapshot) {
    try {
      localStorage.setItem(this.key, JSON.stringify(snapshot));
      Logger.info("Simulation state saved");
    } catch (e) {
      Logger.error("Failed to save simulation state", { error: e });
    }
  }

  load(): EngineSnapshot | null {
    const raw = localStorage.getItem(this.key);
    if (!raw) {
      Logger.warn("No saved simulation state found");
      return null;
    }
    try {
      Logger.info("Simulation state loaded");
      return JSON.parse(raw) as EngineSnapshot;
    } catch (e) {
      Logger.error("Saved simulation state corrupted", { error: e });
      return null;
    }
  }
}
