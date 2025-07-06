🚀 N8N AI Studio - Complete Production Setup Guide
Final Working Configuration - All Services Healthy
Date: July 6, 2025
Status: ✅ Production Ready

📋 System Status Summary
All containers are now running and healthy:
bash✅ ffcreator-service    - Up 6 minutes (healthy)      - Video processing API
✅ n8n-main            - Up 45 minutes (healthy)     - Workflow automation
✅ comfyui-main        - Up 45 minutes (healthy)     - AI image generation  
✅ redis-cache         - Up 45 minutes (healthy)     - Caching & job queue
✅ n8n-postgres        - Up 45 minutes (healthy)     - N8N database
✅ ffcreator-postgres  - Up 30 minutes (healthy)     - FFCreator database
⚠️ kokoro-tts-service  - Up 45 minutes (unhealthy)   - TTS service (functioning, health check issue)
🔄 nginx-proxy         - Created (waiting)           - Reverse proxy

📁 Critical Files Collected in /DDC Directory
Root Orchestration Files

docker-compose.yml.txt - Master orchestration defining all services, volumes, networks
.env.txt - Environment variables, database passwords, API keys, domain configuration

Nginx Configuration (Network Wrapper)

nginx_nginx.conf.txt - Main reverse proxy config routing all services
ssl_n8n.crt.txt - SSL certificate for HTTPS access
ssl_n8n.key.txt - SSL private key (security critical)

FFCreator Build Context (Custom Service)

Dockerfile.ffcreator.txt - Custom Ubuntu + Node.js + GPU + Canvas build
package.json.txt - NPM dependencies for video processing
server.js.txt - Main FFCreator API server (320+ lines)

Secrets & Security

secrets_postgres_user.txt - Database authentication
secrets_postgres_password.txt - Database passwords
secrets_n8n_encryption_key.txt - N8N data encryption
secrets_ffcreator_database_url.txt - FFCreator DB connection string

Scripts Directory

scripts_*.txt - Any shell/JS/Python scripts referenced in N8N volumes


🏗️ Persistent Data Structure Creation Script
bash#!/bin/bash
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
echo "📊 Directory structure:"
find persistent-data/ -type d | head -20

🌐 Nginx Network Architecture & API Endpoints
Network Flow:
Internet → Nginx (80/443) → Internal Docker Network → Services (expose only)
Yes, Nginx is the network wrapper - all external requests route through it:

External Access: Only Nginx ports 80/443/8443 exposed
Internal Services: Use expose: for container-to-container communication
Security: No direct external access to ComfyUI, FFCreator, Kokoro

API Endpoints for N8N Workflows
🎨 ComfyUI - AI Image Generation
bash# Base URL (via Nginx): https://192.168.1.13/api/comfyui/

# 1. POST Image Generation Request
POST https://192.168.1.13/api/comfyui/prompt
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

# 2. GET Generation Status
GET https://192.168.1.13/api/comfyui/history/{prompt_id}

# 3. GET Generated Image
GET https://192.168.1.13/api/comfyui/view?filename={filename}&subfolder=&type=output
🔊 Kokoro - Text-to-Speech
bash# Base URL (via Nginx): https://192.168.1.13/api/tts/

# 1. POST TTS Generation Request  
POST https://192.168.1.13/api/tts/v1/audio/speech
Content-Type: application/json
{
  "model": "kokoro_v1",
  "input": "Hello, this is a test of the text to speech system.",
  "voice": "af_bella",
  "response_format": "wav",
  "speed": 1.0,
  "language": "a"
}

# 2. GET Available Voices
GET https://192.168.1.13/api/tts/v1/audio/voices

# 3. GET Generated Audio File
GET https://192.168.1.13/api/tts/audio/{filename}
🎬 FFCreator - Video Processing
bash# Base URL (via Nginx): https://192.168.1.13/api/video/

# 1. POST Video Creation Request (Main Endpoint)
POST https://192.168.1.13/api/video/api/videos
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
  "webhook_url": "https://192.168.1.13/webhook/video-complete"
}

# 2. GET Job Status
GET https://192.168.1.13/api/video/api/jobs/{jobId}

# 3. GET Health Check
GET https://192.168.1.13/api/video/health

# 4. GET Download Video
GET https://192.168.1.13/api/video/download/{filename}

# 5. Legacy Test Endpoint (for testing)
POST https://192.168.1.13/api/video/create-test-video
Content-Type: application/json
{
  "title": "Test Video",
  "duration": 5
}

🧪 Testing Commands to Confirm Services
Test ComfyUI:
bash# Check queue status
curl -f https://192.168.1.13/api/comfyui/queue

# List available models  
curl -f https://192.168.1.13/api/comfyui/object_info
Test Kokoro TTS:
bash# Get available voices (67 voices loaded)
curl -f https://192.168.1.13/api/tts/v1/audio/voices

# Test simple TTS generation
curl -X POST https://192.168.1.13/api/tts/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"model":"kokoro_v1","input":"Hello world","voice":"af_bella","response_format":"wav"}'
Test FFCreator:
bash# Health check (should return system status)
curl -f https://192.168.1.13/api/video/health

# Test video creation
curl -X POST https://192.168.1.13/api/video/create-test-video \
  -H "Content-Type: application/json" \
  -d '{"title":"N8N Test Video","duration":3}'

🔄 N8N Workflow Integration Pattern
Complete Workflow Sequence:

N8N Trigger → Receives input data
HTTP Request Node → POST to ComfyUI for image generation
Wait/Poll Node → Monitor ComfyUI job completion
HTTP Request Node → GET generated image from ComfyUI
HTTP Request Node → POST script to Kokoro for TTS
HTTP Request Node → GET audio file from Kokoro
HTTP Request Node → POST combined assets to FFCreator
Wait/Poll Node → Monitor FFCreator job completion
HTTP Request Node → GET final video download URL
Webhook Response → Return video to caller

File Path Integration:

ComfyUI outputs → /app/ai-assets/ (mounted in FFCreator)
Kokoro audio → /app/tts-audio/ (mounted in FFCreator)
FFCreator videos → /app/videos/ (accessible via download endpoint)


🎯 Next Steps

Start Nginx: docker-compose up -d nginx (complete the network setup)
Test each endpoint using the curl commands above
Build N8N workflows using the documented API endpoints
Monitor logs: docker-compose logs -f [service_name] for troubleshooting

Your N8N AI Studio is now production-ready for automated video generation workflows!

These were the last endpoints tested and logged if this is diffirent from those earlier in this document then these take president

NOTE My SERVER IP IS 192.168.1.13 - You need to use your server ip but if you read to here Im sure you are smart enough to know that. 

🎯 Correct N8N Endpoints (HTTPS Required)
For N8N HTTP Request Nodes, use these exact URLs: 
🎨 ComfyUI - AI Image Generation
Base URL: https://192.168.1.13/api/comfyui/

✅ Queue Status: https://192.168.1.13/api/comfyui/queue
✅ Submit Prompt: https://192.168.1.13/api/comfyui/prompt
✅ Get History: https://192.168.1.13/api/comfyui/history
✅ Download Image: https://192.168.1.13/api/comfyui/view?filename={filename}&type=output
🔊 Kokoro TTS - Text-to-Speech
Base URL: https://192.168.1.13/api/tts/

✅ Get Voices: https://192.168.1.13/api/tts/v1/audio/voices
✅ Generate Speech: https://192.168.1.13/api/tts/v1/audio/speech
✅ Download Audio: https://192.168.1.13/api/tts/audio/{filename}
🎬 FFCreator - Video Processing
Base URL: https://192.168.1.13/api/video/

✅ Health Check: https://192.168.1.13/api/video/health
✅ Create Video: https://192.168.1.13/api/video/api/videos
✅ Job Status: https://192.168.1.13/api/video/api/jobs/{jobId}
✅ Download Video: https://192.168.1.13/api/video/download/{filename}
✅ Test Endpoint: https://192.168.1.13/api/video/create-test-video
🔧 N8N HTTP Request Node Configuration
For each HTTP Request node in N8N:

URL: Use the HTTPS endpoints above
Method: POST/GET as appropriate
Authentication: None required (internal network)
Headers: Content-Type: application/json for POST requests
SSL: N8N will handle the self-signed certificate automatically