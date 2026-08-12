const configKey = "hk-expo-supabase-config";
const tableName = "app_state";
const rowId = "main";

export function getShareConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || "";
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey, source: "env" };
  }

  try {
    const saved = JSON.parse(localStorage.getItem(configKey) || "{}");
    return {
      url: saved.url || "",
      anonKey: saved.anonKey || "",
      source: saved.url && saved.anonKey ? "local" : "none"
    };
  } catch {
    return { url: "", anonKey: "", source: "none" };
  }
}

export function saveShareConfig(config) {
  localStorage.setItem(configKey, JSON.stringify({
    url: config.url.trim(),
    anonKey: config.anonKey.trim()
  }));
}

function buildHeaders(config, extra = {}) {
  return {
    apikey: config.anonKey,
    Authorization: `Bearer ${config.anonKey}`,
    "Content-Type": "application/json",
    ...extra
  };
}

function normalizeUrl(url) {
  return url.replace(/\/$/, "");
}

export async function loadRemoteState(config) {
  if (!config.url || !config.anonKey) return null;

  const endpoint = `${normalizeUrl(config.url)}/rest/v1/${tableName}?id=eq.${rowId}&select=data&limit=1`;
  const response = await fetch(endpoint, {
    headers: buildHeaders(config)
  });

  if (!response.ok) {
    throw new Error(`Load failed: ${response.status}`);
  }

  const rows = await response.json();
  return rows?.[0]?.data || null;
}

export async function saveRemoteState(config, data) {
  if (!config.url || !config.anonKey) return false;

  const endpoint = `${normalizeUrl(config.url)}/rest/v1/${tableName}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: buildHeaders(config, {
      Prefer: "resolution=merge-duplicates"
    }),
    body: JSON.stringify({
      id: rowId,
      data,
      updated_at: new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error(`Save failed: ${response.status}`);
  }

  return true;
}
