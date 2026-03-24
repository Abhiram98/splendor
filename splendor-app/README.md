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

#### Reverse Proxy / Single Port
If you are using a reverse proxy (like Nginx) to serve both the frontend and the backend on the same port (e.g., port 80), set `VITE_SOCKET_URL` to `/`:

```bash
VITE_SOCKET_URL=/ npm run build
```

> [!NOTE]
> When using a reverse proxy, ensure it is configured to forward `/socket.io` requests to the backend server on port 3001.
