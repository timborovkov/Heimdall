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
  lastDetection: timestamp("last_detection"),
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
});

export const updateCameraSchema = insertCameraSchema.partial();

export type InsertCamera = z.infer<typeof insertCameraSchema>;
export type UpdateCamera = z.infer<typeof updateCameraSchema>;
export type Camera = typeof cameras.$inferSelect;
