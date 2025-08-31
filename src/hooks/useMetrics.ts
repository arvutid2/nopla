// Mock metrics hook
export function useMetrics() {
  return {
    metrics: {
      playersOnline: 128,   // pane siia dünaamilised väärtused hiljem
      duelsToday: 342,
      tickrate: 60,
    },
  };
}