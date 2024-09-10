const socket = io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit('send-location', { latitude, longitude });
        },
        (error) => {
            console.error('Error getting geolocation: ', error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
} else {
    console.error('Geolocation is not supported by this browser.');
}

// Initialize the map
const map = L.map('map').setView([0, 0], 16);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © OpenStreetMap contributors'
}).addTo(map);

const markers = {};
let routingControl;

// Create and add navigation arrow
const navIcon = L.icon({
    iconUrl: 'https://static-00.iconduck.com/assets.00/map-arrow-up-icon-1857x2048-1scitnd4.png', // Path to your arrow icon
    iconSize: [30, 30], // Size of the icon
    iconAnchor: [15, 15], // Anchor point of the icon (center)
    popupAnchor: [0, -15] // Popup anchor point (if needed)
});
const navMarker = L.marker([0, 0], { icon: navIcon }).addTo(map);
navMarker.setOpacity(0); // Initially hidden

// Handle location updates from the server
socket.on('receive-location', (data) => {
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude], 16); // Center map on new location

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]); // Update existing marker
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map); // Add new marker
    }

    // Show route if two markers are present
    if (Object.keys(markers).length === 2) {
        const [id1, id2] = Object.keys(markers);
        const latlngs = [
            markers[id1].getLatLng(),
            markers[id2].getLatLng()
        ];

        if (routingControl) {
            routingControl.setWaypoints(latlngs);
        } else {
            routingControl = L.Routing.control({
                waypoints: latlngs,
                routeWhileDragging: true,
                createMarker: () => null, // Disable markers for waypoints
                lineOptions: {
                    styles: [{ color: 'blue', weight: 5 }]
                }
            }).addTo(map);
        }
    }

    // Update navigation arrow to point towards the current location
    navMarker.setLatLng([latitude, longitude]);
    navMarker.setOpacity(1); // Show the navigation arrow

    // Hide user's own marker
    if (markers[id]) {
        markers[id].setOpacity(0); // Hide the marker
    }
});

// Handle user disconnection
socket.on('user-disconnect', (data) => {
    const { id } = data;
    if (markers[id]) {
        map.removeLayer(markers[id]); // Remove marker from the map
        delete markers[id]; // Remove marker reference
    }

    // Remove the route if a marker is removed
    if (routingControl && Object.keys(markers).length < 2) {
        map.removeControl(routingControl);
        routingControl = null;
    }

    // Hide the navigation arrow if no markers are present
    if (Object.keys(markers).length === 0) {
        navMarker.setOpacity(0);
    }
});

// Rotate the navigation arrow based on device orientation
window.addEventListener('deviceorientation', (event) => {
    // Get the device orientation
    const { alpha } = event;

    if (alpha !== null) {
        // Rotate the navigation marker
        const rotation = alpha; // Degrees from the device's orientation

        // Apply rotation to the icon
        navMarker.setIcon(L.icon({
            iconUrl: 'https://static-00.iconduck.com/assets.00/map-arrow-up-icon-1857x2048-1scitnd4.png',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15],
            // Add rotation transform
            className: `rotate-${Math.round(rotation)}`
        }));
    }
});

// Add CSS for rotation
const style = document.createElement('style');
style.textContent = `
    .rotate-0 { transform: rotate(0deg); }
    .rotate-90 { transform: rotate(90deg); }
    .rotate-180 { transform: rotate(180deg); }
    .rotate-270 { transform: rotate(270deg); }
`;
document.head.appendChild(style);
