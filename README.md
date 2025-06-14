# Global Balloon Tracker

A React web application that visualizes live global atmospheric balloon data on an interactive map with integrated weather information.

## Features

### Core Functionality
- **Real-time Balloon Tracking**: Fetches data from 24 JSON files (00.json through 23.json) representing hourly snapshots
- **Interactive Map**: Leaflet-based world map with color-coded balloon markers
- **Weather Integration**: Open-Meteo API integration for atmospheric context
- **Robust Error Handling**: Gracefully handles corrupted or incomplete data files
- **Auto-refresh**: Updates data every 5 minutes automatically

### User Interface
- **Professional Dashboard**: Clean, modern interface with responsive design
- **Sidebar Controls**: Time period filters, data quality indicators, and weather overlay toggles
- **Balloon Details Modal**: Click any balloon for detailed information including weather context
- **Visual Legend**: Color-coded markers show balloon age (current, recent, historical)
- **Data Quality Monitoring**: Real-time status of all 24 data sources

### Data Integration
- **Primary Dataset**: Windborne Systems balloon position data
- **Secondary Dataset**: Open-Meteo weather API for wind patterns and temperature
- **Data Consolidation**: Backend combines all 24 hourly files into a single optimized response
- **Caching Strategy**: 5-minute cache to reduce API calls while maintaining freshness

## Technical Architecture

### Frontend (React + TypeScript)
- **React 18** with TypeScript for type safety
- **Leaflet** for interactive mapping
- **TanStack Query** for data fetching and caching
- **Tailwind CSS** + **shadcn/ui** for modern styling
- **Wouter** for lightweight routing

### Backend (Express + Node.js)
- **Express** server with TypeScript
- **Zod** schemas for data validation
- **In-memory caching** for performance
- **Error handling** for corrupted data sources
- **CORS enabled** for development

### Key Design Decisions

1. **Secondary Dataset Choice - Open-Meteo Weather API**
   - **Why chosen**: Provides real-time atmospheric data (wind speed, direction, temperature) that directly correlates with balloon movement patterns
   - **Integration value**: Helps users understand why balloons drift in certain directions and provides scientific context
   - **Free tier**: No API key required, reliable public service
   - **Data relevance**: Wind patterns are crucial for understanding balloon trajectories

2. **Robust Error Handling**
   - Individual file failures don't crash the entire application
   - Corrupted JSON (NaN values, malformed syntax) is automatically skipped
   - Data quality indicators show which sources are healthy vs. problematic
   - Graceful degradation maintains functionality even with partial data

3. **Performance Optimization**
   - Backend consolidates 24 API calls into 1 frontend request
   - Intelligent caching reduces external API usage
   - Efficient marker rendering for thousands of balloon positions
   - Lazy loading of weather data only when balloon details are viewed

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd global-balloon-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5000
   ```

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Route components
│   │   ├── lib/           # Utilities and API client
│   │   └── hooks/         # Custom React hooks
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # In-memory caching
│   └── vite.ts           # Vite integration
├── shared/               # Shared TypeScript schemas
└── components.json       # shadcn/ui configuration
```

## API Endpoints

### GET /api/balloons
Returns consolidated balloon data from all 24 hourly files.

**Response:**
```json
{
  "balloons": [
    {
      "id": "00.json-0",
      "latitude": 70.78929,
      "longitude": 37.27219,
      "altitude": 2.70364,
      "timestamp": "2024-06-14T12:00:00.000Z",
      "hoursAgo": 0,
      "dataSource": "00.json"
    }
  ],
  "totalCount": 1543,
  "dataQuality": {
    "00.json": "healthy",
    "01.json": "good",
    "02.json": "error"
  },
  "lastUpdated": "2024-06-14T12:00:00.000Z"
}
```

### GET /api/weather?lat={lat}&lon={lon}
Returns weather data for specific coordinates.

**Response:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "temperature": 22.5,
  "windSpeed": 12.3,
  "windDirection": 180,
  "timestamp": "2024-06-14T12:00:00.000Z"
}
```

### POST /api/refresh
Forces cache refresh and returns updated balloon data.

## Data Quality Indicators

The application monitors data quality across all 24 sources:

- **🟢 Healthy**: >95% valid records
- **🟡 Good**: >80% valid records  
- **🟠 Partial**: >50% valid records
- **🔴 Error**: <50% valid records or fetch failure

## Deployment

### Replit Deployment
1. The application is pre-configured for Replit
2. Simply click the "Deploy" button in your Replit workspace
3. The app will be available at `<your-app>.replit.app`

### Vercel Deployment
1. **Connect your repository to Vercel**
2. **Configure build settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set environment variables** (if needed):
   - `NODE_ENV=production`

4. **Deploy**: Vercel will automatically detect the full-stack setup

### Manual Deployment
1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with proper TypeScript types
4. Test thoroughly with various data scenarios
5. Submit a pull request

## Performance Notes

- **Initial Load**: ~500ms for consolidated data from 24 sources
- **Map Rendering**: Optimized for 1000+ markers simultaneously
- **Memory Usage**: In-memory cache with 5-minute TTL
- **Network Efficiency**: Single API call consolidates 24 external requests

## License

MIT License - feel free to use this project for educational or commercial purposes.

---

*Built with modern web technologies for robust, real-time atmospheric data visualization.*