import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L, { Icon } from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import placeholderIcon from "../icons/mapPointer.png";

type LatLng = [number, number];
type Graph = { [key: string]: { [key: string]: number } };

// Create custom icon
const customIcon = new Icon({
  iconUrl: placeholderIcon,
  iconSize: [38, 38] // size of the icon
});

// Custom cluster icon
// const createClusterCustomIcon = function (cluster) {
//   return new DivIcon({
//     html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
//     className: "custom-marker-cluster",
//     iconSize: [33, 33]
//   });
// };

// Implement BFS algorithm as described earlier
const bfs = (graph: Graph, start: string, end: string): string[] => {
  const queue: string[] = [start];
  const visited: { [key: string]: boolean } = {};
  const previous: { [key: string]: string | null } = {};

  visited[start] = true;

  while (queue.length > 0) {
    const node = queue.shift()!;

    if (node === end) {
      const path: string[] = [];
      let current: string | null = end;
      while (current && previous[current]) {
        path.unshift(current);
        current = previous[current];
      }
      path.unshift(start);
      return path;
    }

    for (let neighbor in graph[node]) {
      if (!visited[neighbor]) {
        visited[neighbor] = true;
        previous[neighbor] = node;
        queue.push(neighbor);
      }
    }
  }

  return [];
};

const dijkstra = (graph: Graph, start: string, end: string): string[] => {
  const distances: { [key: string]: number } = {};
  const previous: { [key: string]: string | null } = {};
  const queue = new PriorityQueue();

  for (let vertex in graph) {
    distances[vertex] = Infinity;
    queue.enqueue(vertex, Infinity);
  }

  distances[start] = 0;
  queue.enqueue(start, 0);

  while (!queue.isEmpty()) {
    const { value: smallest } = queue.dequeue()!;

    if (smallest === end) {
      const path: string[] = [];
      let current: string | null = end;
      while (current && previous[current]) {
        path.unshift(current);
        current = previous[current];
      }
      path.unshift(start);
      return path;
    }

    if (smallest || distances[smallest] !== Infinity) {
      for (let neighbor in graph[smallest]) {
        const alt = distances[smallest] + graph[smallest][neighbor];
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = smallest;
          queue.enqueue(neighbor, alt);
        }
      }
    }
  }

  return [];
};

// A* algorithm for shortest path
const aStar = (graph: Graph, start: string, end: string, heuristics: { [key: string]: number }): string[] => {
  const openSet: Set<string> = new Set([start]);
  const cameFrom: { [key: string]: string | null } = {};
  const gScore: { [key: string]: number } = {};
  const fScore: { [key: string]: number } = {};

  gScore[start] = 0;
  fScore[start] = heuristics[start] || 0;

  while (openSet.size > 0) {
    const current = Array.from(openSet).reduce((a, b) => fScore[a] < fScore[b] ? a : b);

    if (current === end) {
      const path: string[] = [];
      let temp: string | null = end;
      while (temp) {
        path.unshift(temp);
        temp = cameFrom[temp] || null;
      }
      return path;
    }

    openSet.delete(current);

    for (let neighbor in graph[current]) {
      const tentativeGScore = (gScore[current] || Infinity) + graph[current][neighbor];
      if (tentativeGScore < (gScore[neighbor] || Infinity)) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = tentativeGScore;
        fScore[neighbor] = tentativeGScore + (heuristics[neighbor] || 0);
        openSet.add(neighbor);
      }
    }
  }

  return [];
};

// Greedy Best-First Search algorithm for shortest path
const greedyBestFirst = (graph: Graph, start: string, end: string, heuristics: { [key: string]: number }): string[] => {
  const openSet: Set<string> = new Set([start]);
  const cameFrom: { [key: string]: string | null } = {};

  while (openSet.size > 0) {
    const current = Array.from(openSet).reduce((a, b) => heuristics[a] < heuristics[b] ? a : b);

    if (current === end) {
      const path: string[] = [];
      let temp: string | null = end;
      while (temp) {
        path.unshift(temp);
        temp = cameFrom[temp] || null;
      }
      return path;
    }

    openSet.delete(current);

    for (let neighbor in graph[current]) {
      if (!cameFrom[neighbor]) {
        cameFrom[neighbor] = current;
        openSet.add(neighbor);
      }
    }
  }

  return [];
};

// Priority Queue implementation
class PriorityQueue {
  collection: { value: string; priority: number }[];

  constructor() {
    this.collection = [];
  }

  enqueue(element: string, priority: number) {
    const queueElement = { value: element, priority };
    if (this.isEmpty()) {
      this.collection.push(queueElement);
    } else {
      const added = this.collection.some((_, i) => {
        if (queueElement.priority < this.collection[i].priority) {
          this.collection.splice(i, 0, queueElement);
          return true;
        }
        return false;
      });
      if (!added) this.collection.push(queueElement);
    }
  }

  dequeue() {
    return this.collection.shift();
  }

  isEmpty() {
    return this.collection.length === 0;
  }
}

// Haversine formula to calculate distance between two lat-lng points
const haversineDistance = (coords1: LatLng, coords2: LatLng): number => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(coords2[0] - coords1[0]);
  const dLon = toRad(coords2[1] - coords1[1]);
  const lat1 = toRad(coords1[0]);
  const lat2 = toRad(coords2[0]);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Create a graph from the waypoints
const createGraphFromWaypoints = (waypoints: LatLng[]): Graph => {
  const graph: Graph = {};

  waypoints.forEach((point, index) => {
    graph[index] = {};

    waypoints.forEach((otherPoint, otherIndex) => {
      if (index !== otherIndex) {
        graph[index][otherIndex] = haversineDistance(point, otherPoint);
      }
    });
  });

  return graph;
};

// Component to handle map click events and add waypoints
const MapClickHandler = ({ onAddWaypoint }: { onAddWaypoint: (latlng: L.LatLng) => void }) => {
  useMapEvents({
    click(e) {
      console.log('Map clicked at:', e.latlng); // Debug: log click event
      onAddWaypoint(e.latlng);
    }
  });
  return null;
};

// Component to display routing on the map
const RoutingMachine = ({ waypoints, color }: { waypoints: LatLng[], color: string }) => {
  const map = useMap();

  React.useEffect(() => {
    if (waypoints.length > 1) {
      const instance = L.Routing.control({
        waypoints: waypoints.map(wp => L.latLng(wp[0], wp[1])),
        routeWhileDragging: true,
        lineOptions: {
          styles: [{ color, weight: 5, opacity: 0.7 }], // Ensure 'styles' is correctly formatted
          extendToWaypoints: true,  // Added this property
          missingRouteTolerance: 5 // Added this property
        }
      }).addTo(map);
      return () => {
        map.removeControl(instance);
      };
    }
  }, [waypoints, map, color]);

  return null;
};

const Map = () => {
  const [waypoints, setWaypoints] = useState<LatLng[]>([]);
  const [algorithm, setAlgorithm] = useState<'dijkstra' | 'bfs' | 'aStar' | 'greedyBestFirst'>('dijkstra');
  const [routes, setRoutes] = useState<{ [key: string]: LatLng[] | null }>({
    dijkstra: null,
    bfs: null,
    aStar: null,
    greedyBestFirst: null
  });

  // Color mapping for each algorithm
  const algorithmColors: { [key: string]: string } = {
    dijkstra: 'red',
    bfs: 'green',
    aStar: 'purple',
    greedyBestFirst: 'blue'
  };

  const addWaypoint = (latlng: L.LatLng) => {
    setWaypoints(prevWaypoints => {
      if (prevWaypoints.length < 2) {
        return [...prevWaypoints, [latlng.lat, latlng.lng]];
      }
      return prevWaypoints; // Do not add more than 2 waypoints
    });
  };

  const clearWaypoints = () => {
    setWaypoints([]);
    setRoutes({
      dijkstra: null,
      bfs: null,
      aStar: null,
      greedyBestFirst: null
    });
  };

  const calculateRoutes = () => {
    if (waypoints.length === 2) {
      const graph = createGraphFromWaypoints(waypoints);
      const start = '0'; // Start from the first waypoint
      const end = '1'; // End at the second waypoint
      const heuristics: { [key: string]: number } = {}; // Add heuristic values as needed

      // Calculate routes based on selected algorithm
      let route: LatLng[] = [];
      switch (algorithm) {
        case 'dijkstra':
          route = dijkstra(graph, start, end).map(index => waypoints[parseInt(index)]);
          setRoutes(prev => ({ ...prev, dijkstra: route }));
          break;
        case 'bfs':
          route = bfs(graph, start, end).map(index => waypoints[parseInt(index)]);
          setRoutes(prev => ({ ...prev, bfs: route }));
          break;
        case 'aStar':
          route = aStar(graph, start, end, heuristics).map(index => waypoints[parseInt(index)]);
          setRoutes(prev => ({ ...prev, aStar: route }));
          break;
        case 'greedyBestFirst':
          route = greedyBestFirst(graph, start, end, heuristics).map(index => waypoints[parseInt(index)]);
          setRoutes(prev => ({ ...prev, greedyBestFirst: route }));
          break;
      }
    }
  };

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <MapContainer
        center={[51.505, -0.09]} // Default center, can be any location or omitted
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapClickHandler onAddWaypoint={addWaypoint} />
        {waypoints.map((wp, index) => (
          <Marker key={index} position={wp} icon={customIcon} />
        ))}
        {Object.entries(routes).map(([key, route]) => 
          route && <RoutingMachine key={key} waypoints={route} color={algorithmColors[key]} />
        )}
      </MapContainer>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}>
        <button onClick={calculateRoutes}>Calculate Routes</button>
        <button onClick={clearWaypoints}>Clear Waypoints</button>
        <select onChange={(e) => setAlgorithm(e.target.value as 'dijkstra' | 'bfs' | 'aStar' | 'greedyBestFirst')} value={algorithm}>
          <option value="dijkstra">Dijkstra</option>
          <option value="bfs">BFS</option>
          <option value="aStar">A*</option>
          <option value="greedyBestFirst">Greedy Best-First</option>
        </select>
      </div>
    </div>
  );
};

export default Map;
