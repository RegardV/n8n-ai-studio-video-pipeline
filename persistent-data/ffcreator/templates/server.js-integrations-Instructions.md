# 🔧 Server.js Integration Instructions

## 📁 File Structure

Create this directory structure in your project:

```
/app/
├── server.js (your existing file)
├── templates/
│   ├── index.js
│   ├── NativeTemplateProcessor.js
│   ├── MobileTemplateLibrary.js
│   └── README.md
├── routes/
│   └── templateRoutes.js
└── package.json
```

## 🚀 Step-by-Step Integration

### Step 1: Add Template Service Import

Add this import at the top of your `server.js` file, after your existing requires:

```javascript
// Add this line after your existing requires
const { 
  initializeTemplateService, 
  setupTemplateRoutes, 
  setupTemplateJobProcessors 
} = require('./routes/templateRoutes');
```

### Step 2: Initialize Template Service

Add this line in your `startServer()` function, after Redis initialization:

```javascript
async function startServer() {
  try {
    console.log('🔧 Initializing JWT secret...');
    jwtSecret = await getJwtSecret();
    
    console.log('🔧 Initializing database pool...');
    await initializeDatabase();
    
    console.log('🔧 Initializing Redis connection...');
    await initializeRedis();
    
    console.log('🔧 Initializing video processing queue...');
    initializeQueue();
    
    console.log('🔧 Initializing database schema...');
    await initDatabaseSchema();
    
    // ADD THIS LINE - Initialize template service
    console.log('🔧 Initializing template service...');
    const templateService = initializeTemplateService(logger, {
      CACHE_DIR,
      OUTPUT_DIR,
      ASSETS_DIR,
      TTS_DIR
    });
    
    console.log('🔧 Initializing job processing...');
    initializeJobProcessing();
    
    // ADD THIS LINE - Setup template job processors
    console.log('🔧 Setting up template job processors...');
    setupTemplateJobProcessors(videoQueue, templateService, pool, OUTPUT_DIR);
    
    // ADD THIS LINE - Setup template routes
    console.log('🔧 Setting up template routes...');
    setupTemplateRoutes(app, templateService, pool, videoQueue);
    
    console.log('🔧 Starting HTTP server...');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 FFCreator GPU API server running on port ${PORT}`);
      console.log(`🎮 GPU: RTX 3080 acceleration enabled`);
      console.log(`🗄️  Database: Connected to PostgreSQL`);
      console.log(`🔄 Redis: Connected for job queuing`);
      console.log(`📱 Templates: Mobile templates enabled`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`✅ All services initialized successfully`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}
```

### Step 3: Update Health Check (Optional)

Update your health check endpoint to include template service status:

```javascript
app.get('/health', async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT NOW() as timestamp, version() as pg_version');
    const redisStatus = await redis.ping();
    const hasGpu = validateGpuAccess();
    
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'ffcreator-gpu-api',
      database: {
        connected: true,
        version: dbResult.rows[0].pg_version,
        timestamp: dbResult.rows[0].timestamp
      },
      redis: redisStatus === 'PONG' ? 'connected' : 'disconnected',
      gpu: hasGpu ? 'RTX 3080 available' : 'CPU fallback',
      templates: 'Native mobile templates enabled', // ADD THIS LINE
      memory: process.memoryUsage(),
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

## 📡 New API Endpoints

After integration, you'll have these new endpoints:

### Template Management
- `GET /api/templates` - List available templates
- `POST /api/templates/:templateId/validate` - Validate template variables

### Video Creation with Templates
- `POST /api/videos/template` - Create video using template ID
- `POST /api/videos/platform` - Create video using platform-specific template
- `POST /api/videos/custom-template` - Create video using custom template

### Existing Endpoints (Still Work)
- `POST /api/videos` - Original N8N workflow endpoint
- `GET /api/jobs/:jobId` - Job status checking
- `GET /download/:filename` - File downloads

## 🧪 Testing the Integration

### 1. Test Template Listing
```bash
curl -X GET https://192.168.1.13/api/templates
```

### 2. Test Mobile Template Creation
```bash
curl -X POST https://192.168.1.13/api/videos/template \
  -H "Content-Type: application/json" \
  -d '{
    "template_id": "mobile_vertical_standard",
    "variables": {
      "comfyui_image": "/app/ai-assets/image_001.png",
      "subtitle_text": "AI Generated Mobile Video",
      "tts_audio": "/app/tts-audio/speech_001.wav",
      "duration": 10
    },
    "output_name": "mobile_test_video.mp4"
  }'
```

### 3. Test Platform-Specific Template
```bash
curl -X POST https://192.168.1.13/api/videos/platform \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "tiktok",
    "variables": {
      "comfyui_image": "/app/ai-assets/image_001.png",
      "subtitle_text": "TikTok AI Content",
      "tts_audio": "/app/tts-audio/speech_001.wav",
      "duration": 15
    }
  }'
```

### 4. Test Template Validation
```bash
curl -X POST https://192.168.1.13/api/templates/mobile_tiktok_style/validate \
  -H "Content-Type: application/json" \
  -d '{
    "variables": {
      "comfyui_image": "/app/ai-assets/image_001.png",
      "subtitle_text": "Test subtitle"
    }
  }'
```

## 🔄 N8N Integration Examples

### N8N Workflow: Mobile Template Video Generation

```javascript
// N8N Code Node: Template Configuration
const triggerData = $('Manual Trigger').first().json;
const comfyuiData = $('ComfyUI Request').first().json;
const ttsData = $('Kokoro TTS').first().json;

// Simple template approach
const templateRequest = {
  template_id: triggerData.template_id || 'mobile_vertical_standard',
  variables: {
    comfyui_image: comfyuiData.image_path,
    subtitle_text: triggerData.subtitle_text,
    tts_audio: ttsData.audio_path,
    duration: triggerData.duration || 10
  },
  output_name: `mobile_video_${Date.now()}.mp4`
};

return [{ json: templateRequest }];
```

### N8N HTTP Request Node Configuration
```json
{
  "method": "POST",
  "url": "https://192.168.1.13/api/videos/template",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": "{{ $json }}"
}
```

## 📱 Mobile Template Usage Examples

### Example 1: TikTok Video Generation
```javascript
// N8N Code Node
const mobileConfig = {
  template_id: 'mobile_tiktok_style',
  variables: {
    comfyui_image: $('ComfyUI').first().json.image_path,
    subtitle_text: 'Check out this AI-generated content! 🤖✨',
    tts_audio: $('Kokoro TTS').first().json.audio_path,
    duration: 15
  }
};

return [{ json: mobileConfig }];
```

### Example 2: Instagram Stories
```javascript
// N8N Code Node
const storyConfig = {
  template_id: 'mobile_instagram_stories',
  variables: {
    comfyui_image: $('ComfyUI').first().json.image_path,
    title_text: 'AI Stories',
    subtitle_text: 'Generated with ComfyUI + Kokoro TTS',
    tts_audio: $('Kokoro TTS').first().json.audio_path,
    duration: 15
  }
};

return [{ json: storyConfig }];
```

### Example 3: Platform-Specific Generation
```javascript
// N8N Code Node - Platform Detection
const trigger = $('Manual Trigger').first().json;
const platform = trigger.target_platform || 'tiktok';

const platformConfig = {
  platform: platform,
  variables: {
    comfyui_image: $('ComfyUI').first().json.image_path,
    subtitle_text: trigger.content_text,
    tts_audio: $('Kokoro TTS').first().json.audio_path,
    duration: platform === 'tiktok' ? 15 : (platform === 'youtube_shorts' ? 30 : 10),
    title_text: trigger.title || 'AI Generated Content'
  }
};

return [{ json: platformConfig }];
```

## 🔧 Advanced Configuration

### Custom Template in N8N
```javascript
// N8N Code Node - Custom Mobile Template
const customTemplate = {
  template_config: {
    creator_config: {
      width: 1080,
      height: 1920,
      fps: 30
    },
    scenes: [
      {
        type: 'custom_mobile',
        duration: $('Manual Trigger').first().json.duration || 10,
        background_color: '#1a1a1a',
        elements: [
          {
            type: 'FFImage',
            props: {
              path: '{{comfyui_image}}',
              x: 540,
              y: 960,
              width: 1080,
              height: 1920,
              fit: 'cover'
            },
            animations: [
              { effect: 'zoomIn', duration: 1.5, delay: 0 }
            ]
          },
          {
            type: 'FFText',
            props: {
              text: '{{subtitle_text}}',
              x: 540,
              y: 1700,
              width: 1000,
              style: {
                fontSize: 56,
                color: '#FFFFFF',
                backgroundColor: 'rgba(255, 20, 147, 0.9)',
                textAlign: 'center',
                fontWeight: 'bold',
                padding: '25px',
                borderRadius: '15px',
                textShadow: '3px 3px 6px rgba(0,0,0,0.8)'
              }
            },
            animations: [
              { effect: 'slideInUp', duration: 0.8, delay: 0.7 }
            ]
          }
        ],
        audio: {
          path: '{{tts_audio}}',
          volume: 1.0
        }
      }
    ]
  },
  variables: {
    comfyui_image: $('ComfyUI').first().json.image_path,
    subtitle_text: $('Manual Trigger').first().json.text,
    tts_audio: $('Kokoro TTS').first().json.audio_path
  }
};

return [{ json: customTemplate }];
```

## 🚨 Troubleshooting

### Common Issues and Solutions

1. **Template Not Found Error**
   ```bash
   # Check available templates
   curl -X GET https://192.168.1.13/api/templates
   ```

2. **Missing Variables Error**
   ```bash
   # Validate variables before submission
   curl -X POST https://192.168.1.13/api/templates/mobile_tiktok_style/validate \
     -H "Content-Type: application/json" \
     -d '{"variables": {"comfyui_image": "test.png"}}'
   ```

3. **File Path Issues**
   - Ensure image paths point to `/app/ai-assets/`
   - Ensure audio paths point to `/app/tts-audio/`
   - Use absolute paths or verify relative path resolution

4. **Animation Not Working**
   - Check FFCreator animate.css effect names
   - Verify animation duration and delay values
   - Check console logs for animation warnings

### Logging and Debugging

Add this to your server startup to enable template debugging:

```javascript
// In your server.js startServer function
const templateService = initializeTemplateService({
  ...logger,
  level: 'debug'  // Enable debug logging
}, {
  CACHE_DIR,
  OUTPUT_DIR,
  ASSETS_DIR,
  TTS_DIR
});
```

## 📊 Performance Monitoring

The template system includes automatic performance monitoring:

- **Template Processing Time**: Logged for each template type
- **Memory Usage**: Tracked during video generation
- **GPU Utilization**: Monitored for optimal performance
- **Queue Status**: Track template jobs vs regular jobs

## 🎯 Next Steps

1. **Test the Integration**: Use the curl commands above to verify everything works
2. **Create N8N Workflows**: Build workflows using the new template endpoints
3. **Monitor Performance**: Watch logs for any issues or optimization opportunities
4. **Expand Templates**: Add custom templates to the MobileTemplateLibrary as needed
5. **Scale Up**: The system supports multiple concurrent template jobs

## 🔄 Migration from JSON Templates

If you're migrating from JSON-based templates:

1. **Keep Existing Endpoints**: Your original `/api/videos` endpoint still works
2. **Gradual Migration**: Use new template endpoints for new workflows
3. **Template Conversion**: Convert JSON templates to native JavaScript templates
4. **Performance Benefits**: Native templates will be faster and more reliable

The modular design ensures you can adopt templates gradually without breaking existing functionality.
