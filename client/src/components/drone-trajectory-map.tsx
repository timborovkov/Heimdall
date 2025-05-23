import { useEffect, useRef } from 'react';
import { X, Navigation, Gauge, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DroneAlert } from "@shared/schema";

// Declare Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

interface DroneTrajectoryMapProps {
  alert: DroneAlert | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DroneTrajectoryMap({ alert, isOpen, onClose }: DroneTrajectoryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!isOpen || !alert) return;

    const loadLeaflet = async () => {
      if (window.L) return;
      
      try {
        // Load Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Load Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading Leaflet:', error);
      }
    };

    loadLeaflet().then(() => {
      setTimeout(() => {
        if (!mapInstanceRef.current && window.L && mapRef.current && alert) {
          try {
            const lat = alert.latitude / 1000000;
            const lng = alert.longitude / 1000000;

            // Initialize trajectory map
            mapInstanceRef.current = window.L.map(mapRef.current, {
              center: [lat, lng],
              zoom: 16,
              zoomControl: false
            });

            // Add zoom control
            window.L.control.zoom({
              position: 'bottomright'
            }).addTo(mapInstanceRef.current);

            // Add satellite tiles
            window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
              attribution: 'Heimdall Trajectory Analysis',
              maxZoom: 18
            }).addTo(mapInstanceRef.current);

            // Add drone current position
            const droneIcon = window.L.divIcon({
              className: 'drone-marker',
              html: '<div style="background: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(239, 68, 68, 0.8);"></div>',
              iconSize: [22, 22],
              iconAnchor: [11, 11]
            });

            const droneMarker = window.L.marker([lat, lng], { icon: droneIcon }).addTo(mapInstanceRef.current);
            droneMarker.bindPopup(`
              <div style="background: #1A2332; color: white; padding: 8px; border-radius: 4px; min-width: 200px;">
                <strong>🚁 DRONE DETECTED</strong><br>
                <strong>Type:</strong> ${alert.droneType}<br>
                <strong>Threat:</strong> ${alert.threatLevel}<br>
                <strong>Confidence:</strong> ${alert.confidence}%<br>
                <strong>Speed:</strong> ${alert.speed} km/h<br>
                <strong>Altitude:</strong> ${alert.altitude}m<br>
                <strong>Heading:</strong> ${alert.heading}°<br>
                <strong>Status:</strong> ${alert.status.toUpperCase()}
              </div>
            `);
            markersRef.current.push(droneMarker);

            // Generate and display estimated trajectory
            if (alert.estimatedTrajectory) {
              try {
                const trajectory = JSON.parse(alert.estimatedTrajectory);
                if (Array.isArray(trajectory) && trajectory.length > 0) {
                  const trajectoryPoints = trajectory.map(point => [point.lat, point.lng]);
                  
                  // Draw trajectory line
                  const trajectoryLine = window.L.polyline(trajectoryPoints, {
                    color: '#f59e0b',
                    weight: 3,
                    opacity: 0.8,
                    dashArray: '10, 5'
                  }).addTo(mapInstanceRef.current);
                  markersRef.current.push(trajectoryLine);

                  // Add trajectory waypoints
                  trajectory.forEach((point, index) => {
                    const waypointIcon = window.L.divIcon({
                      className: 'waypoint-marker',
                      html: `<div style="background: #f59e0b; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; border: 2px solid white;">${index + 1}</div>`,
                      iconSize: [24, 24],
                      iconAnchor: [12, 12]
                    });

                    const waypoint = window.L.marker([point.lat, point.lng], { icon: waypointIcon }).addTo(mapInstanceRef.current);
                    waypoint.bindPopup(`
                      <div style="background: #1A2332; color: white; padding: 8px; border-radius: 4px;">
                        <strong>Trajectory Point ${index + 1}</strong><br>
                        <strong>Position:</strong> ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}<br>
                        <strong>Estimated Time:</strong> ${point.estimatedTime || 'Unknown'}<br>
                        <strong>Confidence:</strong> ${point.confidence || 'N/A'}%
                      </div>
                    `);
                    markersRef.current.push(waypoint);
                  });
                }
              } catch (e) {
                console.warn('Failed to parse trajectory data');
              }
            } else {
              // Generate predicted trajectory based on current heading and speed
              const predictions = generateTrajectoryPrediction(lat, lng, alert.heading, alert.speed);
              const trajectoryPoints = predictions.map(p => [p.lat, p.lng]);
              
              const predictedLine = window.L.polyline(trajectoryPoints, {
                color: '#8b5cf6',
                weight: 2,
                opacity: 0.6,
                dashArray: '5, 10'
              }).addTo(mapInstanceRef.current);
              markersRef.current.push(predictedLine);

              // Add prediction waypoints
              predictions.forEach((point, index) => {
                if (index > 0 && index % 2 === 0) {
                  const predIcon = window.L.divIcon({
                    className: 'prediction-marker',
                    html: `<div style="background: #8b5cf6; color: white; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8px; border: 1px solid white;">P</div>`,
                    iconSize: [18, 18],
                    iconAnchor: [9, 9]
                  });

                  const predMarker = window.L.marker([point.lat, point.lng], { icon: predIcon }).addTo(mapInstanceRef.current);
                  predMarker.bindPopup(`
                    <div style="background: #1A2332; color: white; padding: 8px; border-radius: 4px;">
                      <strong>Predicted Position</strong><br>
                      <strong>Time:</strong> +${point.timeOffset}min<br>
                      <strong>Position:</strong> ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}
                    </div>
                  `);
                  markersRef.current.push(predMarker);
                }
              });
            }

            // Fit map to show all markers
            const group = new window.L.featureGroup(markersRef.current);
            mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));

          } catch (error) {
            console.error('Error initializing trajectory map:', error);
          }
        }
      }, 200);
    });

    return () => {
      if (mapInstanceRef.current) {
        markersRef.current.forEach(marker => {
          try {
            marker.remove();
          } catch (e) {
            // Silently handle removal errors
          }
        });
        markersRef.current = [];
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, alert]);

  const generateTrajectoryPrediction = (lat: number, lng: number, heading: number, speed: number) => {
    const predictions = [];
    const speedMs = speed / 3.6; // Convert km/h to m/s
    
    for (let i = 1; i <= 10; i++) {
      const timeOffset = i * 30; // 30 second intervals
      const distance = speedMs * timeOffset; // meters
      
      // Convert heading to radians
      const headingRad = (heading * Math.PI) / 180;
      
      // Calculate new position
      const deltaLat = (distance * Math.cos(headingRad)) / 111000; // rough meters to degrees
      const deltaLng = (distance * Math.sin(headingRad)) / (111000 * Math.cos(lat * Math.PI / 180));
      
      predictions.push({
        lat: lat + deltaLat,
        lng: lng + deltaLng,
        timeOffset: Math.round(timeOffset / 60) // minutes
      });
    }
    
    return predictions;
  };

  if (!isOpen || !alert) return null;

  const lat = alert.latitude / 1000000;
  const lng = alert.longitude / 1000000;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4">
      <Card className="tactical-navy border-tactical-steel w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="tactical-charcoal border-b border-tactical-steel">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <Navigation className="text-tactical-amber mr-2" size={20} />
              DRONE TRAJECTORY ANALYSIS
            </CardTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 flex">
          {/* Map */}
          <div className="flex-1 relative">
            <div ref={mapRef} className="h-full w-full" />
          </div>
          
          {/* Alert Details Panel */}
          <div className="w-80 tactical-charcoal border-l border-tactical-steel p-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h3 className="text-tactical-amber font-semibold mb-2">THREAT DETAILS</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-tactical-slate text-sm">Type:</span>
                    <span className="text-white text-sm">{alert.droneType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-tactical-slate text-sm">Threat Level:</span>
                    <Badge variant="destructive">{alert.threatLevel}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-tactical-slate text-sm">Confidence:</span>
                    <span className="text-white text-sm font-mono">{alert.confidence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-tactical-slate text-sm">Status:</span>
                    <span className="text-tactical-amber text-sm uppercase">{alert.status}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-tactical-amber font-semibold mb-2">FLIGHT DATA</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-tactical-slate text-sm">Speed:</span>
                    <span className="text-white text-sm font-mono">{alert.speed} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-tactical-slate text-sm">Altitude:</span>
                    <span className="text-white text-sm font-mono">{alert.altitude}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-tactical-slate text-sm">Heading:</span>
                    <span className="text-white text-sm font-mono">{alert.heading}°</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-tactical-amber font-semibold mb-2">POSITION</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-tactical-slate text-sm">Latitude:</span>
                    <span className="text-white text-sm font-mono">{lat.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-tactical-slate text-sm">Longitude:</span>
                    <span className="text-white text-sm font-mono">{lng.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-tactical-slate text-sm">Camera:</span>
                    <span className="text-white text-sm">{alert.cameraId}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-tactical-amber font-semibold mb-2">DETECTION TIME</h3>
                <div className="text-white text-sm">
                  {new Date(alert.detectedAt).toLocaleString()}
                </div>
              </div>

              {alert.notes && (
                <div>
                  <h3 className="text-tactical-amber font-semibold mb-2">NOTES</h3>
                  <div className="text-tactical-slate text-sm">
                    {alert.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}