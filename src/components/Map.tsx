import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { DivIcon, Icon, LatLngTuple, LatLng } from "leaflet";
import placeholderIcon from "../icons/mapPointer.png";
import { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet-routing-machine";

// Create custom icon
const customIcon = new Icon({
  iconUrl: placeholderIcon,
  iconSize: [38, 38] // size of the icon
});

// Custom cluster icon
const createClusterCustomIcon = function (cluster) {
  return new DivIcon({
    html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
    className: "custom-marker-cluster",
    iconSize: [33, 33]
  });
};

// Markers
const markers = [
  {
    geocode: [48.86, 2.3522] as LatLngTuple,
    popUp: "Hello, I am pop up 1"
  },
  {
    geocode: [48.85, 2.3522] as LatLngTuple,
    popUp: "Hello, I am pop up 2"
  },
  {
    geocode: [48.855, 2.34] as LatLngTuple,
    popUp: "Hello, I am pop up 3"
  }
];

const CaptureClicks = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    }
  });
  return null;
};

const RoutingMachine = ({ source, destination }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !source || !destination) return;

    let routingControl = L.Routing.control({
      waypoints: [source, destination],
      routeWhileDragging: true
    }).addTo(map);

    return () => {
      if (map && routingControl) {
        map.removeControl(routingControl);
      }
    };
  }, [map, source, destination]);

  return null;
};

export default function App() {
  const defaultPosition: LatLngTuple = [48.8566, 2.3522];
  const [source, setSource] = useState<LatLng | null>(null);
  const [destination, setDestination] = useState<LatLng | null>(null);

  const handleMapClick = (latlng: LatLng) => {
    if (!source) {
      setSource(latlng);
    } else if (!destination) {
      setDestination(latlng);
    }
  };

  return (
    <div>
      <MapContainer style={{ height: "100vh", width: "100%" }} center={defaultPosition} zoom={13}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon}>
          {markers.map((marker, index) => (
            <Marker key={index} position={marker.geocode} icon={customIcon}>
              <Popup>{marker.popUp}</Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>

        <CaptureClicks onMapClick={handleMapClick} />

        {source && (
          <Marker position={source} icon={customIcon}>
            <Popup>Source</Popup>
          </Marker>
        )}
        {destination && (
          <Marker position={destination} icon={customIcon}>
            <Popup>Destination</Popup>
          </Marker>
        )}

        <RoutingMachine source={source} destination={destination} />
      </MapContainer>

      <div>
        <h3>Source: {source ? `${source.lat}, ${source.lng}` : "Not set"}</h3>
        <h3>Destination: {destination ? `${destination.lat}, ${destination.lng}` : "Not set"}</h3>
      </div>
    </div>
  );
}
