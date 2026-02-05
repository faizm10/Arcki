const DB_NAME = "arcki-world";
const DB_VERSION = 1;
const GLB_STORE = "glb-files";
const STATE_KEY = "arcki_world_state";

export interface SavedModel {
  id: string;
  name?: string;
  position: [number, number];
  height: number;
  heightLocked: boolean;
  scale: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  isFavorited?: boolean;
  generatedFrom?: string;
  supabaseModelId?: string;
  supabaseGlbUrl?: string;
  hasLocalGlb: boolean;
}

export interface SavedWorldState {
  insertedModels: SavedModel[];
  deletedFeatures: GeoJSON.Feature[];
  lightMode: "day" | "night";
  weather: "clear" | "rain" | "snow";
  camera: {
    center: [number, number];
    zoom: number;
    pitch: number;
    bearing: number;
  };
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(GLB_STORE)) {
        db.createObjectStore(GLB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeGlbData(modelId: string, blobUrl: string): Promise<void> {
  try {
    const response = await fetch(blobUrl);
    const buffer = await response.arrayBuffer();
    const db = await openDB();
    const tx = db.transaction(GLB_STORE, "readwrite");
    tx.objectStore(GLB_STORE).put(buffer, modelId);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (e) {
    console.error("Failed to store GLB data:", e);
  }
}

async function loadGlbData(modelId: string): Promise<string | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(GLB_STORE, "readonly");
    const request = tx.objectStore(GLB_STORE).get(modelId);
    const buffer = await new Promise<ArrayBuffer | undefined>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    if (!buffer) return null;
    const blob = new Blob([buffer], { type: "model/gltf-binary" });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error("Failed to load GLB data:", e);
    return null;
  }
}

async function removeGlbData(modelId: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(GLB_STORE, "readwrite");
    tx.objectStore(GLB_STORE).delete(modelId);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (e) {
    console.error("Failed to remove GLB data:", e);
  }
}

export async function saveWorldState(state: SavedWorldState): Promise<void> {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save world state:", e);
  }
}

export async function loadWorldState(): Promise<{
  state: SavedWorldState;
  blobUrls: Map<string, string>;
} | null> {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return null;

    const state: SavedWorldState = JSON.parse(raw);
    const blobUrls = new Map<string, string>();

    // Restore blob URLs from IndexedDB for models without a persistent URL
    await Promise.all(
      state.insertedModels
        .filter((m) => m.hasLocalGlb && !m.supabaseGlbUrl)
        .map(async (m) => {
          const url = await loadGlbData(m.id);
          if (url) blobUrls.set(m.id, url);
        })
    );

    return { state, blobUrls };
  } catch (e) {
    console.error("Failed to load world state:", e);
    return null;
  }
}

export async function clearWorldState(): Promise<void> {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      const state: SavedWorldState = JSON.parse(raw);
      // Clean up IndexedDB entries
      await Promise.all(
        state.insertedModels
          .filter((m) => m.hasLocalGlb)
          .map((m) => removeGlbData(m.id))
      );
    }
    localStorage.removeItem(STATE_KEY);
  } catch (e) {
    console.error("Failed to clear world state:", e);
  }
}
