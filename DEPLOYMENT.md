# Production Deployment Guide (Docker & VPS)

This guide walks you through deploying the **Mess-Website** application to any cloud VPS (DigitalOcean, AWS EC2, Linode, Hetzner, or Ubuntu/Debian Server) using Docker and Nginx.

---

## 1. Prerequisites on the Server

Ensure your server has Git and Docker installed:

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

---

## 2. Clone & Setup Project

```bash
# Clone the repository
git clone <YOUR_GIT_REPO_URL> mess-website
cd mess-website

# Setup production environment file
cp .env.example .env # Or create .env directly
nano .env
```

Ensure your `.env` contains:
```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
DIRECT_URL="postgresql://user:pass@host:5432/dbname"
NEXTAUTH_SECRET="a-very-strong-secret-key"
NEXTAUTH_URL="https://yourdomain.com"
BUCKET_NAME=rythmtechnical
ACCESS_KEY=your_access_key
SECRET_KEY=your_secret_key
ENDPOINT=https://sgp1.digitaloceanspaces.com
FOLDER_NAME=mess_website
```

---

## 3. Automated Deployment

Run the automated deployment script:

```bash
chmod +x deploy.sh
./deploy.sh
```

Or run Docker Compose manually:
```bash
docker compose up -d --build
```

---

## 4. Setup Nginx Reverse Proxy & Free SSL (Let's Encrypt)

To expose your app at `https://yourdomain.com` forwarding to port **7691**:

### A. Install Nginx & Certbot
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

### B. Create Nginx Site Configuration
```bash
sudo nano /etc/nginx/sites-available/mess-website
```

Add the following configuration:
```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    # Allow large uploads for images / menu items
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:7691;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### C. Enable Site & Restart Nginx
```bash
sudo ln -s /etc/nginx/sites-available/mess-website /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### D. Obtain Free SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 5. Useful Management Commands

| Action | Command |
|---|---|
| View real-time logs | `docker compose logs -f web` |
| Restart application | `docker compose restart` |
| Redeploy latest updates | `./deploy.sh` |
| Check health & container status | `docker compose ps` |
| Stop application | `docker compose down` |
