import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const cameras = pgTable("cameras", {
  id: serial("id").primaryKey(),
  cameraId: text("camera_id").notNull().unique(),
  latitude: integer("latitude").notNull(), // stored as * 1000000 for precision
  longitude: integer("longitude").notNull(), // stored as * 1000000 for precision
  range: integer("range").notNull(), // in meters
  fov: integer("fov").notNull(), // field of view in degrees
  direction: integer("direction").notNull(), // direction in degrees (0-360)
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
  range: z.number().min(100).max(2000),
  fov: z.number().min(30).max(180),
  direction: z.number().min(0).max(360),
  status: z.enum(["active", "maintenance", "offline"]).default("active"),
  cameraType: z.enum(["Standard Surveillance", "Thermal Imaging", "Night Vision", "High Resolution"]).default("Standard Surveillance"),
});

export const updateCameraSchema = insertCameraSchema.partial();

export type InsertCamera = z.infer<typeof insertCameraSchema>;
export type UpdateCamera = z.infer<typeof updateCameraSchema>;
export type Camera = typeof cameras.$inferSelect;
