import test from "node:test";
import assert from "node:assert/strict";
import useMiningAnalysisStore from "../src/store/miningAnalysisStore.js";

const store = useMiningAnalysisStore;
globalThis.localStorage = { getItem: () => "session-token" };
const response = (body) => ({ ok: true, json: async () => body });

test("cached analysis is reused without another request or session", async () => {
  const data = { hotspot_status: "available", job: { status: "idle" } };
  let calls = 0;
  globalThis.fetch = async () => { calls++; return response(data); };
  store.setState({ data: null, error: null });
  await store.getState().load();
  await store.getState().load();
  assert.equal(calls, 1);
  assert.equal(store.getState().data, data);
});

test("missing results start job using session and poll without it", async () => {
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(url);
    return response(calls.length === 1 ? { hotspot_status: "not_computed", job: {status: "idle"} } : { hotspot_status: "not_computed", job: {status: "failed", error: "test failure"} });
  };
  store.setState({ data: null, error: null });
  await store.getState().load();
  assert.equal(calls.length, 2);
  assert.ok(!calls[0].includes("session_id"));
  assert.ok(calls[1].includes("session_id=session-token"));
  assert.equal(store.getState().error, "test failure");
});
