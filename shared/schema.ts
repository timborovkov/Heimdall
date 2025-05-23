import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const cameras = pgTable("cameras", {
  id: serial("id").primaryKey(),
  cameraId: text("camera_id").notNull().unique(),
  latitude: integer("latitude").notNull(), // stored as * 1000000 for precision
  longitude: integer("longitude").notNull(), // stored as * 1000000 for precision
  altitude: integer("altitude").notNull(), // height in meters above sea level
  range: integer("range").notNull(), // in meters
  fov: integer("fov").notNull(), // field of view in degrees
  yaw: integer("yaw").notNull(), // horizontal rotation (0-360 degrees)
  pitch: integer("pitch").notNull(), // vertical tilt (-90 to +90 degrees)
  roll: integer("roll").notNull(), // rotation around forward axis (-180 to +180 degrees)
  status: text("status").notNull().default("active"), // active, maintenance, offline
  cameraType: text("camera_type").notNull().default("Standard Surveillance"),
  feedUrl: text("feed_url"), // live camera feed URL
  feedUsername: text("feed_username"), // authentication username for feed
  feedPassword: text("feed_password"), // authentication password for feed
  lastDetection: timestamp("last_detection"),
});

export const droneAlerts = pgTable("drone_alerts", {
  id: serial("id").primaryKey(),
  detectedAt: timestamp("detected_at").notNull().defaultNow(),
  cameraId: text("camera_id").notNull(),
  latitude: integer("latitude").notNull(), // drone position * 1000000
  longitude: integer("longitude").notNull(), // drone position * 1000000
  altitude: integer("altitude").notNull(), // drone altitude in meters
  confidence: integer("confidence").notNull(), // probability 0-100%
  speed: integer("speed").notNull(), // km/h
  heading: integer("heading").notNull(), // direction 0-360 degrees
  droneType: text("drone_type").notNull(), // "Unknown", "Commercial", "Military", "Racing"
  threatLevel: text("threat_level").notNull(), // "Low", "Medium", "High", "Critical"
  status: text("status").notNull().default("active"), // "active", "tracking", "lost", "neutralized"
  estimatedTrajectory: text("estimated_trajectory"), // JSON array of predicted positions
  notes: text("notes"),
});

export const insertCameraSchema = createInsertSchema(cameras).omit({
  id: true,
  lastDetection: true,
}).extend({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  altitude: z.number().min(0).max(10000), // 0 to 10km altitude
  range: z.number().min(100).max(2000),
  fov: z.number().min(30).max(180),
  yaw: z.number().min(0).max(360),
  pitch: z.number().min(-90).max(90),
  roll: z.number().min(-180).max(180),
  status: z.enum(["active", "maintenance", "offline"]).default("active"),
  cameraType: z.enum(["Standard Surveillance", "Thermal Imaging", "Night Vision", "High Resolution"]).default("Standard Surveillance"),
  feedUrl: z.string().url().optional(),
  feedUsername: z.string().optional(),
  feedPassword: z.string().optional(),
});

export const updateCameraSchema = insertCameraSchema.partial();

export const insertDroneAlertSchema = createInsertSchema(droneAlerts).omit({
  id: true,
  detectedAt: true,
});

export const updateDroneAlertSchema = insertDroneAlertSchema.partial();

export type InsertCamera = z.infer<typeof insertCameraSchema>;
export type UpdateCamera = z.infer<typeof updateCameraSchema>;
export type Camera = typeof cameras.$inferSelect;
export type DroneAlert = typeof droneAlerts.$inferSelect;
export type InsertDroneAlert = z.infer<typeof insertDroneAlertSchema>;
export type UpdateDroneAlert = z.infer<typeof updateDroneAlertSchema>;
