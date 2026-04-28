import { EventEmitter } from "events";

declare global {
  // eslint-disable-next-line no-var
  var __officeEmitter: EventEmitter | undefined;
}

// Singleton — survives hot-reload in dev
const emitter: EventEmitter =
  globalThis.__officeEmitter ?? (globalThis.__officeEmitter = new EventEmitter());

emitter.setMaxListeners(100);

export { emitter };

export interface OfficeEvent {
  subcard: string;
  type: "CELL_UPDATED" | "WORKFLOW_CREATED" | "WORKFLOW_UPDATED" | "ITEM_ADDED" | "ITEM_DELETED" | "STOCK_MOVED";
  payload: Record<string, unknown>;
  actor?: string;
  ts: number;
}

export function emitOfficeEvent(event: OfficeEvent) {
  emitter.emit("office", event);
}
