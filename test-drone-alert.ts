import { db } from './server/db';
import { droneAlerts } from './shared/schema';

// Create a realistic drone detection to test the alert system
const testDroneAlert = {
  cameraId: "HEIMDALL-N1",
  latitude: Math.round(60.7510 * 1000000), // Near industrial area
  longitude: Math.round(24.7735 * 1000000),
  altitude: 85, // 85 meters altitude
  confidence: 94, // 94% confidence
  speed: 28, // 28 km/h
  heading: 225, // Southwest direction
  droneType: "Unknown",
  threatLevel: "High",
  status: "active",
  estimatedTrajectory: JSON.stringify([
    { lat: 60.7510, lng: 24.7735, estimatedTime: "Now", confidence: 94 },
    { lat: 60.7505, lng: 24.7730, estimatedTime: "+30s", confidence: 88 },
    { lat: 60.7500, lng: 24.7725, estimatedTime: "+1m", confidence: 82 },
    { lat: 60.7495, lng: 24.7720, estimatedTime: "+1.5m", confidence: 76 },
    { lat: 60.7490, lng: 24.7715, estimatedTime: "+2m", confidence: 70 }
  ]),
  notes: "Fast-moving object detected approaching industrial zone. Maintain visual contact."
};

async function createTestAlert() {
  try {
    console.log('🚁 Creating test drone detection alert...');
    
    const alert = await db.insert(droneAlerts).values(testDroneAlert).returning();
    
    console.log('✅ Test drone alert created successfully!');
    console.log(`📡 Alert ID: ${alert[0].id}`);
    console.log(`🎯 Threat Level: ${alert[0].threatLevel}`);
    console.log(`📍 Position: ${alert[0].latitude / 1000000}, ${alert[0].longitude / 1000000}`);
    console.log(`⚡ Speed: ${alert[0].speed} km/h`);
    console.log(`🔍 Confidence: ${alert[0].confidence}%`);
    
  } catch (error) {
    console.error('❌ Failed to create test alert:', error);
    process.exit(1);
  }
}

// Execute test
createTestAlert().then(() => {
  console.log('🎖️  Test drone alert ready for display');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test alert creation failed:', error);
  process.exit(1);
});