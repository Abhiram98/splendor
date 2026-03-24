# Detailed Nginx Setup Guide

This guide provides step-by-step instructions for setting up Nginx on a Linux server (Ubuntu/Debian) to serve the Splendor frontend and backend under a single origin.

## 1. Install Nginx

On your production server, run the following commands:

```bash
sudo apt update
sudo apt install nginx
```

Ensure Nginx is running:

```bash
sudo systemctl status nginx
```

## 2. Prepare the Frontend

Build your frontend locally and transfer the `dist` folder to your server:

```bash
# Locally
VITE_SOCKET_URL=/ npm run build

# Transfer to server (example using scp)
scp -r dist/ user@your-server-ip:/home/user/splendor-app/dist
```

On the server, it's common to place websites in `/var/www/html`:

```bash
sudo mkdir -p /var/www/splendor
sudo cp -r /home/user/splendor-app/dist/* /var/www/splendor/
sudo chown -R www-data:www-data /var/www/splendor
```

## 3. Configure Nginx

Create a new configuration file for your site:

```bash
sudo nano /etc/nginx/sites-available/splendor
```

Paste the following configuration (replacing `your-domain.com` with your actual domain or IP):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/splendor;
    index index.html;

    # Serve static frontend files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy WebSocket / HTTP requests to the backend server
    location /socket.io/ {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;

        # The port your Node.js backend is running on
        proxy_pass http://localhost:3001;

        # Critical for WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 4. Enable the Configuration

Link the file to the `sites-enabled` directory and test the syntax:

```bash
sudo ln -s /etc/nginx/sites-available/splendor /etc/nginx/sites-enabled/
sudo nginx -t
```

If it says `syntax is ok`, reload Nginx:

```bash
sudo systemctl reload nginx
```

## 5. Security (Optional but Recommended)

If you have a domain, use **Certbot** to set up HTTPS (SSL):

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 6. Troubleshooting

If you still see errors:

- **Check Nginx logs**:
  ```bash
  sudo tail -f /var/log/nginx/error.log
  ```
- **Check Backend status**: Ensure your Node.js server is running (e.g., using `pm2` or `nohup`):
  ```bash
  pm2 list
  # or
  ps aux | grep node
  ```
- **Port 3001**: Ensure your firewall allows internal traffic on port 3001 (or that it's accessible to Nginx).
