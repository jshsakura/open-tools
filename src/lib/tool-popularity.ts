export const TOOL_POPULARITY_STORAGE_KEY = "open-tools-popularity";
export const TOOL_POPULARITY_UPDATED_EVENT = "open-tools-popularity-updated";
export const POPULAR_TOOL_THRESHOLD = 3;
export const HOME_RETURN_STATE_STORAGE_KEY = "open-tools-home-return-state";
export const PENDING_TOOL_POPULARITY_STORAGE_KEY = "open-tools-pending-popularity";

export type ToolPopularityMap = Record<string, number>;
export interface HomeReturnState {
  pathname: string;
  scrollY: number;
  selectedTag: string | null;
  searchQuery: string;
  toolId: string;
}

function isBrowser() {
  return typeof window !== "undefined";
}

export function readToolPopularityMap(): ToolPopularityMap {
  if (!isBrowser()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(TOOL_POPULARITY_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([key, value]) => key.length > 0 && typeof value === "number" && value > 0,
      ),
    );
  } catch {
    return {};
  }
}

export function getToolPopularity(toolId: string, popularityMap?: ToolPopularityMap) {
  const source = popularityMap ?? readToolPopularityMap();
  return source[toolId] ?? 0;
}

export function incrementToolPopularity(toolId: string) {
  if (!isBrowser()) {
    return;
  }

  try {
    const popularityMap = readToolPopularityMap();
    const nextPopularity = (popularityMap[toolId] ?? 0) + 1;
    const nextMap = {
      ...popularityMap,
      [toolId]: nextPopularity,
    };

    window.localStorage.setItem(
      TOOL_POPULARITY_STORAGE_KEY,
      JSON.stringify(nextMap),
    );
    window.dispatchEvent(
      new CustomEvent(TOOL_POPULARITY_UPDATED_EVENT, {
        detail: {
          toolId,
          count: nextPopularity,
        },
      }),
    );
  } catch {
    return;
  }
}

export function readPendingToolPopularityMap(): ToolPopularityMap {
  if (!isBrowser()) {
    return {};
  }

  try {
    const raw = window.sessionStorage.getItem(PENDING_TOOL_POPULARITY_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([key, value]) => key.length > 0 && typeof value === "number" && value > 0,
      ),
    );
  } catch {
    return {};
  }
}

export function queueToolPopularityIncrement(toolId: string) {
  if (!isBrowser()) {
    return;
  }

  try {
    const pendingMap = readPendingToolPopularityMap();
    const nextMap = {
      ...pendingMap,
      [toolId]: (pendingMap[toolId] ?? 0) + 1,
    };

    window.sessionStorage.setItem(
      PENDING_TOOL_POPULARITY_STORAGE_KEY,
      JSON.stringify(nextMap),
    );
  } catch {
    return;
  }
}

export function flushQueuedToolPopularity() {
  if (!isBrowser()) {
    return false;
  }

  try {
    const pendingMap = readPendingToolPopularityMap();
    const pendingEntries = Object.entries(pendingMap);
    if (pendingEntries.length === 0) {
      return false;
    }

    const popularityMap = readToolPopularityMap();
    const nextMap = { ...popularityMap };

    for (const [toolId, count] of pendingEntries) {
      nextMap[toolId] = (nextMap[toolId] ?? 0) + count;
    }

    window.localStorage.setItem(
      TOOL_POPULARITY_STORAGE_KEY,
      JSON.stringify(nextMap),
    );
    window.sessionStorage.removeItem(PENDING_TOOL_POPULARITY_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(TOOL_POPULARITY_UPDATED_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function isPopularTool(toolId: string, popularityMap?: ToolPopularityMap) {
  return getToolPopularity(toolId, popularityMap) >= POPULAR_TOOL_THRESHOLD;
}

export function readHomeReturnState(): HomeReturnState | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(HOME_RETURN_STATE_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const {
      pathname,
      scrollY,
      selectedTag,
      searchQuery,
      toolId,
    } = parsed as Partial<HomeReturnState>;

    if (
      typeof pathname !== "string" ||
      typeof scrollY !== "number" ||
      (selectedTag !== null && typeof selectedTag !== "string") ||
      typeof searchQuery !== "string" ||
      typeof toolId !== "string"
    ) {
      return null;
    }

    return {
      pathname,
      scrollY,
      selectedTag,
      searchQuery,
      toolId,
    };
  } catch {
    return null;
  }
}

export function writeHomeReturnState(state: HomeReturnState) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      HOME_RETURN_STATE_STORAGE_KEY,
      JSON.stringify(state),
    );
  } catch {
    return;
  }
}

export function clearHomeReturnState() {
  if (!isBrowser()) {
    return;
  }

  try {
    window.sessionStorage.removeItem(HOME_RETURN_STATE_STORAGE_KEY);
  } catch {
    return;
  }
}
