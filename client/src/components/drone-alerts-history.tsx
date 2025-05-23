import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Clock, MapPin, Eye, Filter, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DroneAlert } from "@shared/schema";

interface DroneAlertsHistoryProps {
  onViewTrajectory: (alert: DroneAlert) => void;
}

export default function DroneAlertsHistory({ onViewTrajectory }: DroneAlertsHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [threatFilter, setThreatFilter] = useState("all");

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['/api/drone-alerts'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const filteredAlerts = alerts.filter((alert: DroneAlert) => {
    const matchesSearch = !searchTerm || 
      alert.cameraId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.droneType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.notes && alert.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || alert.status === statusFilter;
    const matchesThreat = threatFilter === "all" || alert.threatLevel === threatFilter;
    
    return matchesSearch && matchesStatus && matchesThreat;
  });

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'bg-red-600 text-red-100';
      case 'High': return 'bg-red-500 text-red-100';
      case 'Medium': return 'bg-orange-500 text-orange-100';
      case 'Low': return 'bg-yellow-500 text-yellow-100';
      default: return 'bg-gray-500 text-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-500 text-red-100';
      case 'tracking': return 'bg-orange-500 text-orange-100';
      case 'lost': return 'bg-gray-500 text-gray-100';
      case 'neutralized': return 'bg-green-500 text-green-100';
      default: return 'bg-gray-500 text-gray-100';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const detected = new Date(timestamp);
    const diffMs = now.getTime() - detected.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    return `${Math.floor(diffSecs / 86400)}d ago`;
  };

  if (isLoading) {
    return (
      <Card className="tactical-navy border-tactical-steel">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tactical-amber mx-auto"></div>
          <p className="text-tactical-slate mt-2">Loading drone alerts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="tactical-navy border-tactical-steel">
      <CardHeader className="tactical-charcoal border-b border-tactical-steel">
        <CardTitle className="text-white flex items-center">
          <AlertTriangle className="text-tactical-amber mr-2" size={20} />
          DRONE ALERT HISTORY
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tactical-slate w-4 h-4" />
              <Input
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 tactical-charcoal border-tactical-steel text-white placeholder:text-tactical-slate"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 tactical-charcoal border-tactical-steel text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="tactical-navy border-tactical-steel">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="tracking">Tracking</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="neutralized">Neutralized</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={threatFilter} onValueChange={setThreatFilter}>
            <SelectTrigger className="w-40 tactical-charcoal border-tactical-steel text-white">
              <SelectValue placeholder="Threat Level" />
            </SelectTrigger>
            <SelectContent className="tactical-navy border-tactical-steel">
              <SelectItem value="all">All Threats</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="tactical-charcoal p-3 rounded border border-tactical-steel">
            <div className="text-tactical-amber text-2xl font-bold">
              {alerts.length}
            </div>
            <div className="text-tactical-slate text-sm">Total Alerts</div>
          </div>
          <div className="tactical-charcoal p-3 rounded border border-tactical-steel">
            <div className="text-red-400 text-2xl font-bold">
              {alerts.filter((a: DroneAlert) => a.status === 'active').length}
            </div>
            <div className="text-tactical-slate text-sm">Active</div>
          </div>
          <div className="tactical-charcoal p-3 rounded border border-tactical-steel">
            <div className="text-orange-400 text-2xl font-bold">
              {alerts.filter((a: DroneAlert) => a.threatLevel === 'Critical' || a.threatLevel === 'High').length}
            </div>
            <div className="text-tactical-slate text-sm">High Priority</div>
          </div>
          <div className="tactical-charcoal p-3 rounded border border-tactical-steel">
            <div className="text-green-400 text-2xl font-bold">
              {alerts.filter((a: DroneAlert) => a.status === 'neutralized').length}
            </div>
            <div className="text-tactical-slate text-sm">Neutralized</div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-tactical-slate mx-auto mb-4" />
              <p className="text-tactical-slate">No drone alerts found</p>
              <p className="text-tactical-slate text-sm">All clear - no threats detected</p>
            </div>
          ) : (
            filteredAlerts.map((alert: DroneAlert) => {
              const lat = alert.latitude / 1000000;
              const lng = alert.longitude / 1000000;
              
              return (
                <div
                  key={alert.id}
                  className="tactical-charcoal border border-tactical-steel rounded p-4 hover:border-tactical-amber transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-5 h-5 text-tactical-amber" />
                      <div>
                        <h4 className="text-white font-semibold">
                          {alert.droneType} Drone
                        </h4>
                        <p className="text-tactical-slate text-sm">
                          Camera {alert.cameraId}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getThreatColor(alert.threatLevel)}>
                        {alert.threatLevel}
                      </Badge>
                      <Badge className={getStatusColor(alert.status)}>
                        {alert.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-tactical-slate text-xs">Confidence</div>
                      <div className="text-white font-mono">{alert.confidence}%</div>
                    </div>
                    <div>
                      <div className="text-tactical-slate text-xs">Speed</div>
                      <div className="text-white font-mono">{alert.speed} km/h</div>
                    </div>
                    <div>
                      <div className="text-tactical-slate text-xs">Altitude</div>
                      <div className="text-white font-mono">{alert.altitude}m</div>
                    </div>
                    <div>
                      <div className="text-tactical-slate text-xs">Heading</div>
                      <div className="text-white font-mono">{alert.heading}°</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center text-tactical-slate">
                        <MapPin className="w-4 h-4 mr-1" />
                        {lat.toFixed(4)}, {lng.toFixed(4)}
                      </div>
                      <div className="flex items-center text-tactical-slate">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatTimeAgo(alert.detectedAt)}
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => onViewTrajectory(alert)}
                      variant="outline"
                      size="sm"
                      className="border-tactical-amber text-tactical-amber hover:bg-tactical-amber hover:text-black"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Trajectory
                    </Button>
                  </div>
                  
                  {alert.notes && (
                    <div className="mt-3 pt-3 border-t border-tactical-steel">
                      <div className="text-tactical-slate text-sm">
                        <strong>Notes:</strong> {alert.notes}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}