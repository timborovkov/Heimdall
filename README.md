# Heimdall - Drone Detection System

A military-style tactical drone detection system with interactive aerial mapping and camera management capabilities.

## Features

- **Real-time Tactical Map**: Interactive satellite view with camera positions and field-of-view visualization
- **Camera Network Management**: Deploy, configure, and monitor surveillance cameras
- **Database Persistence**: PostgreSQL database for permanent data storage
- **Military UI Design**: Dark tactical interface with amber accents
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Modern web browser

### Installation

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Fill in your database credentials in `.env`
4. Install dependencies:
   ```bash
   npm install
   ```
5. Set up the database:
   ```bash
   npm run db:push
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## Environment Variables

See `.env.example` for all required environment variables. Key variables include:

- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 5000)

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Wouter
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Map**: Leaflet with satellite imagery
- **UI Components**: Radix UI, shadcn/ui

## Usage

1. **Deploy Cameras**: Click "DEPLOY CAMERA" to add new surveillance cameras
2. **Configure Settings**: Set camera position, range, field of view, and direction
3. **Monitor Status**: View camera status and network health in the control panel
4. **Tactical Overview**: Monitor all cameras on the interactive map

## Database Schema

The system uses a single `cameras` table with the following fields:
- `id`: Primary key
- `cameraId`: Unique camera identifier
- `latitude/longitude`: GPS coordinates (stored as integers for precision)
- `range`: Detection range in meters
- `fov`: Field of view in degrees
- `direction`: Camera direction (0-360 degrees)
- `status`: Camera status (active/maintenance/offline)
- `cameraType`: Camera type (Standard/Thermal/Night Vision/High Resolution)
- `lastDetection`: Timestamp of last detection

## Development

### Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run db:push`: Push database schema changes

### Project Structure

```
├── client/          # Frontend React application
├── server/          # Backend Express server
├── shared/          # Shared types and schemas
├── .env.example     # Environment variables template
└── README.md        # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.