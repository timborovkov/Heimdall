import { db } from './server/db';
import { cameras, droneAlerts } from './shared/schema';

// Strategic perimeter around Riihimäki, Finland
// Cameras positioned in a defensive perimeter with overlapping coverage
const perimeterCameras = [
  // North Perimeter - Industrial Zone Coverage
  {
    cameraId: "HEIMDALL-N1",
    latitude: Math.round(60.7520 * 1000000), // North industrial area
    longitude: Math.round(24.7729 * 1000000),
    altitude: 125,
    range: 800,
    fov: 90,
    yaw: 180, // Facing south
    pitch: -15,
    roll: 0,
    status: "active" as const,
    cameraType: "High Resolution" as const,
    feedUrl: "rtsp://north1.heimdall.tactical/live",
    feedUsername: "operator",
    feedPassword: "secure_north_1"
  },
  {
    cameraId: "HEIMDALL-N2",
    latitude: Math.round(60.7495 * 1000000),
    longitude: Math.round(24.7850 * 1000000), // Northeast position
    altitude: 110,
    range: 650,
    fov: 75,
    yaw: 225, // Facing southwest
    pitch: -10,
    roll: 0,
    status: "active" as const,
    cameraType: "Thermal Imaging" as const,
    feedUrl: "rtsp://north2.heimdall.tactical/thermal",
    feedUsername: "operator",
    feedPassword: "secure_north_2"
  },

  // East Perimeter - Highway and Transport Hub
  {
    cameraId: "HEIMDALL-E1",
    latitude: Math.round(60.7395 * 1000000),
    longitude: Math.round(24.7920 * 1000000), // East highway approach
    altitude: 95,
    range: 750,
    fov: 80,
    yaw: 270, // Facing west
    pitch: -12,
    roll: 0,
    status: "active" as const,
    cameraType: "Standard Surveillance" as const,
    feedUrl: "rtsp://east1.heimdall.tactical/live",
    feedUsername: "operator",
    feedPassword: "secure_east_1"
  },
  {
    cameraId: "HEIMDALL-E2",
    latitude: Math.round(60.7320 * 1000000),
    longitude: Math.round(24.7880 * 1000000), // Southeast rail junction
    altitude: 105,
    range: 900,
    fov: 95,
    yaw: 315, // Facing northwest
    pitch: -8,
    roll: 0,
    status: "active" as const,
    cameraType: "Night Vision" as const,
    feedUrl: "rtsp://east2.heimdall.tactical/nightvision",
    feedUsername: "operator",
    feedPassword: "secure_east_2"
  },

  // South Perimeter - Residential and Commercial Districts
  {
    cameraId: "HEIMDALL-S1",
    latitude: Math.round(60.7250 * 1000000), // South residential area
    longitude: Math.round(24.7729 * 1000000),
    altitude: 88,
    range: 600,
    fov: 85,
    yaw: 0, // Facing north
    pitch: -10,
    roll: 0,
    status: "active" as const,
    cameraType: "High Resolution" as const,
    feedUrl: "rtsp://south1.heimdall.tactical/live",
    feedUsername: "operator",
    feedPassword: "secure_south_1"
  },
  {
    cameraId: "HEIMDALL-S2",
    latitude: Math.round(60.7280 * 1000000),
    longitude: Math.round(24.7580 * 1000000), // Southwest commercial zone
    altitude: 92,
    range: 720,
    fov: 70,
    yaw: 45, // Facing northeast
    pitch: -15,
    roll: 0,
    status: "maintenance" as const,
    cameraType: "Standard Surveillance" as const,
    feedUrl: "rtsp://south2.heimdall.tactical/live",
    feedUsername: "operator",
    feedPassword: "secure_south_2"
  },

  // West Perimeter - Forest and Lake Access
  {
    cameraId: "HEIMDALL-W1",
    latitude: Math.round(60.7395 * 1000000),
    longitude: Math.round(24.7520 * 1000000), // West forest edge
    altitude: 115,
    range: 850,
    fov: 100,
    yaw: 90, // Facing east
    pitch: -5,
    roll: 0,
    status: "active" as const,
    cameraType: "Thermal Imaging" as const,
    feedUrl: "rtsp://west1.heimdall.tactical/thermal",
    feedUsername: "operator",
    feedPassword: "secure_west_1"
  },
  {
    cameraId: "HEIMDALL-W2",
    latitude: Math.round(60.7460 * 1000000),
    longitude: Math.round(24.7600 * 1000000), // Northwest lake access
    altitude: 100,
    range: 680,
    fov: 88,
    yaw: 135, // Facing southeast
    pitch: -18,
    roll: 0,
    status: "active" as const,
    cameraType: "Night Vision" as const,
    feedUrl: "rtsp://west2.heimdall.tactical/nightvision",
    feedUsername: "operator",
    feedPassword: "secure_west_2"
  },

  // Central Command Positions - Overlapping Coverage
  {
    cameraId: "HEIMDALL-C1",
    latitude: Math.round(60.7395 * 1000000), // Central position - elevated
    longitude: Math.round(24.7729 * 1000000),
    altitude: 140,
    range: 1000,
    fov: 120,
    yaw: 0, // Facing north
    pitch: -20,
    roll: 0,
    status: "active" as const,
    cameraType: "High Resolution" as const,
    feedUrl: "rtsp://central1.heimdall.tactical/live",
    feedUsername: "operator",
    feedPassword: "secure_central_1"
  },
  {
    cameraId: "HEIMDALL-C2",
    latitude: Math.round(60.7395 * 1000000), // Central position - secondary
    longitude: Math.round(24.7729 * 1000000),
    altitude: 135,
    range: 950,
    fov: 110,
    yaw: 180, // Facing south
    pitch: -25,
    roll: 0,
    status: "offline" as const, // One offline for testing
    cameraType: "Thermal Imaging" as const,
    feedUrl: "rtsp://central2.heimdall.tactical/thermal",
    feedUsername: "operator",
    feedPassword: "secure_central_2"
  },

  // Mobile Response Unit
  {
    cameraId: "HEIMDALL-M1",
    latitude: Math.round(60.7350 * 1000000), // Mobile patrol position
    longitude: Math.round(24.7680 * 1000000),
    altitude: 85,
    range: 500,
    fov: 60,
    yaw: 270, // Facing west
    pitch: -8,
    roll: 0,
    status: "active" as const,
    cameraType: "Standard Surveillance" as const,
    feedUrl: "rtsp://mobile1.heimdall.tactical/live",
    feedUsername: "operator",
    feedPassword: "secure_mobile_1"
  },

  // Emergency Backup Position
  {
    cameraId: "HEIMDALL-B1",
    latitude: Math.round(60.7440 * 1000000), // Backup high ground
    longitude: Math.round(24.7780 * 1000000),
    altitude: 160,
    range: 1200,
    fov: 140,
    yaw: 225, // Facing southwest
    pitch: -30,
    roll: 0,
    status: "maintenance" as const,
    cameraType: "Night Vision" as const,
    feedUrl: "rtsp://backup1.heimdall.tactical/nightvision",
    feedUsername: "operator",
    feedPassword: "secure_backup_1"
  }
];

// Sample drone alerts for realistic threat scenarios
const sampleDroneAlerts = [
  {
    cameraId: "HEIMDALL-N1",
    latitude: Math.round(60.7515 * 1000000),
    longitude: Math.round(24.7735 * 1000000),
    altitude: 85,
    confidence: 94,
    speed: 28,
    heading: 225,
    droneType: "Unknown",
    threatLevel: "High",
    status: "active",
    estimatedTrajectory: JSON.stringify([
      { lat: 60.7515, lng: 24.7735, estimatedTime: "Now", confidence: 94 },
      { lat: 60.7510, lng: 24.7730, estimatedTime: "+30s", confidence: 88 },
      { lat: 60.7505, lng: 24.7725, estimatedTime: "+1m", confidence: 82 },
      { lat: 60.7500, lng: 24.7720, estimatedTime: "+1.5m", confidence: 76 }
    ]),
    notes: "Fast-moving object detected approaching industrial zone. Maintain visual contact."
  },
  {
    cameraId: "HEIMDALL-E2",
    latitude: Math.round(60.7325 * 1000000),
    longitude: Math.round(24.7885 * 1000000),
    altitude: 120,
    confidence: 87,
    speed: 15,
    heading: 90,
    droneType: "Commercial",
    threatLevel: "Medium",
    status: "tracking",
    estimatedTrajectory: JSON.stringify([
      { lat: 60.7325, lng: 24.7885, estimatedTime: "Now", confidence: 87 },
      { lat: 60.7325, lng: 24.7890, estimatedTime: "+45s", confidence: 84 },
      { lat: 60.7325, lng: 24.7895, estimatedTime: "+1.5m", confidence: 80 }
    ]),
    notes: "Commercial drone conducting possible surveillance. Low speed suggests reconnaissance activity."
  },
  {
    cameraId: "HEIMDALL-C1",
    latitude: Math.round(60.7400 * 1000000),
    longitude: Math.round(24.7725 * 1000000),
    altitude: 200,
    confidence: 76,
    speed: 45,
    heading: 0,
    droneType: "Racing",
    threatLevel: "Low",
    status: "lost",
    estimatedTrajectory: JSON.stringify([
      { lat: 60.7400, lng: 24.7725, estimatedTime: "2m ago", confidence: 76 },
      { lat: 60.7410, lng: 24.7725, estimatedTime: "1.5m ago", confidence: 65 },
      { lat: 60.7420, lng: 24.7725, estimatedTime: "1m ago", confidence: 50 }
    ]),
    notes: "High-speed racing drone detected. Lost visual contact - likely moved out of range."
  }
];

async function seedCameras() {
  try {
    console.log('🎯 Seeding Heimdall Tactical Camera Network...');
    
    // Clear existing data
    console.log('📡 Clearing existing camera deployments and alerts...');
    await db.delete(droneAlerts);
    await db.delete(cameras);
    
    // Insert perimeter cameras
    console.log('🚁 Deploying tactical perimeter cameras...');
    const deployedCameras = await db.insert(cameras).values(perimeterCameras).returning();
    
    // Insert sample drone alerts
    console.log('🚨 Creating sample drone threat scenarios...');
    const deployedAlerts = await db.insert(droneAlerts).values(sampleDroneAlerts).returning();
    
    console.log(`✅ Successfully deployed ${deployedCameras.length} cameras in strategic perimeter formation`);
    console.log('🛡️  Tactical Coverage Analysis:');
    console.log(`   • Active Cameras: ${deployedCameras.filter(c => c.status === 'active').length}`);
    console.log(`   • Maintenance Mode: ${deployedCameras.filter(c => c.status === 'maintenance').length}`);
    console.log(`   • Offline Units: ${deployedCameras.filter(c => c.status === 'offline').length}`);
    console.log('🎖️  Camera Types Deployed:');
    console.log(`   • High Resolution: ${deployedCameras.filter(c => c.cameraType === 'High Resolution').length}`);
    console.log(`   • Thermal Imaging: ${deployedCameras.filter(c => c.cameraType === 'Thermal Imaging').length}`);
    console.log(`   • Night Vision: ${deployedCameras.filter(c => c.cameraType === 'Night Vision').length}`);
    console.log(`   • Standard Surveillance: ${deployedCameras.filter(c => c.cameraType === 'Standard Surveillance').length}`);
    
    console.log(`\n🚨 Threat Alert System Initialized with ${deployedAlerts.length} sample scenarios:`);
    console.log(`   • Active Threats: ${deployedAlerts.filter(a => a.status === 'active').length}`);
    console.log(`   • Tracking Mode: ${deployedAlerts.filter(a => a.status === 'tracking').length}`);
    console.log(`   • Lost Contact: ${deployedAlerts.filter(a => a.status === 'lost').length}`);
    console.log(`   • High Priority: ${deployedAlerts.filter(a => a.threatLevel === 'High').length}`);
    
    console.log('\n🎯 Heimdall Tactical Network Deployment Complete!');
    console.log('📍 Perimeter established around Riihimäki, Finland');
    console.log('🔒 All feed credentials configured for secure access');
    console.log('⚠️  Drone detection system active with threat scenarios');
    
  } catch (error) {
    console.error('❌ Camera deployment failed:', error);
    process.exit(1);
  }
}

// Execute seeding
seedCameras().then(() => {
  console.log('🎖️  Heimdall system ready for operations');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Critical deployment failure:', error);
  process.exit(1);
});