
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

// Handle location updates from the server
socket.on('receive-location', (data) => {
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude], 16); // Center map on new location

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]); // Update existing marker
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map); // Add new marker
    }

    // If we have two markers, show the route
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
});
