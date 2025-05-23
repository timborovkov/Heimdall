import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Radar, MapPin } from "lucide-react";
import TacticalMap from "@/components/tactical-map";
import CameraCard from "@/components/camera-card";
import CameraModal from "@/components/camera-modal";
import CameraFeedViewer from "@/components/camera-feed-viewer";
import ControlPanel from "@/components/control-panel";
import HeimdallLogo from "@/components/heimdall-logo";
import DroneAlertBanner from "@/components/drone-alert-banner";
import DroneTrajectoryMap from "@/components/drone-trajectory-map";
import { Button } from "@/components/ui/button";
import type { Camera, DroneAlert } from "@shared/schema";

export default function Dashboard() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
  const [viewingFeedCamera, setViewingFeedCamera] = useState<Camera | null>(null);
  const [viewingTrajectory, setViewingTrajectory] = useState<DroneAlert | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const { data: cameras = [], isLoading, refetch } = useQuery<Camera[]>({
    queryKey: ["/api/cameras"],
  });

  const { data: droneAlerts = [] } = useQuery<DroneAlert[]>({
    queryKey: ["/api/drone-alerts"],
    refetchInterval: 3000, // Refresh every 3 seconds for real-time alerts
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeCameras = cameras.filter(camera => camera.status === 'active');

  const handleCameraAdded = () => {
    refetch();
    setIsAddModalOpen(false);
  };

  const handleCameraUpdated = () => {
    refetch();
    setEditingCamera(null);
  };

  const handleCameraDeleted = () => {
    refetch();
  };

  const handleEditCamera = (camera: Camera) => {
    setEditingCamera(camera);
  };

  const handleViewFeed = (camera: Camera) => {
    setViewingFeedCamera(camera);
  };

  const handleDismissAlert = (alertId: number) => {
    // In a real implementation, this would update the alert status
    console.log('Dismissing alert:', alertId);
  };

  const handleViewTrajectory = (alert: DroneAlert) => {
    setViewingTrajectory(alert);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen tactical-dark flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <HeimdallLogo className="w-16 h-16 animate-pulse" />
          <div className="text-tactical-amber font-mono">INITIALIZING HEIMDALL SYSTEMS...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen tactical-dark text-white font-sans">
      {/* Header */}
      <header className="tactical-navy border-b border-tactical-steel px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <HeimdallLogo className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold tracking-wider">HEIMDALL</h1>
              <p className="text-tactical-slate text-sm font-mono">DRONE DETECTION SYSTEM • OPERATIONAL</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-tactical-slate text-xs font-mono">LAST UPDATE</p>
              <p className="text-tactical-amber text-sm font-mono">
                {currentTime.toUTCString().split(' ')[4]} UTC
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-tactical-green rounded-full status-pulse"></div>
              <span className="text-tactical-green text-sm font-mono">ACTIVE</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Map Section */}
          <section className="flex-1 relative">
            <div className="absolute inset-4 tactical-navy rounded-lg border border-tactical-steel overflow-hidden">
              <div className="tactical-charcoal px-4 py-2 border-b border-tactical-steel">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MapPin className="text-tactical-amber" size={20} />
                    <span className="font-semibold">HEIMDALL TACTICAL OVERVIEW</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-tactical-amber rounded-full"></div>
                      <span className="text-xs text-tactical-slate">CAMERA POSITIONS</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-tactical-green rounded-full"></div>
                      <span className="text-xs text-tactical-slate">ACTIVE ZONES</span>
                    </div>
                  </div>
                </div>
              </div>
              <TacticalMap cameras={cameras} />
            </div>
          </section>

          {/* Camera Management Section */}
          <section className="h-80 tactical-navy border-t border-tactical-steel">
            <div className="h-full flex flex-col">
              <div className="tactical-charcoal px-6 py-3 border-b border-tactical-steel">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Radar className="text-tactical-amber" size={20} />
                    <h2 className="font-semibold">CAMERA NETWORK STATUS</h2>
                    <span className="bg-tactical-green text-black px-2 py-1 rounded text-xs font-mono">
                      {activeCameras.length} ACTIVE
                    </span>
                  </div>
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-tactical-amber text-black hover:bg-tactical-amber/90 font-semibold"
                  >
                    <MapPin className="mr-2" size={16} />
                    DEPLOY CAMERA
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {cameras.map((camera) => (
                    <CameraCard
                      key={camera.id}
                      camera={camera}
                      onEdit={handleEditCamera}
                      onDelete={handleCameraDeleted}
                      onViewFeed={handleViewFeed}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Side Panel */}
        <ControlPanel cameras={cameras} />
      </div>

      {/* Add Camera Modal */}
      <CameraModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleCameraAdded}
      />

      {/* Edit Camera Modal */}
      {editingCamera && (
        <CameraModal
          isOpen={true}
          onClose={() => setEditingCamera(null)}
          onSuccess={handleCameraUpdated}
          camera={editingCamera}
        />
      )}

      {/* Live Camera Feed Viewer */}
      <CameraFeedViewer
        camera={viewingFeedCamera}
        isOpen={!!viewingFeedCamera}
        onClose={() => setViewingFeedCamera(null)}
      />
    </div>
  );
}
