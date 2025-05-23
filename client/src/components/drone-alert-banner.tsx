import { useState, useEffect } from "react";
import { X, AlertTriangle, MapPin, Gauge, Navigation, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DroneAlert } from "@shared/schema";

interface DroneAlertBannerProps {
  alerts: DroneAlert[];
  onDismiss: (alertId: number) => void;
  onViewTrajectory: (alert: DroneAlert) => void;
}

export default function DroneAlertBanner({ alerts, onDismiss, onViewTrajectory }: DroneAlertBannerProps) {
  const [currentAlert, setCurrentAlert] = useState<DroneAlert | null>(null);
  const [alertIndex, setAlertIndex] = useState(0);

  // Cycle through active alerts
  useEffect(() => {
    console.log('DroneAlertBanner received alerts:', alerts);
    const activeAlerts = alerts.filter(alert => alert.status === 'active');
    console.log('Active alerts found:', activeAlerts);
    if (activeAlerts.length > 0) {
      setCurrentAlert(activeAlerts[alertIndex % activeAlerts.length]);
      
      if (activeAlerts.length > 1) {
        const interval = setInterval(() => {
          setAlertIndex(prev => (prev + 1) % activeAlerts.length);
        }, 4000);
        return () => clearInterval(interval);
      }
    } else {
      setCurrentAlert(null);
    }
  }, [alerts, alertIndex]);

  // Temporarily force display for testing
  if (!currentAlert && alerts.length > 0) {
    console.log('Forcing display of first alert for testing:', alerts[0]);
    setCurrentAlert(alerts[0]);
  }
  
  if (!currentAlert) {
    console.log('No current alert to display, alerts length:', alerts.length);
    return null;
  }
  
  console.log('Displaying alert:', currentAlert);

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'bg-red-600 border-red-500 text-red-100';
      case 'High': return 'bg-red-500 border-red-400 text-red-100';
      case 'Medium': return 'bg-orange-500 border-orange-400 text-orange-100';
      case 'Low': return 'bg-yellow-500 border-yellow-400 text-yellow-100';
      default: return 'bg-red-600 border-red-500 text-red-100';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const detected = new Date(timestamp);
    const diffMs = now.getTime() - detected.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    return `${Math.floor(diffSecs / 3600)}h ago`;
  };

  const lat = currentAlert.latitude / 1000000;
  const lng = currentAlert.longitude / 1000000;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <Card className={`${getThreatColor(currentAlert.threatLevel)} border-2 shadow-2xl animate-pulse`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 mr-3 animate-bounce" />
                <div>
                  <h2 className="text-2xl font-bold">
                    ⚠️ DRONE DETECTED
                  </h2>
                  <p className="text-lg opacity-90">
                    {currentAlert.droneType} • Camera {currentAlert.cameraId}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                {/* Confidence */}
                <div className="text-center">
                  <div className="text-3xl font-mono font-bold">
                    {currentAlert.confidence}%
                  </div>
                  <div className="text-sm opacity-75">Confidence</div>
                </div>
                
                {/* Speed */}
                <div className="text-center flex items-center">
                  <Gauge className="w-5 h-5 mr-1" />
                  <div>
                    <div className="text-xl font-mono font-bold">
                      {currentAlert.speed} km/h
                    </div>
                    <div className="text-xs opacity-75">Speed</div>
                  </div>
                </div>
                
                {/* Altitude */}
                <div className="text-center flex items-center">
                  <Navigation className="w-5 h-5 mr-1" />
                  <div>
                    <div className="text-xl font-mono font-bold">
                      {currentAlert.altitude}m
                    </div>
                    <div className="text-xs opacity-75">Altitude</div>
                  </div>
                </div>
                
                {/* Position */}
                <div className="text-center flex items-center">
                  <MapPin className="w-5 h-5 mr-1" />
                  <div>
                    <div className="text-sm font-mono">
                      {lat.toFixed(4)}, {lng.toFixed(4)}
                    </div>
                    <div className="text-xs opacity-75">Position</div>
                  </div>
                </div>
                
                {/* Time */}
                <div className="text-center flex items-center">
                  <Clock className="w-5 h-5 mr-1" />
                  <div>
                    <div className="text-sm font-mono">
                      {formatTimeAgo(currentAlert.detectedAt)}
                    </div>
                    <div className="text-xs opacity-75">Detected</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="destructive" className="text-lg px-3 py-1 animate-pulse">
                {currentAlert.threatLevel.toUpperCase()}
              </Badge>
              
              <Button
                onClick={() => onViewTrajectory(currentAlert)}
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/40"
              >
                View Trajectory
              </Button>
              
              <Button
                onClick={() => onDismiss(currentAlert.id)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Alert Counter */}
          {alerts.filter(a => a.status === 'active').length > 1 && (
            <div className="mt-3 text-center">
              <div className="text-sm opacity-75">
                Alert {alertIndex + 1} of {alerts.filter(a => a.status === 'active').length} active threats
              </div>
              <div className="flex justify-center space-x-1 mt-1">
                {alerts.filter(a => a.status === 'active').map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === alertIndex ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}