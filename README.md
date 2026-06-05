# Smart City 3D

An interactive 3D smart city simulation built with React, Three.js, and React Three Fiber. Starts in bird's-eye night view and auto-rotates above a procedurally generated downtown skyline.

## Features

- **Procedural city** — hundreds of instanced buildings with center-biased height (taller glass towers downtown, shorter residential on the outskirts) and five facade types with canvas-generated textures, per-instance brightness variation, stepped roofline tiers, roof parapets, HVAC units, elevator shaft housings, water towers, and glass tower crowns
- **Day / Night toggle** — physically-based sky and sun shadows in day mode; glowing windows, neon road markings, bloom post-processing, and a star field at night; clouds visible in both modes (moonlit at night)
- **Interactivity** — click any building, car, emergency vehicle, or helicopter to open a live info panel (type, height, speed, status, etc.); cursor changes on hover; click ground or sky to dismiss
- **Traffic system** — fully instanced cars (7 shared draw calls for 60+ vehicles), animated traffic lights, emergency vehicles with flashing light bars, and pedestrians walking the sidewalks
- **Airspace** — two helicopters in separate orbits with spinning rotors and strobing belly lights; moving cloud layers in both day and night modes
- **Street furniture** — street lights with night point lights, trees, neon billboards, a central fountain, and crosswalks
- **Live HUD** — city dashboard overlay with population, air quality, and route stats; coordinate and control reference in the corners
- **Bird's-eye camera** — defaults to a top-down overhead view at altitude 120 with slow auto-rotation; fully orbitable and zoomable

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
| Click building / vehicle | Open info panel |
| Toggle button (top centre) | Switch day / night |

## Project Structure

```
src/
├── App.jsx               # Canvas setup, lighting, day/night + selected state
├── SceneContext.jsx       # React context — isDaytime, selected, setSelected
├── cityData.js            # Seeded building layout with center-biased height and type
└── components/
    ├── CityGrid.jsx       # Instanced buildings, rooftop features, click hitboxes
    ├── InfoPanel.jsx      # Floating info panel for clicked objects
    ├── Cars.jsx           # Instanced traffic (7 draw calls for 60+ cars)
    ├── EmergencyVehicles.jsx  # Ambulance and police car with flashing lights
    ├── Helicopter.jsx     # Two orbiting helicopters with rotor animation
    ├── MovingClouds.jsx   # Sprite cloud layers, day and night
    ├── Roads.jsx          # Road surfaces
    ├── TrafficLights.jsx  # Animated signal lights
    ├── Pedestrians.jsx    # Walking figures
    ├── StreetLights.jsx   # Lamp posts with night point lights
    ├── Trees.jsx          # Foliage
    ├── Billboards.jsx     # Neon ad panels
    ├── Fountain.jsx       # Animated water jet
    ├── Crosswalks.jsx     # Crosswalk markings
    └── LoadingScreen.jsx  # Startup screen
```
