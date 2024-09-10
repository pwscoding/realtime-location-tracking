1. Create a new folder called `tracking-location`.
2. Initialize a new Node.js project with the command: `npm init -y`.
3. Generate an empty file named `index.js` by running: `fsutil file createnew index.js 0`.
4. Install necessary packages for the project: `npm i express ejs socket.io`.
5. Start writing code in `index.js`, focusing on setting up the basic server functionality.
6. Integrate Socket.IO with the HTTP server in `index.js` to handle real-time data.
7. Use Express to serve static files by including `express.static` for the `public` folder.
8. Create a `public` folder and inside it, add a `css` folder for styling purposes.
9. Set up a `views` folder at the root of the project and create an `index.ejs` file with a boilerplate structure.
10. Add the Leaflet CDN and the minified version of Socket.IO in the `index.ejs` file.
11. Create and start writing the `script.js` file for the client-side logic.
   - add io.on conection code in `index.js`
12. Check if the browser supports geolocation before proceeding to get the user's location.
13. Define options for high accuracy to ensure precise location tracking.
14. Set a timeout of 5 seconds for fetching new location data and disable caching.
15. Use the `watchPosition` method to continuously monitor the user's position.
16. Emit the latitude and longitude through a Socket.IO event named `"send-location"`, and log any errors that occur.
17. Initialize a Leaflet map centered at coordinates (0, 0) with a zoom level of 10.
18. Add OpenStreetMap tiles to the Leaflet map for visual rendering.
19. Create an empty `markers` object to keep track of user markers.
20. When receiving location data through the socket, extract the user’s `id`, `latitude`, and `longitude`, then recenter the map to the new coordinates.
21. If a marker for the user exists, update its position; otherwise, create a new marker and add it to the map.
22. When a user disconnects, remove their marker from the map and delete it from the `markers` object.