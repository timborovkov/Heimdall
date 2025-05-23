import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Cpu, HardDrive, Wifi, Zap, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import type { Camera } from "@shared/schema";

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  uptime: number;
  activeCameras: number;
  totalCameras: number;
  dataTransfer: number;
  systemLoad: number;
  temperature: number;
}

interface SystemHealthDashboardProps {
  cameras: Camera[];
}

export default function SystemHealthDashboard({ cameras }: SystemHealthDashboardProps) {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkLatency: 0,
    uptime: 0,
    activeCameras: 0,
    totalCameras: 0,
    dataTransfer: 0,
    systemLoad: 0,
    temperature: 0,
  });

  const [animationKey, setAnimationKey] = useState(0);

  // Simulate real-time system metrics
  useEffect(() => {
    const updateMetrics = () => {
      const activeCameras = cameras.filter(c => c.status === 'active').length;
      const totalCameras = cameras.length;
      
      // Generate realistic system metrics with small variations
      setMetrics(prev => ({
        cpuUsage: Math.max(15, Math.min(85, prev.cpuUsage + (Math.random() - 0.5) * 8)),
        memoryUsage: Math.max(30, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        diskUsage: Math.max(45, Math.min(75, prev.diskUsage + (Math.random() - 0.5) * 2)),
        networkLatency: Math.max(8, Math.min(45, prev.networkLatency + (Math.random() - 0.5) * 6)),
        uptime: prev.uptime + 2,
        activeCameras,
        totalCameras,
        dataTransfer: Math.max(50, Math.min(500, prev.dataTransfer + (Math.random() - 0.5) * 30)),
        systemLoad: activeCameras > 0 ? (activeCameras / totalCameras) * 100 : 0,
        temperature: Math.max(35, Math.min(65, prev.temperature + (Math.random() - 0.5) * 3)),
      }));
      
      setAnimationKey(prev => prev + 1);
    };

    // Initialize with realistic starting values
    setMetrics({
      cpuUsage: 45 + Math.random() * 20,
      memoryUsage: 60 + Math.random() * 15,
      diskUsage: 55 + Math.random() * 10,
      networkLatency: 15 + Math.random() * 10,
      uptime: 86400 * 7, // 7 days
      activeCameras: cameras.filter(c => c.status === 'active').length,
      totalCameras: cameras.length,
      dataTransfer: 150 + Math.random() * 100,
      systemLoad: cameras.length > 0 ? (cameras.filter(c => c.status === 'active').length / cameras.length) * 100 : 0,
      temperature: 42 + Math.random() * 8,
    });

    const interval = setInterval(updateMetrics, 2000);
    return () => clearInterval(interval);
  }, [cameras]);

  const getHealthStatus = () => {
    const criticalThresholds = {
      cpu: 80,
      memory: 85,
      disk: 90,
      temperature: 60,
      latency: 100,
    };

    const issues = [
      metrics.cpuUsage > criticalThresholds.cpu,
      metrics.memoryUsage > criticalThresholds.memory,
      metrics.diskUsage > criticalThresholds.disk,
      metrics.temperature > criticalThresholds.temperature,
      metrics.networkLatency > criticalThresholds.latency,
    ].filter(Boolean).length;

    if (issues === 0) return { status: 'optimal', color: 'bg-green-500', text: 'OPTIMAL' };
    if (issues <= 1) return { status: 'good', color: 'bg-green-600', text: 'GOOD' };
    if (issues <= 2) return { status: 'warning', color: 'bg-yellow-500', text: 'WARNING' };
    return { status: 'critical', color: 'bg-red-500', text: 'CRITICAL' };
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getProgressColor = (value: number, type: 'cpu' | 'memory' | 'disk' | 'temp') => {
    const thresholds = {
      cpu: { warning: 60, critical: 80 },
      memory: { warning: 70, critical: 85 },
      disk: { warning: 80, critical: 90 },
      temp: { warning: 50, critical: 60 },
    };

    const threshold = thresholds[type];
    if (value >= threshold.critical) return 'bg-red-500';
    if (value >= threshold.warning) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const { status, color, text } = getHealthStatus();

  return (
    <div className="space-y-4">
      {/* System Status Header */}
      <Card className="tactical-navy border-tactical-steel">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <Activity className="text-tactical-amber mr-2 animate-pulse" size={20} />
              SYSTEM HEALTH
            </CardTitle>
            <Badge className={`${color} text-white font-bold animate-pulse`}>
              {text}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Core Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* CPU Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Cpu className="w-4 h-4 text-tactical-amber mr-2" />
                  <span className="text-tactical-slate text-sm">CPU</span>
                </div>
                <span className="text-white font-mono text-sm">{metrics.cpuUsage.toFixed(1)}%</span>
              </div>
              <div className="relative">
                <Progress 
                  value={metrics.cpuUsage} 
                  className={`h-2 transition-all duration-1000 ease-in-out ${getProgressColor(metrics.cpuUsage, 'cpu')}`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
              </div>
            </div>

            {/* Memory Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <HardDrive className="w-4 h-4 text-tactical-amber mr-2" />
                  <span className="text-tactical-slate text-sm">Memory</span>
                </div>
                <span className="text-white font-mono text-sm">{metrics.memoryUsage.toFixed(1)}%</span>
              </div>
              <div className="relative">
                <Progress 
                  value={metrics.memoryUsage} 
                  className={`h-2 transition-all duration-1000 ease-in-out ${getProgressColor(metrics.memoryUsage, 'memory')}`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
              </div>
            </div>

            {/* Disk Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <HardDrive className="w-4 h-4 text-tactical-amber mr-2" />
                  <span className="text-tactical-slate text-sm">Storage</span>
                </div>
                <span className="text-white font-mono text-sm">{metrics.diskUsage.toFixed(1)}%</span>
              </div>
              <div className="relative">
                <Progress 
                  value={metrics.diskUsage} 
                  className={`h-2 transition-all duration-1000 ease-in-out ${getProgressColor(metrics.diskUsage, 'disk')}`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
              </div>
            </div>

            {/* Temperature */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Zap className="w-4 h-4 text-tactical-amber mr-2" />
                  <span className="text-tactical-slate text-sm">Temp</span>
                </div>
                <span className="text-white font-mono text-sm">{metrics.temperature.toFixed(1)}°C</span>
              </div>
              <div className="relative">
                <Progress 
                  value={(metrics.temperature / 70) * 100} 
                  className={`h-2 transition-all duration-1000 ease-in-out ${getProgressColor(metrics.temperature, 'temp')}`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
              </div>
            </div>
          </div>

          {/* Network & Performance */}
          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-tactical-steel">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Wifi className="w-4 h-4 text-tactical-amber animate-bounce" />
              </div>
              <div className="text-white font-mono text-sm">{metrics.networkLatency.toFixed(0)}ms</div>
              <div className="text-tactical-slate text-xs">Latency</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="w-4 h-4 text-tactical-amber animate-pulse" />
              </div>
              <div className="text-white font-mono text-sm">{metrics.dataTransfer.toFixed(0)}MB/s</div>
              <div className="text-tactical-slate text-xs">Data Flow</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Activity className="w-4 h-4 text-tactical-amber animate-pulse" />
              </div>
              <div className="text-white font-mono text-sm">{formatUptime(metrics.uptime)}</div>
              <div className="text-tactical-slate text-xs">Uptime</div>
            </div>
          </div>

          {/* System Load */}
          <div className="pt-3 border-t border-tactical-steel">
            <div className="flex items-center justify-between mb-2">
              <span className="text-tactical-slate text-sm">System Load</span>
              <span className="text-tactical-amber font-mono text-sm">
                {metrics.activeCameras}/{metrics.totalCameras} Active
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={metrics.systemLoad} 
                className="h-3 transition-all duration-1000 ease-in-out bg-green-500"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-tactical-amber/20 via-tactical-amber/40 to-tactical-amber/20 animate-pulse rounded" />
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center justify-between pt-3 border-t border-tactical-steel">
            <div className="flex items-center space-x-4">
              {status === 'optimal' || status === 'good' ? (
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mr-1 animate-pulse" />
                  <span className="text-green-400 text-xs">All Systems Nominal</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mr-1 animate-bounce" />
                  <span className="text-yellow-400 text-xs">Performance Warning</span>
                </div>
              )}
            </div>
            
            <div className="text-tactical-slate text-xs">
              Last Update: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}