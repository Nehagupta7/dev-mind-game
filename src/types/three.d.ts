declare module 'three' {
  export class BufferGeometry {
    dispose(): void
  }

  export class Material {
    dispose(): void
  }

  export class MeshBasicMaterial extends Material {
    constructor(parameters?: Record<string, unknown>)
  }

  export class Object3D {
    geometry?: BufferGeometry
    material?: Material | Material[]
    position: { set(x: number, y: number, z: number): void }
    rotation: { x: number; y: number; z: number }
  }

  export class Mesh extends Object3D {
    constructor(geometry: BufferGeometry, material: Material)
  }

  export class Scene {
    children: Object3D[]
    add(object: Object3D): void
    remove(object: Object3D): void
  }

  export class PerspectiveCamera {
    aspect: number
    position: { z: number }
    constructor(fov: number, aspect: number, near: number, far: number)
    updateProjectionMatrix(): void
  }

  export class WebGLRenderer {
    domElement: HTMLCanvasElement
    constructor(parameters?: Record<string, unknown>)
    setSize(width: number, height: number): void
    setPixelRatio(ratio: number): void
    render(scene: Scene, camera: PerspectiveCamera): void
    dispose(): void
  }

  export class IcosahedronGeometry extends BufferGeometry {
    constructor(radius: number, detail: number)
  }

  export class OctahedronGeometry extends BufferGeometry {
    constructor(radius: number, detail: number)
  }

  export class TorusGeometry extends BufferGeometry {
    constructor(radius: number, tube: number, radialSegments: number, tubularSegments: number)
  }

  export class SphereGeometry extends BufferGeometry {
    constructor(radius: number, widthSegments: number, heightSegments: number)
  }
}
