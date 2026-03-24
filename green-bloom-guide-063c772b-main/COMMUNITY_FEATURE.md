# Community Plant Feature - Setup Instructions

## Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the backend server:**
   ```bash
   npm start
   ```
   
   The server will run on `http://localhost:3001`

## Frontend Setup

1. **Start the frontend (in a new terminal):**
   ```bash
   npm run dev
   ```
   
   The frontend will run on `http://localhost:8080`

## API Endpoints

### Get All Plants
```
GET http://localhost:3001/api/plants
```
Returns all plants (CSV data + community plants)

### Add New Plant
```
POST http://localhost:3001/api/add-plant
Content-Type: application/json

{
  "name": "Rose Plant",
  "place": "home",
  "indoorOutdoor": "outdoor",
  "sunlight": "full",
  "soil": "soil",
  "area": "medium",
  "pollutionTolerance": "medium",
  "maintenance": "medium",
  "watering": "weekly",
  "plantingMethod": "Use well-draining soil"
}
```

### Get Community Plants Only
```
GET http://localhost:3001/api/community-plants
```

### Health Check
```
GET http://localhost:3001/api/health
```

## Features

✅ **Dynamic Plant Addition**: Users can add new plants through the form
✅ **Data Persistence**: Community plants are saved in `backend/community-plants.json`
✅ **Duplicate Prevention**: Same plant names are not allowed
✅ **API Integration**: Frontend fetches data from backend instead of static CSV
✅ **Fallback Support**: Falls back to CSV if API is unavailable
✅ **Real-time Updates**: New plants appear immediately in recommendations

## Data Flow

1. **Backend loads CSV data** on startup
2. **Backend loads community plants** from JSON file
3. **Frontend requests plants** from API
4. **Users add new plants** via form
5. **Backend validates and saves** new plants
6. **Frontend refreshes** to show new plants

## File Structure

```
backend/
├── server.js                 # Express server with API endpoints
├── community-plants.json     # Community-added plants (auto-created)
├── package.json             # Backend dependencies

src/
├── data/
│   ├── apiService.ts        # API client functions
│   ├── plants.ts            # Updated to use API
│   └── dataLoader.ts        # CSV parsing utilities
├── components/
│   └── AddPlantForm.tsx     # Plant addition form
```

## Usage

1. Start both backend and frontend servers
2. Use the AddPlantForm component to add new plants
3. New plants will appear in all plant recommendations
4. Community plants are persisted across server restarts
