import { Settings, Search, Download, RefreshCw, AlertTriangle, Wrench, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Camera } from "@shared/schema";

interface ControlPanelProps {
  cameras: Camera[];
}

export default function ControlPanel({ cameras }: ControlPanelProps) {
  const activeCameras = cameras.filter(camera => camera.status === 'active');
  const maintenanceCameras = cameras.filter(camera => camera.status === 'maintenance');
  const offlineCameras = cameras.filter(camera => camera.status === 'offline');
  
  const networkHealth = cameras.length > 0 ? (activeCameras.length / cameras.length) * 100 : 0;
  
  // Calculate recent detections from actual camera data
  const recentDetections = cameras.filter(camera => 
    camera.lastDetection && 
    new Date().getTime() - new Date(camera.lastDetection).getTime() < 3600000 // Within last hour
  ).length;

  const mockAlerts = [
    {
      type: 'detection',
      message: 'DRONE DETECTED',
      details: 'CAM-001 • Sector 7',
      time: '14:28',
      severity: 'high'
    },
    {
      type: 'maintenance',
      message: 'MAINTENANCE ALERT',
      details: 'CAM-003 • Offline',
      time: '13:45',
      severity: 'medium'
    },
    {
      type: 'system',
      message: 'SYSTEM READY',
      details: 'All systems operational',
      time: '12:00',
      severity: 'low'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-tactical-red';
      case 'medium': return 'border-tactical-orange';
      case 'low': return 'border-tactical-green';
      default: return 'border-tactical-steel';
    }
  };

  return (
    <aside className="w-80 tactical-navy border-l border-tactical-steel">
      <div className="h-full flex flex-col">
        <div className="tactical-charcoal px-4 py-3 border-b border-tactical-steel">
          <h3 className="font-semibold flex items-center">
            <Settings className="text-tactical-amber mr-2" size={20} />
            CONTROL PANEL
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* System Status */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-tactical-amber border-b border-tactical-steel pb-1">
              SYSTEM STATUS
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-tactical-slate">Network Health</span>
                <span className="text-tactical-green text-sm font-mono">
                  {networkHealth.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-tactical-slate">Active Cameras</span>
                <span className="text-tactical-green text-sm font-mono">
                  {activeCameras.length}/{cameras.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-tactical-slate">Detection Rate</span>
                <span className="text-tactical-amber text-sm font-mono">
                  {recentDetections}/hr
                </span>
              </div>
              {maintenanceCameras.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-tactical-slate">Maintenance</span>
                  <span className="text-tactical-orange text-sm font-mono">
                    {maintenanceCameras.length}
                  </span>
                </div>
              )}
              {offlineCameras.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-tactical-slate">Offline</span>
                  <span className="text-tactical-red text-sm font-mono">
                    {offlineCameras.length}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-tactical-amber border-b border-tactical-steel pb-1">
              RECENT ALERTS
            </h4>
            <div className="space-y-2">
              {mockAlerts.map((alert, index) => (
                <Card key={index} className={`tactical-charcoal border-l-4 ${getSeverityColor(alert.severity)} border-r-0 border-t-0 border-b-0`}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-mono font-semibold">{alert.message}</p>
                        <p className="text-xs text-tactical-slate">{alert.details}</p>
                      </div>
                      <span className="text-xs text-tactical-slate">{alert.time}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-tactical-amber border-b border-tactical-steel pb-1">
              QUICK ACTIONS
            </h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full tactical-charcoal hover:bg-tactical-steel border-tactical-steel text-left justify-start"
              >
                <Search className="text-tactical-amber mr-2" size={16} />
                <span className="text-sm">Run System Diagnostics</span>
              </Button>
              <Button
                variant="outline"
                className="w-full tactical-charcoal hover:bg-tactical-steel border-tactical-steel text-left justify-start"
              >
                <Download className="text-tactical-amber mr-2" size={16} />
                <span className="text-sm">Export Detection Log</span>
              </Button>
              <Button
                variant="outline"
                className="w-full tactical-charcoal hover:bg-tactical-steel border-tactical-steel text-left justify-start"
              >
                <RefreshCw className="text-tactical-amber mr-2" size={16} />
                <span className="text-sm">Sync All Cameras</span>
              </Button>
            </div>
          </div>

          {/* System Legend */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-tactical-amber border-b border-tactical-steel pb-1">
              STATUS LEGEND
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-tactical-green" size={14} />
                <span className="text-tactical-slate">Active & Operational</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wrench className="text-tactical-orange" size={14} />
                <span className="text-tactical-slate">Under Maintenance</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="text-tactical-red" size={14} />
                <span className="text-tactical-slate">Offline / Error</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
