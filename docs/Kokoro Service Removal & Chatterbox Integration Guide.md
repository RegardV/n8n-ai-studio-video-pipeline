# Kokoro Service Removal & Chatterbox Integration Guide

## Complete Kokoro Dependency Analysis

### Docker Compose Integration Points

**1. Service Definition (docker-compose.yml)**
```yaml
# REMOVE: Complete kokoro service block
kokoro:
  image: ghcr.io/remsky/kokoro-fastapi-gpu:latest
  container_name: kokoro-tts-service
  runtime: nvidia
  expose: ["8880"]
  environment: [NVIDIA_VISIBLE_DEVICES, CUDA_VISIBLE_DEVICES, etc.]
  volumes: [./persistent-data/kokoro/models, ./persistent-data/kokoro/voices, etc.]
  networks: [n8n-ai-studio_ai-network]
```

**2. Nginx Routing Configuration (nginx/nginx.conf)**
```nginx
# REMOVE: Kokoro upstream definition
upstream kokoro_backend {
  server kokoro-tts-service:8880 max_fails=3 fail_timeout=30s;
  keepalive 16;
}

# REMOVE: All /api/tts/ location blocks
location /api/tts/ { ... }
location /api/tts/audio { ... }
```

**3. Network Dependencies**
```yaml
# REMOVE from depends_on in other services:
ffcreator:
  depends_on:
    - kokoro  # REMOVE THIS LINE
```

### File System Integration Points

**4. Persistent Data Structure**
```bash
# REMOVE: Complete kokoro directory tree
./persistent-data/kokoro/
├── models/           # TTS models (several GB)
├── voices/           # Voice samples  
├── audio/            # Generated audio output
└── cache/            # Processing cache
```

**5. Volume Mount Points**
```yaml
# REMOVE from ffcreator service volumes:
- ./persistent-data/kokoro/audio:/app/tts-audio:ro

# REMOVE from n8n service volumes:  
- ./persistent-data/kokoro/audio:/outputs:rw
```

**6. Shared Audio Directory References**
```bash
# REMOVE or RENAME volume mounts referencing:
/app/tts-audio/        # FFCreator TTS input path
/app/n8n-tts-output/   # N8N TTS output path
```

### Application Integration Points

**7. FFCreator Server Integration (server.js)**
```javascript
// REMOVE: Environment variable references
const TTS_DIR = process.env.TTS_DIR || '/app/tts-audio';

// REMOVE: Health check endpoints for Kokoro
app.get('/health', async (req, res) => {
  // Remove Kokoro service status check
  const kokoro = await checkKokoroStatus(); // REMOVE
});

// REMOVE: TTS-related route handlers
app.get('/api/tts/*', ...);  // May exist for proxying
```

**8. Template System Integration**
```javascript
// REMOVE from templates/NativeTemplateProcessor.js:
addSceneAudio(scene, audioConfig, variables) {
  let audioPath = this.resolveValue(audioConfig.path, variables);
  // Path resolution for /app/tts-audio/ directory
}

// REMOVE from templates/MobileTemplateLibrary.js:
variables: {
  tts_audio: Joi.string().required(),  // Template validation
}
```

**9. Template Routes Integration (routes/templateRoutes.js)**
```javascript
// REMOVE: TTS audio validation in template processors
const validation = templateService.validateVariables(templateId, variables);
// Validation includes tts_audio parameter checking

// REMOVE: Template variable examples referencing TTS
const templateRequest = {
  variables: {
    tts_audio: audioData.audioPath,  // REMOVE
  }
};
```

### Environment Configuration

**10. Environment Variables (.env)**
```bash
# REMOVE: Kokoro-specific configuration
KOKORO_MODEL_DIR=/app/models
KOKORO_VOICES_DIR=/app/voices
KOKORO_AUDIO_DIR=/app/audio
TTS_SERVICE_URL=http://kokoro-tts-service:8880
```

**11. Docker Secrets (if implemented)**
```yaml
# REMOVE: Any TTS-related secrets
secrets:
  kokoro_api_key:    # If using authentication
  tts_model_config:  # If using custom configurations
```

### N8N Workflow Integration Points

**12. N8N Workflow Documentation**
```markdown
# REMOVE: All TTS workflow examples from documentation
- Node configurations for Kokoro TTS API calls
- HTTP request examples to /api/tts/ endpoints  
- TTS audio file handling and processing
- Multi-language voice selection workflows
```

**13. API Endpoint Documentation**
```markdown
# REMOVE: TTS API documentation sections
- Available Voices: GET /api/tts/v1/audio/voices
- Generate Speech: POST /api/tts/v1/audio/speech  
- Download Audio: GET /api/tts/audio/{filename}
```

### GPU Resource Management

**14. GPU Memory Allocation**
```yaml
# MODIFY: GPU allocation strategy in docker-compose.yml
# Current: ComfyUI 75%, Kokoro 15%, FFCreator 90% (post-cleanup)
# New: ComfyUI 75%, FFCreator 95% (more available memory)

environment:
  # REMOVE Kokoro-specific GPU settings:
  - PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:128
  - CUDA_EMPTY_CACHE_ON_EXIT=1
```

### Health Check & Monitoring

**15. System Health Checks**
```javascript
// REMOVE from health check endpoints:
const healthChecks = await Promise.all([
  $httpRequest({ url: 'https://192.168.1.13/api/tts/v1/audio/voices' }), // REMOVE
]);

// REMOVE Kokoro status from health responses:
kokoro_status: healthChecks[2].statusCode === 200,  // REMOVE
```

**16. Logging & Monitoring**
```bash
# REMOVE: Log file references
/var/log/services/kokoro-tts.log
/var/log/services/kokoro-error.log

# REMOVE: Container monitoring
docker logs kokoro-tts-service
```

### Template & Workflow Dependencies

**17. Template Variable References**
```javascript
// SCAN AND REMOVE from all templates:
- tts_audio: '{{tts_audio}}'
- audioPath: '/app/tts-audio/filename.wav'
- kokoroData references in workflow nodes

// UPDATE template validation schemas:
templateValidationSchemas = {
  templateById: {
    variables: {
      tts_audio: Joi.string().required(),  // REMOVE OR MAKE OPTIONAL
    }
  }
};
```

**18. N8N Workflow Integration Points**
```javascript
// REMOVE from N8N workflow examples:
- TTS Generation HTTP request nodes
- Audio file processing and validation
- Multi-language voice selection logic
- TTS audio duration calculations for video timing
```

## Complete Removal Process

### Step 1: Service Shutdown & Data Backup
```bash
# Stop Kokoro service
docker-compose stop kokoro-tts-service

# Backup any important audio files (optional)
cp -r ./persistent-data/kokoro/audio ./backup/kokoro-audio-backup/

# Remove container and images
docker-compose rm kokoro-tts-service
docker rmi ghcr.io/remsky/kokoro-fastapi-gpu:latest
```

### Step 2: Configuration File Updates
```bash
# Update docker-compose.yml (remove kokoro service block)
# Update nginx.conf (remove TTS upstream and locations)
# Update .env (remove Kokoro environment variables)
# Update any health check scripts
```

### Step 3: Application Code Cleanup
```bash
# Update server.js (remove TTS endpoints and health checks)
# Update template files (remove tts_audio references)
# Update validation schemas (make audio optional or remove)
# Update documentation (remove TTS workflow examples)
```

### Step 4: File System Cleanup
```bash
# Remove Kokoro persistent data (WARNING: Destructive)
rm -rf ./persistent-data/kokoro/

# Update volume mounts in docker-compose.yml
# Remove TTS directory references from other services
```

### Step 5: Testing & Validation
```bash
# Start updated services
docker-compose up -d

# Verify services start without Kokoro dependencies
docker-compose ps

# Test health endpoints (should not reference TTS)
curl https://192.168.1.13/health

# Verify templates work without TTS (may need template updates)
```

## Chatterbox Integration Path

### Quick Integration Overview

**1. Service Addition to Docker Compose**
```yaml
chatterbox-tts:
  image: bhimrazy/chatterbox-tts:latest  # or build custom
  container_name: chatterbox-tts-service
  runtime: nvidia
  expose: ["8004"]
  environment:
    - NVIDIA_VISIBLE_DEVICES=0
    - CUDA_VISIBLE_DEVICES=0
  volumes:
    - ./persistent-data/chatterbox/models:/app/models:rw
    - ./persistent-data/chatterbox/audio:/app/audio:rw
  networks:
    - n8n-ai-studio_ai-network
```

**2. Nginx Routing Update**
```nginx
upstream chatterbox_backend {
  server chatterbox-tts-service:8004 max_fails=3 fail_timeout=30s;
}

location /api/tts/ {
  proxy_pass http://chatterbox_backend;
  # Standard proxy configuration
}
```

**3. API Compatibility Layer**
The Chatterbox TTS Server provides OpenAI-compatible endpoints, which may require API translation if your current N8N workflows expect Kokoro's specific API format.

**4. Template System Updates**
```javascript
// Update template variable paths
tts_audio: '/app/chatterbox-audio/filename.wav'

// Update audio processing in templates
audioPath = path.resolve(this.options.chatterboxDir, audioPath);
```

**5. N8N Workflow Adaptations**
- Update HTTP request nodes to use Chatter
