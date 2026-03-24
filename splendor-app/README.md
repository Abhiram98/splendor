# Splendor Online

A web-based implementation of the Splendor board game.

## Development

### Server
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
npm install
npm run dev
```

## Production Deployment

### 1. Run the Server
In the `server` directory:
```bash
npm run start
```
The server runs on port 3001 by default.

### 2. Build the Frontend
In the root directory:
```bash
npm run build
```
This creates a `dist` folder.

### 3. Server the Frontend
You can use any static file server to serve the `dist` folder. For example:
```bash
npx serve -s dist -p 5173
```

### Environment Configuration

The frontend automatically attempts to connect to the socket server at `http://<hostname>:3001` in production.

If you need to customize this (e.g., if the server is on a different IP or port), set the `VITE_SOCKET_URL` environment variable during the build process:

```bash
VITE_SOCKET_URL=http://161.153.71.194:3001 npm run build
```

#### Reverse Proxy / Single Port (Recommended)
If you are using a reverse proxy (like Nginx) to serve both the frontend and the backend on the same port (e.g., port 80), this is the most secure and reliable setup.

1.  **Build the Frontend** with the socket URL set to `/`:
    ```bash
    VITE_SOCKET_URL=/ npm run build
    ```

2.  **Configure your Reverse Proxy** to forward `/socket.io` requests to the backend server (default port 3001).
    - See [deployment/nginx.example.conf](file:///Users/abhiram/Documents/Splendor/splendor-app/deployment/nginx.example.conf) for a concrete Nginx configuration.

3.  **Start the Backend**:
    ```bash
    cd server && npm start
    ```

This setup avoids CORS issues entirely because the browser sees both the frontend and the backend as coming from the same origin.
