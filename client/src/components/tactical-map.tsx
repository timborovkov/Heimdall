import { useEffect, useRef } from 'react';
import type { Camera } from '@shared/schema';

// Declare Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

interface TacticalMapProps {
  cameras: Camera[];
}

export default function TacticalMap({ cameras }: TacticalMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
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
        script.onload = () => {
          // Fix default marker icons
          delete (window.L.Icon.Default.prototype as any)._getIconUrl;
          window.L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          });
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading Leaflet:', error);
      }
    };

    loadLeaflet().then(() => {
      if (!mapInstanceRef.current && window.L) {
        // Initialize map centered on Riihimäki, Finland
        mapInstanceRef.current = window.L.map(mapRef.current, {
          center: [60.7395, 24.7729],
          zoom: 15,
          zoomControl: false
        });

        // Add custom zoom control
        window.L.control.zoom({
          position: 'bottomright'
        }).addTo(mapInstanceRef.current);

        // Add satellite tiles
        window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Heimdall Tactical System',
          maxZoom: 18
        }).addTo(mapInstanceRef.current);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Function to render cameras on the map
  const renderCameras = () => {
    if (!mapInstanceRef.current || !window.L) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      try {
        marker.remove();
      } catch (e) {
        // Silently handle removal errors
      }
    });
    markersRef.current = [];

    cameras.forEach(camera => {
      const lat = camera.latitude;
      const lng = camera.longitude;

      // Validate coordinates
      if (typeof lat !== 'number' || typeof lng !== 'number' || 
          isNaN(lat) || isNaN(lng) || 
          lat < -90 || lat > 90 || 
          lng < -180 || lng > 180) {
        console.warn(`Invalid coordinates for camera ${camera.cameraId}: ${lat}, ${lng}`);
        return;
      }

      // Create marker
      const marker = window.L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: camera.status === 'active' ? '#48BB78' : camera.status === 'maintenance' ? '#ED8936' : '#F56565',
        color: '#F6AD55',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(mapInstanceRef.current);

      // Add popup with error handling
      try {
        marker.bindPopup(`
          <div style="background: #1A2332; color: white; padding: 8px; border-radius: 4px; border: none;">
            <strong>${camera.cameraId}</strong><br>
            Status: ${camera.status.toUpperCase()}<br>
            Range: ${camera.range}m<br>
            FOV: ${camera.fov}°<br>
            Type: ${camera.cameraType}<br>
            Position: ${lat.toFixed(4)}, ${lng.toFixed(4)}
          </div>
        `, {
          className: 'tactical-popup',
          closeButton: false
        });
      } catch (error) {
        console.warn(`Failed to bind popup for camera ${camera.cameraId}:`, error);
      }

      markersRef.current.push(marker);

      // Add FOV visualization if camera is active
      if (camera.status === 'active' && camera.range && camera.fov && camera.yaw !== undefined) {
        try {
          const fovPoints = createFOVPolygon(camera);
          if (fovPoints.length > 0) {
            const fovPolygon = window.L.polygon(fovPoints, {
              color: '#F6AD55',
              weight: 1,
              opacity: 0.6,
              fillColor: '#48BB78',
              fillOpacity: 0.1
            }).addTo(mapInstanceRef.current);

            markersRef.current.push(fovPolygon);
          }
        } catch (e) {
          console.warn(`Failed to create FOV for camera ${camera.cameraId}`);
        }
      }
    });
  };

  // Use effect to render cameras when map or cameras change
  useEffect(() => {
    renderCameras();
  }, [cameras]);

  const createFOVPolygon = (camera: Camera) => {
    const points = [];
    const centerLat = camera.latitude;
    const centerLng = camera.longitude;
    const rangeKm = camera.range / 1000;
    
    const startAngle = camera.yaw - (camera.fov / 2);
    const endAngle = camera.yaw + (camera.fov / 2);
    
    points.push([centerLat, centerLng]);
    
    for (let angle = startAngle; angle <= endAngle; angle += 5) {
      const radians = angle * Math.PI / 180;
      const latOffset = rangeKm * Math.cos(radians) / 111;
      const lngOffset = rangeKm * Math.sin(radians) / (111 * Math.cos(centerLat * Math.PI / 180));
      points.push([centerLat + latOffset, centerLng + lngOffset]);
    }
    
    return points;
  };

  return <div ref={mapRef} className="h-full w-full" />;
}