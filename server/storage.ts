import { BalloonData, ConsolidatedBalloonData, WeatherData, DataQuality } from "@shared/schema";

export interface IStorage {
  getBalloonData(): Promise<ConsolidatedBalloonData | undefined>;
  setBalloonData(data: ConsolidatedBalloonData): Promise<void>;
  getWeatherData(lat: number, lon: number): Promise<WeatherData | undefined>;
  setWeatherData(lat: number, lon: number, data: WeatherData): Promise<void>;
  clearCache(): Promise<void>;
}

export class MemStorage implements IStorage {
  private balloonData: ConsolidatedBalloonData | undefined;
  private weatherCache: Map<string, WeatherData>;
  private cacheTimestamp: number;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.balloonData = undefined;
    this.weatherCache = new Map();
    this.cacheTimestamp = 0;
  }

  async getBalloonData(): Promise<ConsolidatedBalloonData | undefined> {
    // Check if cache is still valid
    if (this.balloonData && Date.now() - this.cacheTimestamp < this.CACHE_DURATION) {
      return this.balloonData;
    }
    return undefined;
  }

  async setBalloonData(data: ConsolidatedBalloonData): Promise<void> {
    this.balloonData = data;
    this.cacheTimestamp = Date.now();
  }

  async getWeatherData(lat: number, lon: number): Promise<WeatherData | undefined> {
    const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    return this.weatherCache.get(key);
  }

  async setWeatherData(lat: number, lon: number, data: WeatherData): Promise<void> {
    const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    this.weatherCache.set(key, data);
  }

  async clearCache(): Promise<void> {
    this.balloonData = undefined;
    this.weatherCache.clear();
    this.cacheTimestamp = 0;
  }
}

export const storage = new MemStorage();
