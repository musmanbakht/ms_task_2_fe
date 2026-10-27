import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import useEarthEngineStore from "../src/store/earthEngineStore.js";
import { validateClassificationDate } from "../src/API/earthEngine.js";

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
  useEarthEngineStore.getState().clearAllLayers();
});

test("simple imagery keeps its existing endpoint and payload", async () => {
  const params = { product: "modis", province: "Gauteng", input_date: "2009-12-31", palette: null, geometry: null };
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "http://localhost:8000/earthengine/get-map?session_id=session");
    assert.deepEqual(JSON.parse(options.body), params);
    return Response.json({ tileUrl: "imagery", imageDate: "2009-12-31" });
  };
  const result = await useEarthEngineStore.getState().fetchAndAddLayer(params, "session");
  assert.equal(result.success, true);
  assert.equal(useEarthEngineStore.getState().getLayer(result.layerId).product, "modis");
});

test("real dates pass validation without year restrictions", () => {
  for (const date of ["", "2023-02-29", "2015-13-01", "invalid"]) {
    assert.ok(validateClassificationDate(date));
  }
  for (const date of ["2010-07-15", "2015-07-15", "2020-02-29", "2023-07-15", "2026-10-27"]) assert.equal(validateClassificationDate(date), null);
});

test("classification preserves response metadata and shares layer controls with imagery", async () => {
  const store = useEarthEngineStore.getState;
  const imageryId = store().addLayer({ product: "modis", tileUrl: "imagery" });
  const data = { tileUrl: "tiles", requestedDate: "2023-07-15", scope: "all_mines",
    classes: [{ value: 0, name: "Water", color: "#0064C8" }], classifier: { year: 2023 },
    imagery: { cloudCoverThreshold: 60 }, mines: [{ mineId: "test", sceneCount: 4 }],
    boundingBox: [20, -30, 21, -29], futureMetadata: { preserved: true } };
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "http://localhost:8000/earthengine/classification/map?session_id=session%2Btest");
    assert.equal(options.method, "POST");
    assert.deepEqual(JSON.parse(options.body), { date: "2023-07-15", mine_id: null });
    return Response.json(data);
  };
  const result = await store().fetchAndAddClassification({ date: "2023-07-15", mineId: "  " }, "session+test");
  assert.equal(result.success, true);
  assert.equal(store().eeLayers.length, 2);
  assert.deepEqual(store().getLayer(result.layerId).futureMetadata, data.futureMetadata);
  assert.deepEqual(store().getLayer(result.layerId).classes, data.classes);
  store().toggleLayerVisibility(result.layerId);
  assert.deepEqual(store().getVisibleLayers().map(layer => layer.id), [imageryId]);
  store().reorderLayers(1, 0);
  assert.equal(store().eeLayers[0].id, result.layerId);
  store().removeLayer(result.layerId);
  assert.equal(store().eeLayers.length, 1);
});

test("single-mine ID is trimmed and sent", async () => {
  globalThis.fetch = async (_, options) => {
    assert.deepEqual(JSON.parse(options.body), { date: "2015-01-01", mine_id: "mine-test" });
    return Response.json({ tileUrl: "tiles" });
  };
  assert.equal((await useEarthEngineStore.getState().fetchAndAddClassification({ date: "2015-01-01", mineId: " mine-test " }, "session")).success, true);
});

test("missing sessions and invalid dates never send requests", async () => {
  globalThis.fetch = () => assert.fail("Unexpected network request");
  for (const [date, session] of [["2020-02-30", "session"], ["2023-01-01", null]]) {
    assert.equal((await useEarthEngineStore.getState().fetchAndAddClassification({ date }, session)).success, false);
  }
});

test("HTTP failures surface FastAPI details and clear loading without adding layers", async () => {
  for (const status of [400, 401, 404, 422, 500, 502]) {
    globalThis.fetch = async () => Response.json({ detail: [{ msg: "Backend explanation" }] }, { status });
    const result = await useEarthEngineStore.getState().fetchAndAddClassification({ date: "2023-01-01" }, "session");
    assert.equal(result.status, status);
    assert.match(result.error, /Backend explanation/);
    assert.equal(useEarthEngineStore.getState().loading, false);
    assert.equal(useEarthEngineStore.getState().eeLayers.length, 0);
  }
});

test("non-JSON errors and malformed successes produce useful errors", async () => {
  for (const response of [new Response("Bad gateway", { status: 502 }), Response.json({})]) {
    globalThis.fetch = async () => response;
    const result = await useEarthEngineStore.getState().fetchAndAddClassification({ date: "2023-01-01" }, "session");
    assert.equal(result.success, false);
    assert.ok(result.error);
  }
});
