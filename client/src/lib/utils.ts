import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCoordinate(value: number, type: 'lat' | 'lon'): string {
  const abs = Math.abs(value);
  const direction = type === 'lat' 
    ? (value >= 0 ? 'N' : 'S')
    : (value >= 0 ? 'E' : 'W');
  
  return `${abs.toFixed(4)}°${direction}`;
}

export function formatAltitude(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${meters.toFixed(0)}m`;
}

export function formatTimeAgo(hoursAgo: number): string {
  if (hoursAgo === 0) return 'Current';
  if (hoursAgo === 1) return '1 hour ago';
  return `${hoursAgo} hours ago`;
}

export function getBalloonMarkerColor(hoursAgo: number): string {
  if (hoursAgo === 0) return '#EF4444'; // red
  if (hoursAgo <= 6) return '#F59E0B'; // orange
  return '#3B82F6'; // blue
}

export function getBalloonMarkerSize(hoursAgo: number): number {
  if (hoursAgo === 0) return 12;
  if (hoursAgo <= 6) return 10;
  return 8;
}
