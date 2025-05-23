import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { X, Video, MapPin, RotateCw, Camera as CameraIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Camera, InsertCamera, UpdateCamera } from "@shared/schema";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  camera?: Camera;
  mapClickPosition?: { lat: number; lng: number } | null;
}

export default function CameraModal({ isOpen, onClose, onSuccess, camera, mapClickPosition }: CameraModalProps) {
  const isEditing = !!camera;
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    cameraId: camera?.cameraId || '',
    latitude: camera?.latitude?.toString() || mapClickPosition?.lat.toString() || '',
    longitude: camera?.longitude?.toString() || mapClickPosition?.lng.toString() || '',
    altitude: camera?.altitude?.toString() || '100',
    range: camera?.range?.toString() || '',
    fov: camera?.fov?.toString() || '',
    yaw: camera?.yaw?.toString() || '0',
    pitch: camera?.pitch?.toString() || '-15',
    roll: camera?.roll?.toString() || '0',
    status: camera?.status || 'active',
    cameraType: camera?.cameraType || 'Standard Surveillance',
    feedUrl: camera?.feedUrl || '',
    feedUsername: camera?.feedUsername || '',
    feedPassword: camera?.feedPassword || '',
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertCamera) => {
      const response = await apiRequest("POST", "/api/cameras", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Camera Deployed",
        description: `${formData.cameraId} has been successfully deployed.`,
      });
      onSuccess();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Deployment Failed",
        description: error.message || "Failed to deploy camera. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateCamera) => {
      const response = await apiRequest("PATCH", `/api/cameras/${camera!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Camera Updated",
        description: `${formData.cameraId} has been successfully updated.`,
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update camera. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      cameraId: '',
      latitude: '',
      longitude: '',
      altitude: '100',
      range: '',
      fov: '',
      yaw: '0',
      pitch: '-15',
      roll: '0',
      status: 'active',
      cameraType: 'Standard Surveillance',
      feedUrl: '',
      feedUsername: '',
      feedPassword: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.cameraId.trim()) {
      toast({
        title: "Validation Error",
        description: "Camera ID is required",
        variant: "destructive",
      });
      return;
    }

    const latitude = parseFloat(formData.latitude);
    const longitude = parseFloat(formData.longitude);
    const altitude = parseInt(formData.altitude);
    const range = parseInt(formData.range);
    const fov = parseInt(formData.fov);
    const yaw = parseInt(formData.yaw);
    const pitch = parseInt(formData.pitch);
    const roll = parseInt(formData.roll);

    // Validate numeric inputs
    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      toast({
        title: "Validation Error",
        description: "Latitude must be between -90 and 90",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      toast({
        title: "Validation Error",
        description: "Longitude must be between -180 and 180",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(altitude) || altitude < 0 || altitude > 10000) {
      toast({
        title: "Validation Error",
        description: "Altitude must be between 0 and 10,000 meters",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(range) || range < 100 || range > 2000) {
      toast({
        title: "Validation Error",
        description: "Range must be between 100 and 2000 meters",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(fov) || fov < 30 || fov > 180) {
      toast({
        title: "Validation Error",
        description: "Field of view must be between 30 and 180 degrees",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(yaw) || yaw < 0 || yaw > 360) {
      toast({
        title: "Validation Error",
        description: "Yaw must be between 0 and 360 degrees",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(pitch) || pitch < -90 || pitch > 90) {
      toast({
        title: "Validation Error",
        description: "Pitch must be between -90 and 90 degrees",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(roll) || roll < -180 || roll > 180) {
      toast({
        title: "Validation Error",
        description: "Roll must be between -180 and 180 degrees",
        variant: "destructive",
      });
      return;
    }

    const data = {
      cameraId: formData.cameraId.trim(),
      latitude,
      longitude,
      altitude,
      range,
      fov,
      yaw,
      pitch,
      roll,
      status: formData.status as "active" | "maintenance" | "offline",
      cameraType: formData.cameraType as "Standard Surveillance" | "Thermal Imaging" | "Night Vision" | "High Resolution",
      feedUrl: formData.feedUrl.trim() || undefined,
      feedUsername: formData.feedUsername.trim() || undefined,
      feedPassword: formData.feedPassword.trim() || undefined,
    };

    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleClose = () => {
    onClose();
    if (!isEditing) {
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="tactical-navy border-tactical-steel max-w-md z-[10000]">
        <DialogHeader className="tactical-charcoal -mx-6 -mt-6 px-6 py-4 border-b border-tactical-steel">
          <DialogTitle className="flex items-center text-white">
            <Video className="text-tactical-amber mr-2" size={20} />
            {isEditing ? "MODIFY CAMERA" : "DEPLOY NEW CAMERA"}
          </DialogTitle>
          <DialogDescription className="text-tactical-slate text-sm">
            {isEditing ? "Update camera settings and position" : "Configure and deploy a new surveillance camera to the network"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label className="text-tactical-slate font-medium">Camera ID</Label>
            <Input
              value={formData.cameraId}
              onChange={(e) => setFormData({ ...formData, cameraId: e.target.value })}
              placeholder="CAM-005"
              className="tactical-charcoal border-tactical-steel text-white placeholder:text-tactical-slate focus:border-tactical-amber"
              required
              disabled={isEditing}
            />
          </div>

          {/* 3D Position Coordinates */}
          <div className="border border-tactical-steel rounded-lg p-4 space-y-3">
            <h3 className="text-tactical-amber font-semibold text-sm flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              3D POSITION COORDINATES
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-tactical-slate font-medium text-xs">Latitude (Y)</Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="40.7128"
                  className="tactical-charcoal border-tactical-steel text-white placeholder:text-tactical-slate focus:border-tactical-amber"
                  required
                />
              </div>
              <div>
                <Label className="text-tactical-slate font-medium text-xs">Longitude (X)</Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="-74.0060"
                  className="tactical-charcoal border-tactical-steel text-white placeholder:text-tactical-slate focus:border-tactical-amber"
                  required
                />
              </div>
              <div>
                <Label className="text-tactical-slate font-medium text-xs">Altitude (Z) m</Label>
                <Input
                  type="number"
                  value={formData.altitude}
                  onChange={(e) => setFormData({ ...formData, altitude: e.target.value })}
                  placeholder="100"
                  min="0"
                  max="10000"
                  className="tactical-charcoal border-tactical-steel text-white placeholder:text-tactical-slate focus:border-tactical-amber"
                  required
                />
              </div>
            </div>
          </div>

          {/* Camera Orientation */}
          <div className="border border-tactical-steel rounded-lg p-4 space-y-3">
            <h3 className="text-tactical-amber font-semibold text-sm flex items-center">
              <RotateCw className="w-4 h-4 mr-2" />
              CAMERA ORIENTATION
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-tactical-slate font-medium text-xs">Yaw (0-360°)</Label>
                <Input
                  type="number"
                  value={formData.yaw}
                  onChange={(e) => setFormData({ ...formData, yaw: e.target.value })}
                  placeholder="0"
                  min="0"
                  max="360"
                  className="tactical-charcoal border-tactical-steel text-white placeholder:text-tactical-slate focus:border-tactical-amber"
                  required
                />
                <p className="text-xs text-tactical-slate mt-1">Horizontal rotation</p>
              </div>
              <div>
                <Label className="text-tactical-slate font-medium text-xs">Pitch (-90 to 90°)</Label>
                <Input
                  type="number"
                  value={formData.pitch}
                  onChange={(e) => setFormData({ ...formData, pitch: e.target.value })}
                  placeholder="-15"
                  min="-90"
                  max="90"
                  className="tactical-charcoal border-tactical-steel text-white placeholder:text-tactical-slate focus:border-tactical-amber"
                  required
                />
                <p className="text-xs text-tactical-slate mt-1">Vertical tilt</p>
              </div>
              <div>
                <Label className="text-tactical-slate font-medium text-xs">Roll (-180 to 180°)</Label>
                <Input
                  type="number"
                  value={formData.roll}
                  onChange={(e) => setFormData({ ...formData, roll: e.target.value })}
                  placeholder="0"
                  min="-180"
                  max="180"
                  className="tactical-charcoal border-tactical-steel text-white placeholder:text-tactical-slate focus:border-tactical-amber"
                  required
                />
                <p className="text-xs text-tactical-slate mt-1">Forward axis rotation</p>
              </div>
            </div>
          </div>

          {/* Detection Parameters */}
          <div className="border border-tactical-steel rounded-lg p-4 space-y-3">
            <h3 className="text-tactical-amber font-semibold text-sm flex items-center">
              <CameraIcon className="w-4 h-4 mr-2" />
              DETECTION PARAMETERS
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-tactical-slate font-medium text-xs">Range (meters)</Label>
                <Input
                  type="number"
                  value={formData.range}
                  onChange={(e) => setFormData({ ...formData, range: e.target.value })}
                  placeholder="500"
                  min="100"
                  max="2000"
                  className="tactical-charcoal border-tactical-steel text-white placeholder:text-tactical-slate focus:border-tactical-amber"
                  required
                />
              </div>
              <div>
                <Label className="text-tactical-slate font-medium text-xs">FOV (degrees)</Label>
                <Input
                  type="number"
                  value={formData.fov}
                  onChange={(e) => setFormData({ ...formData, fov: e.target.value })}
                  placeholder="120"
                  min="30"
                  max="180"
                  className="tactical-charcoal border-tactical-steel text-white placeholder:text-tactical-slate focus:border-tactical-amber"
                  required
                />
              </div>
            </div>
          </div>

          {/* Live Camera Feed Configuration */}
          <div className="border border-tactical-steel rounded-lg p-4 space-y-3">
            <h3 className="text-tactical-amber font-semibold text-sm flex items-center">
              <Video className="w-4 h-4 mr-2" />
              LIVE FEED CONFIGURATION
            </h3>
            <div>
              <Label className="text-tactical-slate font-medium text-xs">Feed URL</Label>
              <Input
                type="url"
                value={formData.feedUrl}
                onChange={(e) => setFormData({ ...formData, feedUrl: e.target.value })}
                placeholder="rtsp://camera.example.com:554/live or http://camera.example.com/stream"
                className="tactical-charcoal border-tactical-steel text-white placeholder:text-tactical-slate focus:border-tactical-amber"
              />
              <p className="text-xs text-tactical-slate mt-1">RTSP, HTTP, or WebRTC stream URL</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-tactical-slate font-medium text-xs">Username</Label>
                <Input
                  type="text"
                  value={formData.feedUsername}
                  onChange={(e) => setFormData({ ...formData, feedUsername: e.target.value })}
                  placeholder="admin"
                  className="tactical-charcoal border-tactical-steel text-white placeholder:text-tactical-slate focus:border-tactical-amber"
                />
              </div>
              <div>
                <Label className="text-tactical-slate font-medium text-xs">Password</Label>
                <Input
                  type="password"
                  value={formData.feedPassword}
                  onChange={(e) => setFormData({ ...formData, feedPassword: e.target.value })}
                  placeholder="••••••••"
                  className="tactical-charcoal border-tactical-steel text-white placeholder:text-tactical-slate focus:border-tactical-amber"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-tactical-slate font-medium">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="tactical-charcoal border-tactical-steel text-white focus:border-tactical-amber">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="tactical-charcoal border-tactical-steel">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-tactical-slate font-medium">Camera Type</Label>
              <Select value={formData.cameraType} onValueChange={(value) => setFormData({ ...formData, cameraType: value })}>
                <SelectTrigger className="tactical-charcoal border-tactical-steel text-white focus:border-tactical-amber">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="tactical-charcoal border-tactical-steel">
                  <SelectItem value="Standard Surveillance">Standard Surveillance</SelectItem>
                  <SelectItem value="Thermal Imaging">Thermal Imaging</SelectItem>
                  <SelectItem value="Night Vision">Night Vision</SelectItem>
                  <SelectItem value="High Resolution">High Resolution</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="flex-1 bg-tactical-steel border-tactical-steel text-white hover:bg-tactical-slate"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 bg-tactical-amber text-black hover:bg-tactical-amber/90 font-medium"
            >
              {isEditing ? "UPDATE" : "DEPLOY"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
