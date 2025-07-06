📋 Complete Deployment Guide Created
This README provides step-by-step instructions for deploying your N8N AI Studio after running the secrets generator script.
Key Features:
✅ Exact deployment sequence - databases first, then apps, then proxy
✅ Health check commands for every service
✅ Troubleshooting guide for common issues we encountered
✅ Security checklist to ensure production readiness
✅ Resource monitoring commands
✅ Access URLs for all services
Prevents Common Issues:

URL-safe password verification
Proper startup sequence to avoid dependency failures
GPU access troubleshooting
Database authentication debugging
Network connectivity testing

This guide will help anyone deploy your AI Studio system correctly the first time and troubleshoot any issues that arise. The troubleshooting section specifically addresses the authentication and GPU issues we resolved during your setup.

# N8N AI Studio - Complete Deployment Guide

**Production-ready AI automation platform with ComfyUI, Kokoro TTS, and FFCreator**

---

## 📋 **Prerequisites**

✅ **System Requirements:**
- Ubuntu 22.04+ with 32GB RAM, 12+ CPU cores
- NVIDIA RTX 3080 (or compatible GPU)
- Docker and Docker Compose installed
- NVIDIA Container Toolkit installed

✅ **Required Files:**
- `docker-compose.yml` (main configuration)
- `generate_secrets.sh` (secrets generator script)
- `nginx/nginx.conf` (reverse proxy configuration)
- SSL certificates in `./ssl/` directory

---

## 🚀 **Step-by-Step Deployment**

### **Step 1: Generate Secure Secrets**

```bash
# Make the script executable
chmod +x generate_secrets.sh

# Generate all required secrets (URL-safe passwords)
./generate_secrets.sh
```

**✅ Expected Output:**
- Creates `./secrets/` directory with 10 secret files
- All passwords are URL-safe (no `/`, `+`, `=` characters)
- File permissions automatically set to 600

### **Step 2: Create Required Directories**

```bash
# Create all persistent data directories
mkdir -p persistent-data/{comfyui/{run,basedir/{models,output,workflows,user}},kokoro/{models,voices,audio,cache},ffcreator-cache,videos,assets,n8n/workflows}

# Create temporary processing directory  
mkdir -p temp-processing

# Create log directory
mkdir -p logs

# Set proper permissions
chmod 755 persistent-data temp-processing logs
```

### **Step 3: Configure Environment Variables**

```bash
# Create .env file (if not exists)
cp .env.example .env

# Edit .env file with your settings
nano .env
```

**Required .env Variables:**
```bash
DOMAIN_NAME=192.168.1.13        # Your server IP
EXTERNAL_IP=192.168.1.13        # Your server IP  
POSTGRES_DB=n8n
POSTGRES_VERSION=16.4
REDIS_VERSION=7-alpine
```

### **Step 4: Start Core Infrastructure**

```bash
# Start databases first (dependency order)
docker-compose up -d postgres ffcreator-db redis

# Wait for databases to initialize
sleep 30

# Check database health
docker-compose ps postgres ffcreator-db redis
```

**✅ Expected Status:** All containers should show `(healthy)` status.

### **Step 5: Start Application Services**

```bash
# Start N8N workflow engine
docker-compose up -d n8n

# Wait for N8N to initialize
sleep 20

# Check N8N health
docker-compose logs n8n --tail=10
```

**✅ Expected Output:** Should see N8N startup messages without errors.

### **Step 6: Start AI Services**

```bash
# Start ComfyUI (AI image generation)
docker-compose up -d comfyui

# Wait for ComfyUI GPU initialization
sleep 60

# Start Kokoro TTS (text-to-speech)
docker-compose up -d kokoro

# Wait for model downloads
sleep 120

# Start FFCreator (video processing)
docker-compose up -d ffcreator

# Wait for FFCreator initialization
sleep 30
```

### **Step 7: Start Reverse Proxy**

```bash
# Start Nginx reverse proxy (final step)
docker-compose up -d nginx

# Check all services are running
docker-compose ps
```

### **Step 8: Verify Deployment**

```bash
# Check all container statuses
docker-compose ps

# Check for any restart loops
docker-compose ps | grep -i restart

# View logs for any issues
docker-compose logs --tail=20
```

---

## 🏥 **Health Check Commands**

### **Database Connectivity**
```bash
# Test main PostgreSQL database
docker exec n8n-postgres psql -U $(cat ./secrets/postgres_user.txt) -d n8n -c "SELECT version();"

# Test FFCreator database  
docker exec ffcreator-postgres psql -U $(cat ./secrets/ffcreator_db_user.txt) -d ffcreator -c "SELECT current_user;"

# Test Redis
docker exec redis-cache redis-cli ping
```

### **AI Services Health**
```bash
# Test ComfyUI API
curl -s http://localhost:8188/queue || echo "ComfyUI not ready"

# Test Kokoro TTS API  
curl -s http://localhost:8880/v1/audio/voices || echo "Kokoro not ready"

# Test FFCreator API
curl -s http://localhost:3001/health || echo "FFCreator not ready"

# Test N8N API
curl -s http://localhost:5678/healthz || echo "N8N not ready"
```

### **GPU Access Verification**
```bash
# Check GPU access in ComfyUI
docker exec comfyui-main nvidia-smi

# Check GPU access in Kokoro
docker exec kokoro-tts-service nvidia-smi

# Check GPU access in FFCreator
docker exec ffcreator-service nvidia-smi
```

---

## 🌐 **Access URLs**

After successful deployment:

### **External Access (via Nginx):**
- **N8N Interface:** `https://192.168.1.13/`
- **ComfyUI API:** `https://192.168.1.13/api/comfyui/`
- **FFCreator API:** `https://192.168.1.13/api/video/`  
- **Kokoro TTS API:** `https://192.168.1.13/api/tts/`

### **Internal Access (container-to-container):**
- **N8N:** `http://n8n-main:5678`
- **ComfyUI:** `http://comfyui-main:8188`
- **FFCreator:** `http://ffcreator-service:3001`
- **Kokoro TTS:** `http://kokoro-tts-service:8880`

---

## 🔧 **Troubleshooting Common Issues**

### **Database Authentication Errors**
```bash
# If you see "password authentication failed"
# 1. Stop affected services
docker-compose stop ffcreator n8n

# 2. Regenerate secrets with URL-safe passwords
./generate_secrets.sh

# 3. Remove database data to force fresh initialization
sudo rm -rf ./persistent-data/ffcreator-db/pgdata
sudo rm -rf ./postgres-data

# 4. Restart databases
docker-compose up -d postgres ffcreator-db
sleep 30

# 5. Restart applications
docker-compose up -d n8n ffcreator
```

### **GPU Access Issues**
```bash
# Check NVIDIA Container Toolkit
docker run --rm --runtime=nvidia nvidia/cuda:11.0-base nvidia-smi

# If GPU not accessible, restart Docker
sudo systemctl restart docker
docker-compose restart comfyui kokoro ffcreator
```

### **Container Restart Loops**
```bash
# Check specific container logs
docker-compose logs [service-name] --tail=50

# Common restart causes:
# - Secret file permission issues
# - GPU access problems  
# - Database connection failures
# - Missing required directories
```

### **Network Connectivity Issues**
```bash
# Test internal network connectivity
docker exec n8n-main ping -c 2 postgres
docker exec n8n-main ping -c 2 redis-cache
docker exec n8n-main ping -c 2 ffcreator-db

# Check network configuration
docker network inspect n8n-ai-studio_n8n-ai-studio_ai-network
```

---

## 📊 **Resource Monitoring**

### **Container Resource Usage**
```bash
# Monitor CPU and memory usage
docker stats

# Check GPU utilization
watch -n 2 nvidia-smi

# Monitor disk usage
df -h
du -sh persistent-data/
```

### **Log Management**
```bash
# View aggregated logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f [service-name]

# Clear logs if needed
docker-compose down
docker system prune -f
docker-compose up -d
```

---

## 🔒 **Security Checklist**

✅ **Secrets Management:**
- [ ] All secrets generated with URL-safe characters
- [ ] Secret files have 600 permissions (owner read/write only)
- [ ] Secrets directory has 700 permissions (owner access only)
- [ ] No plaintext passwords in docker-compose.yml
- [ ] Secrets directory added to .gitignore

✅ **Network Security:**
- [ ] Only Nginx ports 80/443 exposed externally
- [ ] All services communicate via internal Docker network
- [ ] SSL certificates properly configured
- [ ] Rate limiting configured in Nginx

✅ **Container Security:**
- [ ] All containers run with security_opt: no-new-privileges
- [ ] Non-root users where possible
- [ ] Read-only filesystems where applicable
- [ ] Resource limits configured

---

## 🚀 **Production Deployment Complete**

Your N8N AI Studio is now ready for production use with:

- ✅ **Secure secret management** with URL-safe passwords
- ✅ **GPU-accelerated AI services** (ComfyUI, Kokoro, FFCreator)
- ✅ **High-performance workflow automation** with N8N
- ✅ **Enterprise-grade security** with reverse proxy and SSL
- ✅ **Comprehensive monitoring** and health checks
- ✅ **Scalable architecture** optimized for your hardware

**Next Steps:**
1. Configure your first N8N workflow
2. Test the complete AI pipeline: Image → TTS → Video
3. Set up monitoring and alerting
4. Configure automated backups
5. Implement workflow templates

---

## 📞 **Support**

If you encounter issues:
1. Check the troubleshooting section above
2. Review container logs: `docker-compose logs [service]`
3. Verify all prerequisites are met
4. Ensure secrets were generated correctly
5. Check GPU access and driver compatibility

**Happy Automating! 🎯**