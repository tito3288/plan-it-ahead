import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  type LucideIcon
} from "lucide-react";

export type WeatherCodeMeta = {
  icon: LucideIcon;
  label: string;
};

export function getWeatherCodeMeta(code: number | null): WeatherCodeMeta {
  if (code === 0) {
    return { icon: Sun, label: "Clear" };
  }

  if (code === 1 || code === 2) {
    return { icon: CloudSun, label: "Partly cloudy" };
  }

  if (code === 3) {
    return { icon: Cloud, label: "Cloudy" };
  }

  if (code === 45 || code === 48) {
    return { icon: CloudFog, label: "Fog" };
  }

  if (
    code === 51 ||
    code === 53 ||
    code === 55 ||
    code === 61 ||
    code === 63 ||
    code === 65 ||
    code === 80 ||
    code === 81 ||
    code === 82
  ) {
    return { icon: CloudRain, label: "Rain" };
  }

  if (code === 71 || code === 73 || code === 75) {
    return { icon: CloudSnow, label: "Snow" };
  }

  if (code === 95) {
    return { icon: CloudLightning, label: "Storms" };
  }

  return { icon: CloudSun, label: "Weather" };
}
