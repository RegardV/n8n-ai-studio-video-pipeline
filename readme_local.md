# 🤖 N8N AI Studio
> **Production-Ready AI Automation Platform** with ComfyUI, Kokoro TTS, and FFCreator

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue)](https://docs.docker.com/compose/)
[![GPU](https://img.shields.io/badge/GPU-NVIDIA_RTX_3080+-green)](https://www.nvidia.com/)
[![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen)](https://github.com/RegardV/n8n-ai-studio)

## ✨ Features

- **🔄 N8N Workflow Automation** - Visual workflow builder with enterprise-grade automation
- **🎨 ComfyUI Image Generation** - Stable Diffusion AI with 15GB+ models and GPU acceleration
- **🎤 Kokoro TTS** - Premium text-to-speech with 67 voices across 8 languages
- **🎬 FFCreator Video Processing** - GPU-accelerated video composition with Canvas rendering
- **🔒 Enterprise Security** - Docker secrets, SSL encryption, Nginx reverse proxy with rate limiting
- **📊 Complete Monitoring** - Health checks, centralized logging, and performance metrics
- **🌐 API-First Design** - RESTful APIs for all services with comprehensive N8N integration

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                          │
│              (SSL Termination + Rate Limiting)                  │
│    https://192.168.1.13/{api/comfyui,api/tts,api/video}        │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┬─────────────┐
        │             │             │             │
   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
   │   N8N   │   │ComfyUI  │   │ Kokoro  │   │FFCreator│
   │  :5678  │   │ :8188   │   │TTS:8880 │   │ :3001   │
   │         │   │ (GPU:0) │   │(GPU:0)  │   │(GPU:0)  │
   └─────────┘   └─────────┘   └─────────┘   └─────────┘
        │             │             │             │
   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
   │PostgreSQL│   │ Redis  │   │PostgreSQL│   │AI Models│
   │ :5432   │   │ :6379  │   │ :5432    │   │ 16GB+   │
   └─────────┘   └─────────┘   └─────────┘   └─────────┘
```

## 🚀 Quick Start

### 📋 Prerequisites
- **OS**: Ubuntu 22.04+ (tested) or compatible Linux distribution
- **RAM**: 16GB minimum, **32GB recommended** for optimal performance
- **GPU**: NVIDIA RTX 3080+ with **10GB+ VRAM** (essential)
- **Storage**: **50GB+ free space** (models require ~16GB)
- **Docker**: Latest version with Compose V2
- **NVIDIA**: Docker runtime and drivers 545+

### 🛠️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/RegardV/n8n-ai-studio.git
cd n8n-ai-studio
```

2. **Create persistent data structure**
```bash
# Run the automated setup script
chmod +x setup/create-structure.sh
./setup/create-structure.sh
```

3. **Set up environment variables**
```bash
# Copy and customize environment
cp .env.example .env
nano .env

# Required variables:
# DOMAIN_NAME=192.168.1.13
# POSTGRES_USER=n8n_user
# POSTGRES_PASSWORD=your_secure_password
# N8N_ENCRYPTION_KEY=your_32_char_encryption_key
```

4. **Generate security certificates**
```bash
cd ssl
./generate-certificates.sh
cd ..
```

5. **Create Docker secrets**
```bash
mkdir -p secrets
echo -n "n8n_user" > secrets/postgres_user.txt
echo -n "your_secure_password" > secrets/postgres_password.txt
echo -n "ffcreator_user" > secrets/ffcreator_db_user.txt
echo -n "secure_ffcreator_password" > secrets/ffcreator_db_password.txt
# Generate encryption key
openssl rand -base64 32 | tr -d '\n' > secrets/n8n_encryption_key.txt
# Create database URL
echo -n "postgresql://ffcreator_user:secure_ffcreator_password@ffcreator-db:5432/ffcreator" > secrets/ffcreator_database_url.txt
# Generate JWT secret
openssl rand -base64 32 | tr -d '\n' > secrets/ffcreator_jwt_secret.txt
echo -n "kokoro_api_key_123" > secrets/kokoro_api_key.txt
chmod 600 secrets/*.txt
```

6. **Download AI models** (16GB+ download)
```bash
# Download ComfyUI models (requires manual download due to size)
# Follow: ./docs/MODEL-DOWNLOADS-guide.md
./setup/download-comfyui-models.sh

# Kokoro models download automatically on first run
```

7. **Start the platform**
```bash
# Start in stages for better monitoring
docker-compose up -d postgres redis ffcreator-db
sleep 30
docker-compose up -d n8n
sleep 30
docker-compose up -d comfyui kokoro ffcreator
sleep 30
docker-compose up -d nginx
```

8. **Verify installation**
```bash
# Check all services are healthy
docker-compose ps

# Run comprehensive verification
chmod +x setup/verify-installation.sh
./setup/verify-installation.sh

# Test API endpoints
curl -k -f https://192.168.1.13/api/video/health
curl -k -f https://192.168.1.13/api/tts/v1/audio/voices
curl -k -f https://192.168.1.13/api/comfyui/queue
```

## 📁 Project Structure

```
n8n-ai-studio/
├── 📄 docker-compose.yml              # Production orchestration (secured)
├── 📄 .env.example                    # Environment template
├── 📁 nginx/                          # Reverse proxy & SSL termination
│   ├── 📄 nginx.conf                  # Complete routing configuration
│   └── 📁 html/                       # Custom error pages
├── 📁 ssl/                            # SSL certificate management
│   ├── 📄 n8n.crt                     # SSL certificate
│   ├── 📄 n8n.key                     # Private key (generated)
│   └── 📄 generate-certificates.sh    # Certificate generation script
├── 📁 secrets/                        # Docker secrets (production security)
│   ├── 📄 postgres_user.txt           # Database authentication
│   ├── 📄 postgres_password.txt       # Secure passwords
│   ├── 📄 n8n_encryption_key.txt      # N8N data encryption
│   └── 📄 *.txt                       # All credentials as secrets
├── 📁 persistent-data/                # AI models & generated content (16GB+)
│   ├── 📁 comfyui/basedir/models/     # Stable Diffusion models (~15GB)
│   │   ├── 📁 checkpoints/            # Main AI models (SD1.5, SDXL)
│   │   ├── 📁 loras/                  # Fine-tuning models
│   │   ├── 📁 embeddings/             # Text embeddings
│   │   └── 📁 output/                 # Generated images
│   ├── 📁 kokoro/                     # TTS voice models (~1.3GB)
│   │   ├── 📁 models/                 # Voice synthesis models
│   │   ├── 📁 voices/                 # 67 voice packs
│   │   └── 📁 audio/                  # Generated speech
│   ├── 📁 ffcreator/                  # Video processing service
│   │   ├── 📄 Dockerfile.ffcreator    # Custom Ubuntu+Node.js+GPU build
│   │   ├── 📄 package.json            # Canvas, FFmpeg, Video deps
│   │   └── 📄 server.js               # GPU video processing API (320+ lines)
│   ├── 📁 videos/                     # Generated video output
│   ├── 📁 n8n/workflows/              # N8N workflow storage
│   └── 📁 assets/                     # Shared media assets
├── 📁 setup/                          # Installation & verification scripts
│   ├── 📄 create-structure.sh         # Persistent data structure creator
│   ├── 📄 download-models.sh          # AI model downloader
│   ├── 📄 verify-installation.sh      # Complete system verification
│   └── 📄 model-verification.sh       # AI model integrity checker
├── 📁 logs/                           # Centralized logging (all services)
├── 📁 deployment-logs/                # Installation & debug logs
└── 📁 docs/                           # Comprehensive documentation
    ├── 📄 SETUP.md                    # Detailed setup guide
    ├── 📄 API.md                      # Complete API documentation
    ├── 📄 TROUBLESHOOTING.md          # Issue resolution guide
    ├── 📄 MODEL-DOWNLOADS-guide.md    # AI model acquisition guide
    └── 📄 Docker-Images_documentation.md # Container documentation
```

## 🌐 API Endpoints

### **🎨 ComfyUI - AI Image Generation**
```bash
Base URL: https://192.168.1.13/api/comfyui/

# Generate Images
POST /api/comfyui/prompt
GET  /api/comfyui/history/{prompt_id}
GET  /api/comfyui/view?filename={filename}&type=output

# System Status
GET  /api/comfyui/queue
GET  /api/comfyui/object_info
```

### **🎤 Kokoro TTS - Text-to-Speech**
```bash
Base URL: https://192.168.1.13/api/tts/

# Voice Synthesis (67 voices available)
POST /api/tts/v1/audio/speech
GET  /api/tts/v1/audio/voices
GET  /api/tts/audio/{filename}

# Supported languages: English, Spanish, French, Italian, Portuguese, Hindi, Japanese, Chinese
```

### **🎬 FFCreator - Video Processing**
```bash
Base URL: https://192.168.1.13/api/video/

# Video Creation (GPU-accelerated)
POST /api/video/api/videos         # Main production endpoint
GET  /api/video/api/jobs/{jobId}   # Job status tracking
GET  /api/video/download/{filename} # Video download
GET  /api/video/health             # Service health
POST /api/video/create-test-video  # Legacy test endpoint
```

## 🔐 Security Features

- **🔑 Docker Secrets**: All passwords and keys managed via Docker secrets
- **🛡️ SSL/TLS**: End-to-end HTTPS encryption with custom certificates
- **🚦 Rate Limiting**: API protection with nginx-based rate limiting
- **🔒 Network Isolation**: Services communicate on isolated Docker network
- **👤 Security Hardening**: Non-root container execution, no-new-privileges
- **📝 Audit Logging**: Comprehensive request logging and monitoring
- **🌐 Reverse Proxy**: Single external entry point via Nginx

## 🎯 Production Use Cases

### **📹 Complete Video Automation Pipeline**
```
N8N Trigger → ComfyUI (Generate Images) → Kokoro (Generate Voice) → 
FFCreator (Compose Video) → Webhook Response
```

### **🎨 AI Content Workflows**
- **Social Media**: Automated post generation with AI images and voiceovers
- **Education**: Course material creation with visual and audio content
- **Marketing**: Product demo videos with AI-generated assets
- **Entertainment**: Story-driven content with custom characters and voices

### **🔄 Enterprise Integration**
- **Business Process Automation**: Document processing with AI enhancement
- **Customer Communications**: Personalized video messages at scale
- **Training Content**: Automated tutorial creation with multilingual support
- **Data Visualization**: Report generation with AI-enhanced graphics

## 📊 System Requirements & Performance

### **🎮 GPU Resource Management**
- **ComfyUI**: 75% GPU memory allocation (primary image generation)
- **Kokoro TTS**: 15% GPU memory allocation (voice synthesis)
- **FFCreator**: 90% GPU memory when active (video rendering priority)
- **Memory Management**: Automatic VRAM clearing between workflow phases

### **⚡ Performance Benchmarks**
- **Image Generation**: 1024x1024 images in 15-30 seconds (RTX 3080)
- **Voice Synthesis**: 1 minute of audio in 5-10 seconds
- **Video Rendering**: 1080p 30fps video in 2-5x real-time
- **Concurrent Workflows**: 2-3 parallel N8N workflows supported

## 📚 Documentation

 See ./docs/Alpha-Readme-ProductionGuide.md Most of the below is covered in this document 

- **📖 [Setup Guide]- Detailed installation and configuration
- **📡 [API Reference] - Complete API documentation with examples
- **🔒 [Security Guide] - Production security best practices
- **🤖 [Model Downloads] - AI model acquisition guide
- **🐳 [Docker Images] - Container documentation

## 🧪 Testing & Verification

```bash
# Complete system health check
./setup/verify-installation.sh

# AI model verification (27GB+ models)
./setup/model-verification.sh

# API endpoint testing
curl -k https://192.168.1.13/api/video/health
curl -k https://192.168.1.13/api/tts/v1/audio/voices
curl -k https://192.168.1.13/api/comfyui/queue

# N8N workflow testing
# Access N8N at: https://192.168.1.13/
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[N8N](https://n8n.io/)** - Workflow automation platform
- **[ComfyUI](https://github.com/comfyanonymous/ComfyUI)** - Stable Diffusion interface
- **[Kokoro TTS](https://github.com/remsky/Kokoro-FastAPI)** - High-quality text-to-speech
- **[FFCreator](https://github.com/tnfe/FFCreator)** - Node.js video creation library

## ⚠️ Important Production Notes

### **📦 Large Files & Models**
- **AI Models**: 16GB+ download required (ComfyUI: ~15GB, Kokoro: ~1.3GB)
- **Initial Setup**: Allow 2-4 hours for complete model download
- **Storage**: Ensure 50GB+ free space before installation

### **🎮 GPU Requirements**
- **NVIDIA GPU**: at minimum - RTX 3080+ with 10GB+ any upper model running the nvidia-toolkit and driver should be good. 
- **CUDA Support**: Ensure NVIDIA Docker runtime is properly configured
- **Performance**: System tested on RTX 3080 - lower-end GPUs may experience reduced performance

### **🔒 Security Considerations**
- **Production**: Always use Docker secrets for credential management
- **SSL Certificates**: Generate proper certificates for production domains
- **Network**: Configure firewall rules for external access
- **Updates**: Monitor component updates for security patches

### **📊 Monitoring & Maintenance**
- **Health Checks**: All services include comprehensive health monitoring
- **Log Management**: Centralized logging with automatic rotation
- **Backup Strategy**: Ensure regular backups of persistent data and configurations
- **Resource Monitoring**: Monitor GPU memory usage during intensive workflows

---

**Built with ❤️ for AI automation enthusiasts**

*Production-ready since July 2025 - Tested on Ubuntu 22.04 with NVIDIA RTX 3080*