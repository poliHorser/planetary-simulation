import * as THREE from "three";
import type { Observer } from "../Core/Observer";
import type { RenderPayload } from "../Core/SimulationEngine";
import { SCENE_SCALE } from "../Core/constants";

export class ThreeRenderer implements Observer<RenderPayload> {
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  private starMesh: THREE.Mesh;
  private planetMeshes = new Map<string, THREE.Mesh>();
  private orbitLines = new Map<string, THREE.Line>();

  private lastPayload: RenderPayload | null = null;

  constructor(private canvas: HTMLCanvasElement) {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(w, h, false);

    this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    this.camera.position.set(0, 12, 14);
    this.camera.lookAt(0, 0, 0);

    const light = new THREE.PointLight(0xffffff, 2);
    light.position.set(0, 10, 0);
    this.scene.add(light);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    // star
    this.starMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 32, 16),
      new THREE.MeshStandardMaterial({ color: 0xffd54f })
    );
    this.scene.add(this.starMesh);

    window.addEventListener("resize", () => this.onResize());
  }

  update(payload: RenderPayload): void {
    this.lastPayload = payload;
    this.syncScene(payload);
  }

  render(): void {
    this.onResize(false);
    this.renderer.render(this.scene, this.camera);
  }

  private syncScene(payload: RenderPayload) {
    // Planets
    for (const p of payload.planets) {
      if (!this.planetMeshes.has(p.name)) {
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 16, 12),
          new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color) })
        );
        this.planetMeshes.set(p.name, mesh);
        this.scene.add(mesh);

        // orbit line
        const orbit = this.makeOrbitLine(p.orbitRadius * SCENE_SCALE);
        this.orbitLines.set(p.name, orbit);
        this.scene.add(orbit);
      }

      const m = this.planetMeshes.get(p.name)!;
      m.position.set(p.position.x * SCENE_SCALE, 0, p.position.y * SCENE_SCALE);
    }
  }

  private makeOrbitLine(radius: number): THREE.Line {
    const pts: THREE.Vector3[] = [];
    const steps = 128;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: 0x999999 });
    return new THREE.Line(geo, mat);
  }

  private onResize(force = true) {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    const need = force || this.renderer.domElement.width !== w || this.renderer.domElement.height !== h;
    if (!need) return;

    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
}
