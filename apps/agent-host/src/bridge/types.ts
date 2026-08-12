/**
 * Type-only re-export of the deck's AgentBridge contract, so the shared
 * session-core files can reference it without a runtime import. `export type`
 * is erased at transpile time — the mirrored host copy never resolves the
 * target at runtime.
 */
export type * from "../../../server/src/bridge/types.ts";
