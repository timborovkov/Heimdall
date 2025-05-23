import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCameraSchema, updateCameraSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all cameras
  app.get("/api/cameras", async (_req, res) => {
    try {
      const cameras = await storage.getCameras();
      // Convert stored coordinates back to decimal
      const formattedCameras = cameras.map(camera => ({
        ...camera,
        latitude: camera.latitude / 1000000,
        longitude: camera.longitude / 1000000,
      }));
      res.json(formattedCameras);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cameras" });
    }
  });

  // Get single camera
  app.get("/api/cameras/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid camera ID" });
      }

      const camera = await storage.getCamera(id);
      if (!camera) {
        return res.status(404).json({ message: "Camera not found" });
      }

      // Convert stored coordinates back to decimal
      const formattedCamera = {
        ...camera,
        latitude: camera.latitude / 1000000,
        longitude: camera.longitude / 1000000,
      };

      res.json(formattedCamera);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch camera" });
    }
  });

  // Create new camera
  app.post("/api/cameras", async (req, res) => {
    try {
      const validatedData = insertCameraSchema.parse(req.body);
      
      // Check if camera ID already exists
      const existingCamera = await storage.getCameraByCameraId(validatedData.cameraId);
      if (existingCamera) {
        return res.status(400).json({ message: "Camera ID already exists" });
      }

      const camera = await storage.createCamera(validatedData);
      
      // Convert stored coordinates back to decimal for response
      const formattedCamera = {
        ...camera,
        latitude: camera.latitude / 1000000,
        longitude: camera.longitude / 1000000,
      };

      res.status(201).json(formattedCamera);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create camera" });
    }
  });

  // Update camera
  app.patch("/api/cameras/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid camera ID" });
      }

      const validatedData = updateCameraSchema.parse(req.body);
      const camera = await storage.updateCamera(id, validatedData);
      
      if (!camera) {
        return res.status(404).json({ message: "Camera not found" });
      }

      // Convert stored coordinates back to decimal for response
      const formattedCamera = {
        ...camera,
        latitude: camera.latitude / 1000000,
        longitude: camera.longitude / 1000000,
      };

      res.json(formattedCamera);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update camera" });
    }
  });

  // Delete camera
  app.delete("/api/cameras/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid camera ID" });
      }

      const deleted = await storage.deleteCamera(id);
      if (!deleted) {
        return res.status(404).json({ message: "Camera not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete camera" });
    }
  });

  // Update last detection time
  app.post("/api/cameras/:cameraId/detection", async (req, res) => {
    try {
      const { cameraId } = req.params;
      await storage.updateLastDetection(cameraId);
      res.status(200).json({ message: "Detection time updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update detection time" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
