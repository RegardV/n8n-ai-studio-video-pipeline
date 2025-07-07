# 🤖 N8N AI Studio
> **Production-Ready AI Automation Platform** with ComfyUI, Kokoro TTS, and FFCreator

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue)](https://docs.docker.com/compose/)
[![GPU](https://img.shields.io/badge/GPU-NVIDIA_RTX_3080+-green)](https://www.nvidia.com/)
[![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen)](https://github.com/RegardV/n8n-ai-studio)

**🎯 Complete Production Setup Guide - Final Working Configuration - All Services Healthy**  
*Date: July 6, 2025 | Status: ✅ Production Ready*

## ✨ Features
local docker network running these containers:
- **🔄 N8N Workflow Automation** - Visual workflow builder with enterprise-grade automation
- **🎨 ComfyUI Image Generation** - Stable Diffusion AI with 15GB+ models and GPU acceleration
- **🎤 Kokoro TTS** - Premium text-to-speech with 67 voices across 8 languages
- **🎬 FFCreator Video Processing** - GPU-accelerated video composition with Canvas rendering and native Custom built javascript templates
- **🔒 Enterprise Security** - Docker secrets, SSL encryption, Nginx reverse proxy with rate limiting
- **📊 Complete Monitoring** - Health checks, centralized logging, and performance metrics
- **🌐 API-First Design** - RESTful APIs for all services with comprehensive N8N integration

## ✨ Phase 2 planning (on the backburner.Going to upgrade hardware first. so might be a few months out)

  - **🎬 FFCreator Video templates**: Completion of custom built javascript video assebly templates (nearest examples for reference only createOmate, Banner bear, Json2Video) Templates was built and added but not really practical as its running inside the container meaning to add or edit, rebuilding te contianer is required.[Next Phase technical planning](https://github.com/RegardV/n8n-ai-studio-video-pipeline/blob/main/docs/FFcreator-Phase2.md)
  - **🎬 Subtitle display** with word highlighting and configurable options. [ TTS-Agnostic Karaoke Subtitle System - Technical Implementation](https://github.com/RegardV/n8n-ai-studio-video-pipeline/blob/main/docs/karaoke-text-implementation-planning.md)
  - **🎤 Kokoro TTS- Replacement with Chatterbox** kokoro is good but chatterbox offers better ewmotional toning.[Kokoro Service Removal & Chatterbox Integration Guide](https://github.com/RegardV/n8n-ai-studio-video-pipeline/blob/main/docs/Kokoro%20Service%20Removal%20%26%20Chatterbox%20Integration%20Guide.md)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                          │
│              (SSL Termination + Rate Limiting)                  │
│    https://[YourServerIp]/{api/comfyui,api/tts,api/video}      │
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

## 📋 System Status Summary

All containers are running and healthy:
- ✅ **ffcreator-service** - Video processing API (healthy)
- ✅ **n8n-main** - Workflow automation (healthy)
- ✅ **comfyui-main** - AI image generation (healthy)
- ✅ **redis-cache** - Caching & job queue (healthy)
- ✅ **n8n-postgres** - N8N database (healthy)
- ✅ **ffcreator-postgres** - FFCreator database (healthy)
- ⚠️ **kokoro-tts-service** - TTS service (functioning, health check issue)
- 🔄 **nginx-proxy** - Reverse proxy (network wrapper)

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
#!/bin/bash
# N8N AI Studio - Persistent Data Structure Creator
echo "🏗️ Creating N8N AI Studio persistent data structure..."

# Root directories
mkdir -p postgres-data redis-data n8n-data temp-processing logs

# N8N workflow storage
mkdir -p persistent-data/n8n/workflows

# ComfyUI AI image generation
mkdir -p persistent-data/comfyui/run
mkdir -p persistent-data/comfyui/basedir/models/checkpoints
mkdir -p persistent-data/comfyui/basedir/models/loras
mkdir -p persistent-data/comfyui/basedir/models/embeddings
mkdir -p persistent-data/comfyui/basedir/output
mkdir -p persistent-data/comfyui/basedir/workflows
mkdir -p persistent-data/comfyui/basedir/user

# FFCreator video processing
mkdir -p persistent-data/ffcreator
mkdir -p persistent-data/ffcreator-db
mkdir -p persistent-data/videos
mkdir -p persistent-data/ffcreator-cache
mkdir -p persistent-data/assets

# Kokoro TTS
mkdir -p persistent-data/kokoro/models
mkdir -p persistent-data/kokoro/voices  
mkdir -p persistent-data/kokoro/audio
mkdir -p persistent-data/kokoro/cache

# Set permissions (UID 1000 for container compatibility)
sudo chown -R 1000:1000 postgres-data/ redis-data/ n8n-data/ persistent-data/ temp-processing/ logs/
chmod -R 755 postgres-data/ redis-data/ n8n-data/ persistent-data/ temp-processing/ logs/

echo "✅ Persistent data structure created successfully"
```

3. **Set up environment variables**
```bash
# Copy and customize environment
cp .env.example .env
nano .env

# Required variables:
# DOMAIN_NAME=[YourServerIp]
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

# Test API endpoints
curl -k -f https://[YourServerIp]/api/video/health
curl -k -f https://[YourServerIp]/api/tts/v1/audio/voices
curl -k -f https://[YourServerIp]/api/comfyui/queue
```

## 🌐 Nginx Network Architecture & API Endpoints

**Network Flow:**
```
Internet → Nginx (80/443) → Internal Docker Network → Services (expose only)
```

Nginx is the network wrapper - all external requests route through it:
- **External Access**: Only Nginx ports 80/443/8443 exposed
- **Internal Services**: Use expose: for container-to-container communication
- **Security**: No direct external access to ComfyUI, FFCreator, Kokoro

## 📡 API Endpoints

### **🎨 ComfyUI - AI Image Generation**
```bash
Base URL: https://[YourServerIp]/api/comfyui/

# Generate Images
✅ POST /api/comfyui/prompt
✅ GET  /api/comfyui/history/{prompt_id}
✅ GET  /api/comfyui/view?filename={filename}&type=output

# System Status
✅ GET  /api/comfyui/queue
✅ GET  /api/comfyui/object_info
```

**Example Image Generation Request:**
```bash
POST https://[YourServerIp]/api/comfyui/prompt
Content-Type: application/json
{
  "prompt": {
    "3": {
      "inputs": {
        "seed": 42,
        "steps": 20,
        "cfg": 8.0,
        "sampler_name": "euler",
        "scheduler": "normal",
        "denoise": 1.0,
        "model": ["4", 0],
        "positive": ["6", 0],
        "negative": ["7", 0],
        "latent_image": ["5", 0]
      },
      "class_type": "KSampler"
    }
  }
}
```

### **🎤 Kokoro TTS - Text-to-Speech**
```bash
Base URL: https://[YourServerIp]/api/tts/

# Voice Synthesis (67 voices available)
✅ POST /api/tts/v1/audio/speech
✅ GET  /api/tts/v1/audio/voices
✅ GET  /api/tts/audio/{filename}

# Supported languages: English, Spanish, French, Italian, Portuguese, Hindi, Japanese, Chinese
```

**Example TTS Request:**
```bash
POST https://[YourServerIp]/api/tts/v1/audio/speech
Content-Type: application/json
{
  "model": "kokoro_v1",
  "input": "Hello, this is a test of the text to speech system.",
  "voice": "af_bella",
  "response_format": "wav",
  "speed": 1.0,
  "language": "a"
}
```

### **🎬 FFCreator - Video Processing**
```bash
Base URL: https://[YourServerIp]/api/video/

# Video Creation (GPU-accelerated)
✅ POST /api/video/api/videos         # Main production endpoint
✅ GET  /api/video/api/jobs/{jobId}   # Job status tracking
✅ GET  /api/video/download/{filename} # Video download
✅ GET  /api/video/health             # Service health
✅ POST /api/video/create-test-video  # Legacy test endpoint
```

**Example Video Creation Request:**
```bash
POST https://[YourServerIp]/api/video/api/videos
Content-Type: application/json
{
  "config": {
    "width": 1920,
    "height": 1080,
    "fps": 30,
    "background": "#000000",
    "scenes": [
      {
        "duration": 5,
        "elements": [
          {
            "type": "comfyui_image",
            "src": "/app/ai-assets/image_001.png",
            "x": 0,
            "y": 0,
            "width": 1920,
            "height": 1080,
            "animation": "fadeIn",
            "duration": 2
          },
          {
            "type": "subtitle",
            "text": "Generated subtitle text here",
            "x": 960,
            "y": 980,
            "style": {
              "fontSize": 36,
              "color": "#FFFFFF",
              "backgroundColor": "rgba(0,0,0,0.8)"
            },
            "duration": 5
          }
        ]
      }
    ],
    "audio": {
      "src": "/app/tts-audio/speech_001.wav",
      "volume": 1.0
    }
  },
  "output_name": "my_video.mp4",
  "webhook_url": "https://[YourServerIp]/webhook/video-complete"
}
```

## 🧪 Testing Commands to Confirm Services

**Test ComfyUI:**
```bash
# Check queue status
curl -f https://[YourServerIp]/api/comfyui/queue

# List available models  
curl -f https://[YourServerIp]/api/comfyui/object_info
```

**Test Kokoro TTS:**
```bash
# Get available voices (67 voices loaded)
curl -f https://[YourServerIp]/api/tts/v1/audio/voices

# Test simple TTS generation
curl -X POST https://[YourServerIp]/api/tts/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"model":"kokoro_v1","input":"Hello world","voice":"af_bella","response_format":"wav"}'
```

**Test FFCreator:**
```bash
# Health check (should return system status)
curl -f https://[YourServerIp]/api/video/health

# Test video creation
curl -X POST https://[YourServerIp]/api/video/create-test-video \
  -H "Content-Type: application/json" \
  -d '{"title":"N8N Test Video","duration":3}'
```

## 🔄 N8N Workflow Integration Pattern

**Complete Workflow Sequence:**
1. **N8N Trigger** → Receives input data
2. **HTTP Request Node** → POST to ComfyUI for image generation
3. **Wait/Poll Node** → Monitor ComfyUI job completion
4. **HTTP Request Node** → GET generated image from ComfyUI
5. **HTTP Request Node** → POST script to Kokoro for TTS
6. **HTTP Request Node** → GET audio file from Kokoro
7. **HTTP Request Node** → POST combined assets to FFCreator
8. **Wait/Poll Node** → Monitor FFCreator job completion
9. **HTTP Request Node** → GET final video download URL
10. **Webhook Response** → Return video to caller

**File Path Integration:**
- **ComfyUI outputs** → `/app/ai-assets/` (mounted in FFCreator)
- **Kokoro audio** → `/app/tts-audio/` (mounted in FFCreator)
- **FFCreator videos** → `/app/videos/` (accessible via download endpoint)

## 📁 Project Structure

```
n8n-ai-studio/
├── 📄 docker-compose.yml              # Production orchestration (secured)
├── 📄 .env.example                    # Environment template
├── 📄 Alpha-Readme-ProductionGuide.md # Complete production guide
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

## 🔧 N8N HTTP Request Node Configuration

For each HTTP Request node in N8N:
- **URL**: Use the HTTPS endpoints above
- **Method**: POST/GET as appropriate
- **Authentication**: None required (internal network)
- **Headers**: Content-Type: application/json for POST requests
- **SSL**: N8N will handle the self-signed certificate automatically

## 🎯 Next Steps

1. **Start Nginx**: `docker-compose up -d nginx` (complete the network setup)
2. **Test each endpoint** using the curl commands above
3. **Build N8N workflows** using the documented API endpoints
4. **Monitor logs**: `docker-compose logs -f [service_name]` for troubleshooting
5. **Access N8N**: Navigate to `https://[YourServerIp]/` to start building workflows

## 📚 Documentation

- **📖 [Alpha Production Guide](Alpha-Readme-ProductionGuide.md)** - Complete technical setup documentation
- **📡 [API Reference](docs/API.md)** - Complete API documentation with examples
- **🔒 [Security Guide](docs/SECURITY.md)** - Production security best practices
- **🤖 [Model Downloads](docs/MODEL-DOWNLOADS-guide.md)** - AI model acquisition guide
- **🐳 [Docker Images](docs/Docker-Images_documentation.md)** - Container documentation

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

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
- **NVIDIA GPU**: RTX 3080+ minimum with 10GB+ VRAM
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

**Replace `[YourServerIp]` with your actual server IP address in all commands and URLs**
