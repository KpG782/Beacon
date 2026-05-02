// @upstash/redis defines `class Subscriber extends EventTarget` at module load time.
// The Workflow SDK VM sandbox doesn't inherit Node.js globals, so EventTarget is
// undefined there. This stub must be the first import in workflows/research.ts.
if (typeof (globalThis as Record<string, unknown>).EventTarget === 'undefined') {
  (globalThis as Record<string, unknown>).EventTarget = class EventTarget {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addEventListener(): void {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    removeEventListener(): void {}
    dispatchEvent(): boolean { return true }
  }
}
