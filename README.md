# Smart City 3D

An interactive 3D smart city simulation built with React, Three.js, and React Three Fiber.

## Features

- **Procedural city** — hundreds of instanced buildings across glass, corporate, and residential types with stepped profiles and canvas-generated facade textures
- **Day / Night toggle** — physically-based sky and sun shadows in day mode; glowing windows, neon road markings, and bloom post-processing at night
- **Traffic system** — cars in separated lanes, animated traffic lights, and pedestrians walking the sidewalks
- **Street furniture** — street lights, trees, neon billboards on building facades, and a central fountain
- **Live HUD** — city dashboard overlay with population, air quality, and route stats

## Tech Stack

| Package | Version | Role |
|---|---|---|
| React | 18 | UI + component tree |
| Three.js | 0.163 | 3D rendering |
| @react-three/fiber | 8 | React renderer for Three.js |
| @react-three/drei | 9 | Sky, Stars, OrbitControls, Grid helpers |
| @react-three/postprocessing | 2 | Bloom effect |
| Vite | 5 | Dev server + bundler |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Controls

| Input | Action |
|---|---|
| Left drag | Rotate camera |
| Scroll | Zoom in / out |
| Right drag | Pan |
| Toggle button (top centre) | Switch day / night |

## Project Structure

```
src/
├── App.jsx               # Canvas setup, lighting, day/night state
├── SceneContext.jsx       # React context for isDaytime flag
├── cityData.js            # Shared seeded building layout data
└── components/
    ├── CityGrid.jsx       # Instanced building meshes
    ├── Roads.jsx          # Road surfaces with day/night materials
    ├── Cars.jsx           # Animated traffic
    ├── TrafficLights.jsx  # Animated signal lights
    ├── Pedestrians.jsx    # Walking figures
    ├── StreetLights.jsx   # Lamp posts with night point lights
    ├── Trees.jsx          # Foliage with road-avoidance
    ├── Billboards.jsx     # Neon ad panels on building facades
    ├── Fountain.jsx       # Animated water jet in central plaza
    └── LoadingScreen.jsx  # Startup progress screen
```
