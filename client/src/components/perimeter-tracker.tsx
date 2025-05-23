import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, MapPin, Eye, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { Camera } from "@shared/schema";

interface PerimeterPoint {
  lat: number;
  lng: number;
}

interface PerimeterTrackerProps {
  cameras: Camera[];
  onPerimeterChange?: (perimeter: PerimeterPoint[]) => void;
}

export default function PerimeterTracker({ cameras, onPerimeterChange }: PerimeterTrackerProps) {
  const [perimeter, setPerimeter] = useState<PerimeterPoint[]>([]);
  const [isDefiningPerimeter, setIsDefiningPerimeter] = useState(false);
  const [coverage, setCoverage] = useState<{
    totalPoints: number;
    coveredPoints: number;
    redundantPoints: number;
    vulnerableAreas: number;
  }>({ totalPoints: 0, coveredPoints: 0, redundantPoints: 0, vulnerableAreas: 0 });

  // Default perimeter around Riihimäki base
  const defaultPerimeter: PerimeterPoint[] = [
    { lat: 60.7420, lng: 24.7650 }, // Northwest
    { lat: 60.7450, lng: 24.7800 }, // Northeast  
    { lat: 60.7380, lng: 24.7850 }, // East
    { lat: 60.7350, lng: 24.7750 }, // Southeast
    { lat: 60.7320, lng: 24.7650 }, // South
    { lat: 60.7350, lng: 24.7550 }, // Southwest
    { lat: 60.7400, lng: 24.7500 }, // West
  ];

  useEffect(() => {
    if (perimeter.length === 0) {
      setPerimeter(defaultPerimeter);
      onPerimeterChange?.(defaultPerimeter);
    }
  }, []);

  useEffect(() => {
    analyzePerimeterCoverage();
  }, [cameras, perimeter]);

  const analyzePerimeterCoverage = () => {
    if (perimeter.length < 3) {
      setCoverage({ totalPoints: 0, coveredPoints: 0, redundantPoints: 0, vulnerableAreas: 0 });
      return;
    }

    const totalPoints = perimeter.length;
    let coveredPoints = 0;
    let redundantPoints = 0;
    let vulnerableAreas = 0;

    perimeter.forEach(point => {
      const coveringCameras = cameras.filter(camera => {
        const distance = calculateDistance(
          point.lat, point.lng,
          camera.latitude / 1000000, camera.longitude / 1000000
        );
        
        // Check if point is within camera range and FOV
        if (distance <= camera.range) {
          const bearing = calculateBearing(
            camera.latitude / 1000000, camera.longitude / 1000000,
            point.lat, point.lng
          );
          
          const cameraBearing = camera.yaw;
          const fovHalf = camera.fov / 2;
          
          let angleDiff = Math.abs(bearing - cameraBearing);
          if (angleDiff > 180) angleDiff = 360 - angleDiff;
          
          return angleDiff <= fovHalf && camera.status === 'active';
        }
        return false;
      });

      if (coveringCameras.length >= 2) {
        redundantPoints++;
        coveredPoints++;
      } else if (coveringCameras.length === 1) {
        coveredPoints++;
        vulnerableAreas++;
      }
    });

    setCoverage({
      totalPoints,
      coveredPoints,
      redundantPoints,
      vulnerableAreas: totalPoints - coveredPoints + vulnerableAreas
    });
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateBearing = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLng);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  };

  const getCoverageStatus = () => {
    const coveragePercent = (coverage.coveredPoints / coverage.totalPoints) * 100;
    const redundancyPercent = (coverage.redundantPoints / coverage.totalPoints) * 100;
    
    if (coveragePercent === 100 && redundancyPercent >= 80) {
      return { status: 'optimal', color: 'bg-green-500', text: 'OPTIMAL' };
    } else if (coveragePercent >= 90 && redundancyPercent >= 60) {
      return { status: 'good', color: 'bg-green-600', text: 'GOOD' };
    } else if (coveragePercent >= 75) {
      return { status: 'acceptable', color: 'bg-yellow-500', text: 'ACCEPTABLE' };
    } else {
      return { status: 'critical', color: 'bg-red-500', text: 'CRITICAL' };
    }
  };

  const resetToDefault = () => {
    setPerimeter(defaultPerimeter);
    onPerimeterChange?.(defaultPerimeter);
    setIsDefiningPerimeter(false);
  };

  const activeCameras = cameras.filter(c => c.status === 'active').length;
  const { status, color, text } = getCoverageStatus();
  const coveragePercent = coverage.totalPoints > 0 ? (coverage.coveredPoints / coverage.totalPoints) * 100 : 0;
  const redundancyPercent = coverage.totalPoints > 0 ? (coverage.redundantPoints / coverage.totalPoints) * 100 : 0;

  return (
    <Card className="tactical-navy border-tactical-steel">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center">
          <Shield className="text-tactical-amber mr-2" size={20} />
          PERIMETER ANALYSIS
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-tactical-slate text-sm">STATUS</span>
              <Badge className={`${color} text-white font-bold`}>
                {text}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-tactical-slate text-sm">COVERAGE</span>
              <span className="text-white font-mono">{coveragePercent.toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-tactical-slate text-sm">REDUNDANCY</span>
              <span className="text-tactical-amber font-mono">{redundancyPercent.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-tactical-slate text-sm">CAMERAS</span>
              <span className="text-white font-mono">{activeCameras}/{cameras.length}</span>
            </div>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="border-t border-tactical-steel pt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
              <span className="text-tactical-slate">Secured Points</span>
            </div>
            <span className="text-white font-mono">{coverage.redundantPoints}/{coverage.totalPoints}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Eye className="w-4 h-4 text-yellow-500 mr-2" />
              <span className="text-tactical-slate">Single Coverage</span>
            </div>
            <span className="text-yellow-400 font-mono">{coverage.vulnerableAreas}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <XCircle className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-tactical-slate">Blind Spots</span>
            </div>
            <span className="text-red-400 font-mono">{coverage.totalPoints - coverage.coveredPoints}</span>
          </div>
        </div>

        {/* Alerts */}
        {status === 'critical' && (
          <Alert className="border-red-600 bg-red-900/20">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
              <strong>CRITICAL:</strong> Perimeter has significant blind spots. Deploy additional cameras or adjust positioning.
            </AlertDescription>
          </Alert>
        )}

        {coverage.vulnerableAreas > 0 && status !== 'critical' && (
          <Alert className="border-yellow-600 bg-yellow-900/20">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-300">
              <strong>WARNING:</strong> {coverage.vulnerableAreas} perimeter points have single camera coverage. Consider redundancy.
            </AlertDescription>
          </Alert>
        )}

        {status === 'optimal' && (
          <Alert className="border-green-600 bg-green-900/20">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">
              <strong>OPTIMAL:</strong> Perimeter fully secured with redundant coverage.
            </AlertDescription>
          </Alert>
        )}

        {/* Controls */}
        <div className="border-t border-tactical-steel pt-3 space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefault}
            className="w-full border-tactical-steel text-tactical-slate hover:bg-tactical-steel hover:text-white"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Reset to Riihimäki Base
          </Button>
        </div>

        {/* Recommendations */}
        <div className="text-xs text-tactical-slate">
          <div className="font-semibold text-tactical-amber mb-1">TACTICAL REQUIREMENTS:</div>
          <div>• Each perimeter point needs ≥2 camera coverage</div>
          <div>• Overlapping fields of view prevent blind spots</div>
          <div>• Active cameras only count toward coverage</div>
        </div>
      </CardContent>
    </Card>
  );
}