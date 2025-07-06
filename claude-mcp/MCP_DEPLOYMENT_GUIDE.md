# MCP Server Deployment Guide

## Files Created

I've successfully consolidated your MCP server files from `/tmp/mcp-server-files/` and created the following files with `_new` extensions:

### 📁 Core Files Created:
1. **`server_new.py`** - Complete N8N AI Studio MCP Server (32KB)
2. **`requirements_new.txt`** - Python dependencies
3. **`mcp-dockerfile_new`** - Production Docker configuration
4. **`health_check_new.py`** - Health monitoring script

## Deployment Steps

### Step 1: Move Files to claude-mcp-server Directory
```bash
# You'll need to manually move these files to the claude-mcp-server directory
# and rename them by removing the _new suffix:

sudo mv server_new.py claude-mcp-server/server.py
sudo mv requirements_new.txt claude-mcp-server/requirements.txt
sudo mv mcp-dockerfile_new claude-mcp-server/mcp-dockerfile
sudo mv health_check_new.py claude-mcp-server/health_check.py

# Fix ownership
sudo chown -R inky:inky claude-mcp-server/
```

### Step 2: Build and Test the MCP Server
```bash
# Build the MCP server container
docker-compose build claude-mcp-server

# Start the MCP server
docker-compose up claude-mcp-server -d

# Check logs
docker-compose logs claude-mcp-server
```

### Step 3: Verify Integration
```bash
# Check if the MCP server is accessible
curl http://localhost:3000/
curl http://localhost:8765/

# Test health check
docker exec claude-mcp-server python /app/health_check.py
```

## MCP Server Features

### 🛠️ Available Tools (9 total):
1. **`list_workflows`** - List all N8N workflows
2. **`get_workflow`** - Get specific workflow details
3. **`execute_workflow`** - Execute N8N workflows
4. **`create_multimodal_workflow`** - Create new multimodal workflows
5. **`generate_image`** - Generate images via ComfyUI
6. **`create_video`** - Create videos via FFCreator
7. **`synthesize_speech`** - Generate speech via Kokoro TTS
8. **`get_service_status`** - Check AI service health
9. **`list_generated_assets`** - List generated content

### 📊 Available Resources (3 total):
1. **`n8n://workflows`** - N8N workflow data
2. **`assets://generated`** - Generated content assets
3. **`services://status`** - Service status information

## Integration Points

### 🔗 Service Connections:
- **N8N**: `http://n8n-main:5678`
- **ComfyUI**: `http://comfyui-main:8188`
- **FFCreator**: `http://ffcreator-service:3001`
- **Kokoro TTS**: `http://kokoro-tts-service:8880`
- **Redis**: `redis://redis-cache:6379`

### 🚀 Ports Exposed:
- **8765**: MCP WebSocket (for Claude Desktop)
- **3000**: HTTP API (for health checks)

## Environment Variables

The MCP server uses these environment variables (configured in docker-compose.yml):

```env
N8N_BASE_URL=http://n8n-main:5678
N8N_API_KEY=                    # Optional API key
COMFYUI_BASE_URL=http://comfyui-main:8188
FFCREATOR_BASE_URL=http://ffcreator-service:3001
KOKORO_BASE_URL=http://kokoro-tts-service:8880
REDIS_URL=redis://redis-cache:6379
MCP_SERVER_NAME=n8n-ai-studio-controller
MCP_SERVER_VERSION=1.0.0
```

## Next Steps

1. **Move and rename the files** as shown in Step 1
2. **Test the deployment** using the commands in Step 2
3. **Configure Claude Desktop** to connect to the MCP server on port 8765
4. **Verify all integrations** work with your AI services

## Troubleshooting

### Common Issues:
- **Permission denied**: Run `sudo chown -R inky:inky claude-mcp-server/`
- **Port conflicts**: Check if ports 8765 or 3000 are already in use
- **Service unreachable**: Verify all AI services are running in docker-compose
- **Health check fails**: Check if the MCP server is responding on port 3000

### Logs:
```bash
# View MCP server logs
docker-compose logs -f claude-mcp-server

# Check container status
docker-compose ps claude-mcp-server
```

## File Comparison Summary

### From `/tmp/mcp-server-files/` (Latest - July 3, 2025):
- ✅ **Comprehensive MCP server** (32KB server.py)
- ✅ **Full N8N integration** with 9 tools
- ✅ **Production-ready** Docker setup
- ✅ **Complete dependencies** list

### From `claude-mcp/` (July 2, 2025):
- ❌ **Minimal test server** (965 bytes)
- ❌ **Basic FastAPI** endpoints only
- ❌ **No MCP functionality**

**Result**: Successfully consolidated the most advanced version from `/tmp/mcp-server-files/` 🎉
