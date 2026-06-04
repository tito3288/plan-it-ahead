const fahrenheitPattern = /(-?\d+(?:\.\d+)?)°F\b/g;

function fahrenheitToCelsius(fahrenheit: number) {
  return Math.round(((fahrenheit - 32) * 5) / 9);
}

export function formatWeatherSummary(summary: string | null) {
  if (!summary) {
    return null;
  }

  return summary.replace(fahrenheitPattern, (_, value: string) => {
    return `${fahrenheitToCelsius(Number(value))}°C`;
  });
}
