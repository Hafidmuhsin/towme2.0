import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon not showing
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const userIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Red car or similar
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
});

const providerIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1995/1995470.png', // Tow truck
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

// Component to handle map center updates
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

interface MapProps {
    center?: [number, number]; // [lat, lng]
    zoom?: number;
    userLocation?: [number, number];
    providers?: any[]; // List of providers to show
    onLocationSelect?: (lat: number, lng: number) => void;
    interactive?: boolean;
}

export default function MapComponent({
    center = [12.9716, 77.5946],
    zoom = 13,
    userLocation,
    providers = [],
    onLocationSelect,
    interactive = true
}: MapProps) {

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={interactive}
            className="h-full w-full rounded-lg z-0"
            dragging={interactive}
        >
            <ChangeView center={center} zoom={zoom} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {/* User Marker */}
            {userLocation && (
                <Marker position={userLocation} icon={userIcon}>
                    <Popup>
                        Your Location
                    </Popup>
                </Marker>
            )}

            {/* Provider Markers (Future Use) */}
            {providers.map((provider) => (
                <Marker
                    key={provider._id}
                    position={[provider.location.coordinates[1], provider.location.coordinates[0]]}
                    icon={providerIcon}
                >
                    <Popup>
                        <b>{provider.name}</b><br />
                        {provider.serviceType}
                    </Popup>
                </Marker>
            ))}

            {/* Click Handler */}
            {onLocationSelect && <LocationMarker onSelect={onLocationSelect} />}
        </MapContainer>
    );
}

function LocationMarker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        map.on('click', (e) => {
            onSelect(e.latlng.lat, e.latlng.lng);
        });

        return () => {
            map.off('click');
        }
    }, [map, onSelect]);

    return null;
}
