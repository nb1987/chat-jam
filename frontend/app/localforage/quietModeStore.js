import { settingsStore } from "@frontend/localforage/localforageConfig";

const MODE_KEY = "quietMode";
export const DEFAULT_QUIET_MODE = "alert";

export async function saveMode(mode) {
  return settingsStore.setItem(MODE_KEY, mode);
}

export async function loadMode() {
  const stored = await settingsStore.getItem(MODE_KEY);
  return stored || DEFAULT_QUIET_MODE;
}

export function clearMode() {
  return settingsStore.removeItem(MODE_KEY);
}

export async function neverAsk() {
  await settingsStore.setItem("push_never_ask", true);
}

export async function denyNotification() {
  await settingsStore.setItem("push_deny", false); // 사용자가 알림 원치 않음
}

export async function getPushNeverAskStatus() {
  const status = await settingsStore.getItem("push_never_ask");
  return status;
}

export async function getPushDenyStatus() {
  const status = await settingsStore.getItem("push_deny"); // true/false/null
  return status;
}
