import { cameras, type Camera, type InsertCamera, type UpdateCamera } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getCameras(): Promise<Camera[]>;
  getCamera(id: number): Promise<Camera | undefined>;
  getCameraByCameraId(cameraId: string): Promise<Camera | undefined>;
  createCamera(camera: InsertCamera): Promise<Camera>;
  updateCamera(id: number, camera: UpdateCamera): Promise<Camera | undefined>;
  deleteCamera(id: number): Promise<boolean>;
  updateLastDetection(cameraId: string): Promise<void>;
  
  // Drone Alert methods
  getDroneAlerts(): Promise<DroneAlert[]>;
  getDroneAlert(id: number): Promise<DroneAlert | undefined>;
  createDroneAlert(alert: InsertDroneAlert): Promise<DroneAlert>;
  updateDroneAlert(id: number, alert: UpdateDroneAlert): Promise<DroneAlert | undefined>;
  deleteDroneAlert(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getCameras(): Promise<Camera[]> {
    const cameraList = await db.select().from(cameras);
    return cameraList.map(camera => ({
      ...camera,
      latitude: camera.latitude / 1000000,
      longitude: camera.longitude / 1000000,
    }));
  }

  async getCamera(id: number): Promise<Camera | undefined> {
    const [camera] = await db.select().from(cameras).where(eq(cameras.id, id));
    if (!camera) return undefined;
    return {
      ...camera,
      latitude: camera.latitude / 1000000,
      longitude: camera.longitude / 1000000,
    };
  }

  async getCameraByCameraId(cameraId: string): Promise<Camera | undefined> {
    const [camera] = await db.select().from(cameras).where(eq(cameras.cameraId, cameraId));
    if (!camera) return undefined;
    return {
      ...camera,
      latitude: camera.latitude / 1000000,
      longitude: camera.longitude / 1000000,
    };
  }

  async createCamera(insertCamera: InsertCamera): Promise<Camera> {
    const cameraData = {
      ...insertCamera,
      latitude: Math.round(insertCamera.latitude * 1000000),
      longitude: Math.round(insertCamera.longitude * 1000000),
    };
    
    const [camera] = await db
      .insert(cameras)
      .values(cameraData)
      .returning();
    
    return {
      ...camera,
      latitude: camera.latitude / 1000000,
      longitude: camera.longitude / 1000000,
    };
  }

  async updateCamera(id: number, updateCamera: UpdateCamera): Promise<Camera | undefined> {
    const updateData = {
      ...updateCamera,
      ...(updateCamera.latitude && { latitude: Math.round(updateCamera.latitude * 1000000) }),
      ...(updateCamera.longitude && { longitude: Math.round(updateCamera.longitude * 1000000) }),
    };

    const [camera] = await db
      .update(cameras)
      .set(updateData)
      .where(eq(cameras.id, id))
      .returning();
    
    if (!camera) return undefined;
    
    return {
      ...camera,
      latitude: camera.latitude / 1000000,
      longitude: camera.longitude / 1000000,
    };
  }

  async deleteCamera(id: number): Promise<boolean> {
    const result = await db.delete(cameras).where(eq(cameras.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async updateLastDetection(cameraId: string): Promise<void> {
    await db
      .update(cameras)
      .set({ lastDetection: new Date() })
      .where(eq(cameras.cameraId, cameraId));
  }
}

export class MemStorage implements IStorage {
  private cameras: Map<number, Camera>;
  private currentId: number;

  constructor() {
    this.cameras = new Map();
    this.currentId = 1;
    
    // Initialize with some default cameras with live feeds
    this.createCamera({
      cameraId: "CAM-001",
      latitude: 40.7128,
      longitude: -74.0060,
      altitude: 150,
      range: 500,
      fov: 120,
      yaw: 45,
      pitch: -15,
      roll: 0,
      status: "active",
      cameraType: "Standard Surveillance",
      feedUrl: "rtsp://example.com:554/live/cam001",
      feedUsername: "admin",
      feedPassword: "tactical123",
    });
    
    this.createCamera({
      cameraId: "CAM-002",
      latitude: 40.7589,
      longitude: -73.9851,
      altitude: 200,
      range: 750,
      fov: 90,
      yaw: 180,
      pitch: -20,
      roll: 0,
      status: "active",
      cameraType: "High Resolution",
      feedUrl: "http://example.com:8080/stream/cam002",
      feedUsername: "operator",
      feedPassword: "secure456",
    });
    
    this.createCamera({
      cameraId: "CAM-003",
      latitude: 40.7505,
      longitude: -73.9934,
      altitude: 100,
      range: 600,
      fov: 110,
      yaw: 270,
      pitch: -10,
      roll: 0,
      status: "maintenance",
      cameraType: "Thermal Imaging",
      feedUrl: "rtsp://thermal.example.com/cam003",
      feedUsername: "thermal_user",
      feedPassword: "heat789",
    });
    
    this.createCamera({
      cameraId: "CAM-004",
      latitude: 40.7282,
      longitude: -73.9942,
      altitude: 300,
      range: 800,
      fov: 135,
      yaw: 90,
      pitch: -25,
      roll: 0,
      status: "active",
      cameraType: "Night Vision",
      feedUrl: "http://nightcam.example.com/feed",
      feedUsername: "nightwatch",
      feedPassword: "vision101",
    });
  }

  async getCameras(): Promise<Camera[]> {
    return Array.from(this.cameras.values());
  }

  async getCamera(id: number): Promise<Camera | undefined> {
    return this.cameras.get(id);
  }

  async getCameraByCameraId(cameraId: string): Promise<Camera | undefined> {
    return Array.from(this.cameras.values()).find(
      (camera) => camera.cameraId === cameraId,
    );
  }

  async createCamera(insertCamera: InsertCamera): Promise<Camera> {
    const id = this.currentId++;
    const camera: Camera = {
      ...insertCamera,
      id,
      latitude: Math.round(insertCamera.latitude * 1000000),
      longitude: Math.round(insertCamera.longitude * 1000000),
      lastDetection: null,
    };
    this.cameras.set(id, camera);
    return camera;
  }

  async updateCamera(id: number, updateCamera: UpdateCamera): Promise<Camera | undefined> {
    const existingCamera = this.cameras.get(id);
    if (!existingCamera) {
      return undefined;
    }

    const updatedCamera: Camera = {
      ...existingCamera,
      ...updateCamera,
      ...(updateCamera.latitude && { latitude: Math.round(updateCamera.latitude * 1000000) }),
      ...(updateCamera.longitude && { longitude: Math.round(updateCamera.longitude * 1000000) }),
    };

    this.cameras.set(id, updatedCamera);
    return updatedCamera;
  }

  async deleteCamera(id: number): Promise<boolean> {
    return this.cameras.delete(id);
  }

  async updateLastDetection(cameraId: string): Promise<void> {
    const camera = await this.getCameraByCameraId(cameraId);
    if (camera) {
      const updatedCamera = { ...camera, lastDetection: new Date() };
      this.cameras.set(camera.id, updatedCamera);
    }
  }
}

export const storage = new DatabaseStorage();
