#!/bin/bash
# AWS EC2 Free Tier 1-Click Setup Script for PayrollPro
# Target OS: Ubuntu 22.04 / 24.04 LTS (t2.micro / t3.micro)

set -e

echo "=== 🚀 Starting AWS EC2 PayrollPro Setup ==="

# 1. Update Packages
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx certbot python3-certbot-nginx docker.io docker-compose-v2

# 2. Install Node.js 22 LTS & PM2
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# 3. Add current user to Docker group
sudo usermod -aG docker $USER

# 4. Build & Launch Application using Docker Compose
echo "=== 🔨 Building PayrollPro Docker Container ==="
sudo docker compose up -d --build

# 5. Configure Nginx Reverse Proxy
echo "=== 🌐 Setting up Nginx Reverse Proxy ==="
sudo tee /etc/nginx/sites-available/payrollpro > /dev/null <<'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/payrollpro /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo "=== ✅ AWS EC2 PayrollPro Live Deployment Complete! ==="
echo "Access your live app at: http://$(curl -s http://checkip.amazonaws.com)"
