import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Play, Pause, Maximize2, Volume2, VolumeX, RotateCcw } from "lucide-react";
import type { Camera } from "@shared/schema";

interface CameraFeedViewerProps {
  camera: Camera | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CameraFeedViewer({ camera, isOpen, onClose }: CameraFeedViewerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!camera) return null;

  const handlePlay = () => setIsPlaying(!isPlaying);
  const handleMute = () => setIsMuted(!isMuted);
  const handleFullscreen = () => setIsFullscreen(!isFullscreen);
  const handleReconnect = () => {
    // Simulate reconnection
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "maintenance": return "bg-yellow-500";
      case "offline": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const feedUrlExists = camera.feedUrl && camera.feedUrl.trim() !== '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`tactical-navy border-tactical-steel z-[9999] ${isFullscreen ? 'max-w-full h-full' : 'max-w-4xl'}`}>
        <DialogHeader className="tactical-charcoal -mx-6 -mt-6 px-6 py-4 border-b border-tactical-steel">
          <div className="flex items-center space-x-3">
            <DialogTitle className="text-white flex items-center">
              LIVE FEED: {camera.cameraId}
            </DialogTitle>
            <Badge className={`${getStatusColor(camera.status)} text-white`}>
              {camera.status.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-tactical-amber border-tactical-amber">
              {camera.cameraType}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Camera Feed Display */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            {feedUrlExists ? (
              <>
                {/* Simulated Video Feed */}
                <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">📹</div>
                    <div className="text-lg font-semibold">TACTICAL FEED</div>
                    <div className="text-sm text-tactical-amber">{camera.feedUrl}</div>
                    <div className="text-xs text-tactical-slate mt-2">
                      User: {camera.feedUsername || "Not set"} | Auth: {camera.feedPassword ? "Protected" : "Open"}
                    </div>
                    {!isPlaying && (
                      <div className="mt-4 text-red-400">FEED PAUSED</div>
                    )}
                  </div>
                  
                  {/* Live indicator */}
                  {isPlaying && (
                    <div className="absolute top-4 left-4 flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-white text-sm font-semibold">LIVE</span>
                    </div>
                  )}

                  {/* Technical overlay */}
                  <div className="absolute top-4 right-4 text-white text-xs space-y-1 text-right">
                    <div>RES: 1920x1080</div>
                    <div>FPS: 30</div>
                    <div>BITRATE: 2.5 Mbps</div>
                  </div>

                  {/* Position overlay */}
                  <div className="absolute bottom-4 left-4 text-white text-xs space-y-1">
                    <div>LAT: {camera.latitude.toFixed(6)}</div>
                    <div>LNG: {camera.longitude.toFixed(6)}</div>
                    <div>ALT: {camera.altitude}m</div>
                    <div>YAW: {camera.yaw}° | PITCH: {camera.pitch}° | ROLL: {camera.roll}°</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <div className="text-center text-tactical-slate">
                  <div className="text-4xl mb-4">📵</div>
                  <div className="text-lg">No Feed URL Configured</div>
                  <div className="text-sm mt-2">Configure the camera feed URL to view live stream</div>
                </div>
              </div>
            )}
          </div>

          {/* Control Panel */}
          <div className="flex items-center justify-between p-4 bg-tactical-charcoal rounded-lg border border-tactical-steel">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlay}
                disabled={!feedUrlExists}
                className="border-tactical-steel text-white hover:bg-tactical-steel"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleMute}
                disabled={!feedUrlExists}
                className="border-tactical-steel text-white hover:bg-tactical-steel"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleReconnect}
                disabled={!feedUrlExists}
                className="border-tactical-steel text-white hover:bg-tactical-steel"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reconnect
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-sm text-tactical-slate">
                Range: {camera.range}m | FOV: {camera.fov}°
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleFullscreen}
                disabled={!feedUrlExists}
                className="border-tactical-steel text-white hover:bg-tactical-steel"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Camera Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-tactical-amber">Camera Details</h4>
              <div className="space-y-1 text-tactical-slate">
                <div>ID: {camera.cameraId}</div>
                <div>Type: {camera.cameraType}</div>
                <div>Status: {camera.status}</div>
                <div>Last Detection: {camera.lastDetection ? new Date(camera.lastDetection).toLocaleString() : "Never"}</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-tactical-amber">Position & Orientation</h4>
              <div className="space-y-1 text-tactical-slate">
                <div>Position: {camera.latitude.toFixed(6)}, {camera.longitude.toFixed(6)}</div>
                <div>Altitude: {camera.altitude}m</div>
                <div>Orientation: Y{camera.yaw}° P{camera.pitch}° R{camera.roll}°</div>
                <div>Detection Range: {camera.range}m | FOV: {camera.fov}°</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}