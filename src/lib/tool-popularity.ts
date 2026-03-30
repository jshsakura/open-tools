export const TOOL_POPULARITY_STORAGE_KEY = "open-tools-popularity";
export const TOOL_POPULARITY_UPDATED_EVENT = "open-tools-popularity-updated";
export const POPULAR_TOOL_THRESHOLD = 3;

export type ToolPopularityMap = Record<string, number>;

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

export function isPopularTool(toolId: string, popularityMap?: ToolPopularityMap) {
  return getToolPopularity(toolId, popularityMap) >= POPULAR_TOOL_THRESHOLD;
}
