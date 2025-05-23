import { cameras, type Camera, type InsertCamera, type UpdateCamera } from "@shared/schema";

export interface IStorage {
  getCameras(): Promise<Camera[]>;
  getCamera(id: number): Promise<Camera | undefined>;
  getCameraByCameraId(cameraId: string): Promise<Camera | undefined>;
  createCamera(camera: InsertCamera): Promise<Camera>;
  updateCamera(id: number, camera: UpdateCamera): Promise<Camera | undefined>;
  deleteCamera(id: number): Promise<boolean>;
  updateLastDetection(cameraId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private cameras: Map<number, Camera>;
  private currentId: number;

  constructor() {
    this.cameras = new Map();
    this.currentId = 1;
    
    // Initialize with some default cameras
    this.createCamera({
      cameraId: "CAM-001",
      latitude: 40.7128,
      longitude: -74.0060,
      range: 500,
      fov: 120,
      direction: 45,
      status: "active",
      cameraType: "Standard Surveillance",
    });
    
    this.createCamera({
      cameraId: "CAM-002",
      latitude: 40.7589,
      longitude: -73.9851,
      range: 750,
      fov: 90,
      direction: 180,
      status: "active",
      cameraType: "High Resolution",
    });
    
    this.createCamera({
      cameraId: "CAM-003",
      latitude: 40.7505,
      longitude: -73.9934,
      range: 600,
      fov: 110,
      direction: 270,
      status: "maintenance",
      cameraType: "Thermal Imaging",
    });
    
    this.createCamera({
      cameraId: "CAM-004",
      latitude: 40.7282,
      longitude: -73.9942,
      range: 800,
      fov: 135,
      direction: 90,
      status: "active",
      cameraType: "Night Vision",
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

export const storage = new MemStorage();
