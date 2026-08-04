# DEPLOYMENT_GUIDE.md — Production Deployment Manual

## Prerequisites
* Node.js v18+ / npm 9+
* Python 3.10+ & MariaDB 10.6+
* Redis Server (for job queueing)

## Standard Installation & Launch

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Build Production Assets**:
   ```bash
   npm run build
   ```

3. **Start API Gateway Server**:
   ```bash
   node dist/server.cjs
   ```
   The API server will launch on port `3000`.

4. **Production Web Server Setup (Nginx)**:
   Configure Nginx as a reverse proxy pointing static requests to `dist/` and `/api` requests to `http://localhost:3000`.

```nginx
server {
    listen 80;
    server_name payrollpro.yourdomain.com;

    location / {
        root /var/www/payrollpro/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```
