import { useMutation } from "@tanstack/react-query";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatTimeAgo, getStatusColor, getStatusDotColor } from "@/lib/utils";
import type { Camera } from "@shared/schema";

interface CameraCardProps {
  camera: Camera;
  onEdit: (camera: Camera) => void;
  onDelete: () => void;
}

export default function CameraCard({ camera, onEdit, onDelete }: CameraCardProps) {
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/cameras/${camera.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Camera Deleted",
        description: `${camera.cameraId} has been removed from the network.`,
      });
      onDelete();
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete camera. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${camera.cameraId}?`)) {
      deleteMutation.mutate();
    }
  };

  return (
    <Card className="tactical-charcoal border-tactical-steel hover:border-tactical-amber transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full status-pulse ${getStatusDotColor(camera.status)}`}></div>
            <span className="font-mono text-sm font-semibold">{camera.cameraId}</span>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(camera)}
              className="text-tactical-slate hover:text-tactical-amber p-1 h-auto"
            >
              <Edit size={12} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="text-tactical-slate hover:text-tactical-red p-1 h-auto"
            >
              <Trash2 size={12} />
            </Button>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-tactical-slate">Position:</span>
            <span className="font-mono">{camera.latitude.toFixed(4)}, {camera.longitude.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-tactical-slate">Range:</span>
            <span className="font-mono">{camera.range}m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-tactical-slate">FOV:</span>
            <span className="font-mono">{camera.fov}°</span>
          </div>
          <div className="flex justify-between">
            <span className="text-tactical-slate">Status:</span>
            <span className={`font-mono ${getStatusColor(camera.status)}`}>
              {camera.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-tactical-steel">
          <div className="flex justify-between items-center">
            <span className="text-xs text-tactical-slate">Last Detection</span>
            <span className="text-xs font-mono text-tactical-amber">
              {formatTimeAgo(camera.lastDetection)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
