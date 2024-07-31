import {useState, useEffect} from 'react';
import {Map as MapGL} from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import {TripsLayer} from '@deck.gl/geo-layers';
import {animate} from 'popmotion';
import tripsdata from '../data/trips.json';

import type {Position, Color, MapViewState} from '@deck.gl/core';

// Source data CSV
const DATA_URL = {
  TRIPS: tripsdata // eslint-disable-line
};

type Theme = {
  trailColor0: Color;
  trailColor1: Color;
};

const DEFAULT_THEME: Theme = {
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190],
};

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -73.98,
  latitude: 40.72,
  zoom: 13,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

type Trip = {
  vendor: number;
  path: Position[];
  timestamps: number[];
};

type RawTrip = {
  vendor: number;
  path: number[][];
  timestamps: number[];
};

export default function Trip({
  trips = DATA_URL.TRIPS,
  trailLength = 1000,
  initialViewState = INITIAL_VIEW_STATE,
  mapStyle = MAP_STYLE,
  theme = DEFAULT_THEME,
  loopLength = 1800, // unit corresponds to the timestamp in source data
  animationSpeed = 10
}: {
  trips?: Trip[] | RawTrip[];
  trailLength?: number;
  loopLength?: number;
  animationSpeed?: number;
  initialViewState?: MapViewState;
  mapStyle?: string;
  theme?: Theme;
}) {
  const [time, setTime] = useState(0);
  // fixed start and end node for now
  // const startNode = [-74.00823, 40.71351];
  // const endNode = [-74.00336, 40.75891];

  useEffect(() => {
    const animation = animate({
      from: 0,
      to: loopLength,
      duration: (loopLength * 60) / animationSpeed,
      repeat: Number.MAX_SAFE_INTEGER, // infinity
      onUpdate: setTime
    });
    return () => animation.stop();
  }, [loopLength, animationSpeed]);

  const layers = [
    new TripsLayer<Trip>({
      id: 'trips',
      data: trips,
      getPath: d => d.path,
      getTimestamps: d => d.timestamps,
      getColor: d => (d.vendor === 0 ? theme.trailColor0 : theme.trailColor1),
      opacity: 1,
      widthMinPixels: 2,
      rounded: true,
      trailLength,
      currentTime: time,
      fadeTrail: false, // default is true
    })
  ];

  return (
    <DeckGL
      layers={layers}
      initialViewState={initialViewState}
      controller={true}
    >
      <MapGL reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}