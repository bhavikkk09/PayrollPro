#!/bin/bash
# Universal AWS EC2 1-Click Setup Script for PayrollPro
# Supports: Amazon Linux 2023, Amazon Linux 2, Ubuntu 22.04 / 24.04 LTS

set -e

echo "=== 🚀 Starting Universal AWS EC2 PayrollPro Setup ==="

# 1. Detect OS & Package Manager
if command -v dnf &> /dev/null; then
    echo "=== Detected Amazon Linux 2023 / RHEL (dnf) ==="
    sudo dnf update -y
    sudo dnf install -y --allowerasing git nginx docker nodejs npm || sudo dnf install -y git nginx docker nodejs npm
    sudo systemctl enable --now docker || true
    sudo systemctl enable --now nginx || true
    sudo npm install -g pm2 || true
    IS_AMAZON_LINUX=true
elif command -v yum &> /dev/null; then
    echo "=== Detected Amazon Linux 2 / CentOS (yum) ==="
    sudo yum update -y
    sudo yum install -y git nginx docker
    sudo systemctl enable --now docker || true
    sudo systemctl enable --now nginx || true
    curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
    sudo yum install -y nodejs
    sudo npm install -g pm2 || true
    IS_AMAZON_LINUX=true
elif command -v apt-get &> /dev/null; then
    echo "=== Detected Ubuntu / Debian (apt) ==="
    sudo apt update && sudo apt upgrade -y
    sudo apt install -y curl git nginx certbot python3-certbot-nginx docker.io
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt install -y nodejs
    sudo npm install -g pm2 || true
    IS_AMAZON_LINUX=false
else
    echo "❌ Unknown package manager. Please use Ubuntu or Amazon Linux."
    exit 1
fi

# 2. Add Current User to Docker Group
sudo usermod -aG docker $USER || true

# 3. Clean Install Dependencies & Linux Native Bindings
echo "=== 🔨 Installing Dependencies & Native Linux Bindings ==="
rm -rf node_modules package-lock.json
npm install --include=optional || npm install --force
npm install @tailwindcss/oxide-linux-x86-64-gnu @tailwindcss/oxide-linux-x86-64-musl @esbuild/linux-x64 --save-optional || true
npm run build

echo "=== ⚡ Starting PayrollPro Server with PM2 ==="
pm2 stop payrollpro || true
pm2 start dist/server.cjs --name "payrollpro"
pm2 save || true

# 4. Configure Nginx Reverse Proxy
echo "=== 🌐 Configuring Nginx Reverse Proxy ==="
if [ "$IS_AMAZON_LINUX" = true ]; then
    sudo tee /etc/nginx/conf.d/payrollpro.conf > /dev/null <<'EOF'
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
else
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
fi

# Restart Nginx
sudo nginx -t
sudo systemctl restart nginx

echo "=== ✅ AWS EC2 PayrollPro Live Deployment Complete! ==="
echo "Your application is now LIVE on http://$(curl -s http://checkip.amazonaws.com)"
