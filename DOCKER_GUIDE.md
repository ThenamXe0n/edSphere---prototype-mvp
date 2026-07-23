# EduSphere - Docker Deployment & Management Guide

This guide describes how to run and manage the EduSphere LMS portal (Database, API Backend, and Nginx Frontend) using Docker and Docker Compose.

---

## 🛠️ Prerequisites
Ensure you have the following installed on your machine:
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) or **Docker Engine** (Linux)
* **Docker Compose** (comes bundled with Docker Desktop; on Linux install via `sudo apt install docker-compose`)

---

## ⚙️ Environment Setup
Docker Compose pulls environment variables from a `.env` file in the project root.

1. Copy the production environment template:
   ```bash
   cp .env.production .env
   ```
2. Open the `.env` file and configure your credentials:
   * **`MONGO_DB_USER`** & **`MONGO_DB_PASSWORD`**: Root credentials for your database.
   * **`JWT_ACCESS_SECRET`** & **`JWT_REFRESH_SECRET`**: Strong, random security hash keys.
   * **`VITE_API_BASE_URL`**: Set to the IP address or domain of the backend server.
     * *Local Development*: `http://localhost:5000`
     * *Production VPS*: `http://<your-vps-ip>:5000` or `https://api.yourdomain.com`

---

## 🚀 Running the Containers

### 1. Build and Start (Detached mode)
To build the Docker images and run all services (MongoDB, API server, React client) in the background:
```bash
docker compose up --build -d
```

### 2. Verify Container Status
Check if all containers are running successfully:
```bash
docker compose ps
```
You should see:
* **`edusphere_db`**: Running on port `27017`
* **`edusphere_server`**: Running on port `5000`
* **`edusphere_client`**: Running on port `80`

### 3. Accessing the Application
Once the containers are running:
* **Frontend Portal**: Open [http://localhost](http://localhost) in your browser (Port 80).
* **Backend API**: Open [http://localhost:5000/api](http://localhost:5000/api) to access the API.
* **Database Connection**: Connect to `mongodb://admin:SecretPassword123!@localhost:27017/edusphere?authSource=admin`.

---

## 🔍 Useful Management Commands

### Read Logs
To read log output streams (useful for debugging API crashes or database connections):
```bash
# Read logs for all services
docker compose logs -f

# Read logs for only the API server
docker compose logs -f server
```

### Stop the Application
To stop all services and preserve database volumes:
```bash
docker compose down
```

### Stop and Wipe Data
To stop the services and completely delete the MongoDB persistent volume (Warning: this wipes the database!):
```bash
docker compose down -v
```

### Rebuild a Specific Service
If you made changes only to the frontend client and want to rebuild it:
```bash
docker compose up --build -d client
```

### Clean up Stale Images
Docker builds create cache layers. To free up disk space on your machine or VPS:
```bash
docker image prune -f
```

---

## 🗄️ Storage Volumes
The Docker Compose setup defines two persistent directories mapping to the host system:
1. **`mongodb_data`**: Persists MongoDB records. Wiping containers will not lose your database records unless you run `docker compose down -v`.
2. **`uploads_data`**: Persists uploaded student profile images and course thumbnail covers inside the backend container `/app/public/uploads` directory.
