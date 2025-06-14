import { z } from "zod";

// Balloon data schema
export const balloonDataSchema = z.object({
  id: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  altitude: z.number(),
  timestamp: z.string(),
  hoursAgo: z.number(),
  dataSource: z.string(), // which JSON file (00.json, 01.json, etc.)
});

export const consolidatedBalloonDataSchema = z.object({
  balloons: z.array(balloonDataSchema),
  totalCount: z.number(),
  dataQuality: z.record(z.string(), z.enum(['healthy', 'good', 'partial', 'error'])),
  lastUpdated: z.string(),
});

// Weather data schema
export const weatherDataSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  temperature: z.number(),
  windSpeed: z.number(),
  windDirection: z.number(),
  timestamp: z.string(),
});

export const weatherResponseSchema = z.object({
  current: z.object({
    temperature_2m: z.number(),
    wind_speed_10m: z.number(),
    wind_direction_10m: z.number(),
  }),
});

// Data quality status
export const dataQualitySchema = z.object({
  file: z.string(),
  status: z.enum(['healthy', 'good', 'partial', 'error']),
  recordCount: z.number().optional(),
  error: z.string().optional(),
});

export type BalloonData = z.infer<typeof balloonDataSchema>;
export type ConsolidatedBalloonData = z.infer<typeof consolidatedBalloonDataSchema>;
export type WeatherData = z.infer<typeof weatherDataSchema>;
export type WeatherResponse = z.infer<typeof weatherResponseSchema>;
export type DataQuality = z.infer<typeof dataQualitySchema>;
