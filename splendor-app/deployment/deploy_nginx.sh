#!/bin/bash
set -e

# Define directories
REPO_DIR="$HOME/splendor"
APP_DIR="$REPO_DIR/splendor-app"
SERVER_DIR="$APP_DIR/server"
WEB_ROOT="/var/www/splendor"
PM2_NAME="splendor-backend"

echo "Pulling latest changes from git..."
cd $REPO_DIR
git pull

# Load NVM to ensure node, npm, and pm2 are available
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    source "$HOME/.nvm/nvm.sh"
else
    echo "Warning: NVM not found, assuming node/npm are globally available in the current shell"
fi

echo "Building frontend..."
cd $APP_DIR
npm install
npm run build

echo "Deploying frontend to Nginx web root..."
sudo mkdir -p $WEB_ROOT
sudo cp -r dist/* $WEB_ROOT/

echo "Building backend..."
cd $SERVER_DIR
npm install
npm run build

echo "Setting up backend service..."
if ! command -v pm2 > /dev/null; then
    echo "Installing pm2..."
    npm install -g pm2
fi

# Check if the process already exists in pm2
if pm2 show $PM2_NAME > /dev/null 2>&1; then
    echo "Restarting backend pm2 service..."
    pm2 restart $PM2_NAME
else
    echo "Starting new backend pm2 service..."
    pm2 start npm --name $PM2_NAME -- start
    pm2 save
fi

echo "Restarting Nginx..."
sudo systemctl restart nginx

echo "Deployment complete! ✅"
