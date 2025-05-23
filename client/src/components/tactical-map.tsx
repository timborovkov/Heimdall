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
    if (!mapRef.current) return;

    // Load Leaflet CSS and JS
    const loadLeaflet = async () => {
      // Load CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load JS
      if (!window.L) {
        return new Promise<void>((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => resolve();
          document.head.appendChild(script);
        });
      }
    };

    loadLeaflet().then(() => {
      if (!mapInstanceRef.current && window.L) {
        // Initialize map
        mapInstanceRef.current = window.L.map(mapRef.current, {
          center: [40.7128, -74.0060],
          zoom: 13,
          zoomControl: false
        });

        // Add custom zoom control
        window.L.control.zoom({
          position: 'bottomright'
        }).addTo(mapInstanceRef.current);

        // Add satellite tiles
        window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tactical Surveillance System',
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

  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    cameras.forEach(camera => {
      const lat = camera.latitude;
      const lng = camera.longitude;

      // Create marker
      const marker = window.L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: camera.status === 'active' ? '#48BB78' : camera.status === 'maintenance' ? '#ED8936' : '#F56565',
        color: '#F6AD55',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(mapInstanceRef.current);

      // Add popup
      marker.bindPopup(`
        <div style="background: #1A2332; color: white; padding: 8px; border-radius: 4px; border: none;">
          <strong>${camera.cameraId}</strong><br>
          Status: ${camera.status.toUpperCase()}<br>
          Range: ${camera.range}m<br>
          FOV: ${camera.fov}°<br>
          Type: ${camera.cameraType}
        </div>
      `);

      markersRef.current.push(marker);

      // Create field of view if camera is active
      if (camera.status === 'active') {
        const fovPoints = createFOVPolygon(camera);
        const fovPolygon = window.L.polygon(fovPoints, {
          color: '#F6AD55',
          weight: 2,
          opacity: 0.8,
          fillColor: '#F6AD55',
          fillOpacity: 0.2
        }).addTo(mapInstanceRef.current);

        markersRef.current.push(fovPolygon);
      }
    });
  }, [cameras]);

  const createFOVPolygon = (camera: Camera) => {
    const points = [];
    const centerLat = camera.latitude;
    const centerLng = camera.longitude;
    const rangeKm = camera.range / 1000;
    
    const startAngle = camera.direction - (camera.fov / 2);
    const endAngle = camera.direction + (camera.fov / 2);
    
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
