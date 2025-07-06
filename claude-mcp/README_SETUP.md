# MCP Server Setup Instructions

## Files to Populate

After running the setup script, you need to add content to these files:

### 1. Dockerfile
- Copy content from artifact: `mcp-dockerfile`
- This file defines the Docker container for the MCP server

### 2. requirements.txt  
- Copy the Python dependencies list
- Required packages for the MCP server to run

### 3. server.py
- Copy content from artifact: `mcp-main-server`
- This is the main MCP server application

### 4. health_check.py
- Copy the health check script content
- Used by Docker to monitor container health

## Files to Modify

### 5. docker-compose.yml
- Add the MCP service definition from artifact: `mcp-service-addition`
- Insert after your existing services

### 6. nginx/nginx.conf (Optional)
- Add MCP proxy configuration from artifact: `nginx-mcp-addition`
- Only needed if you want web access to MCP server

### 7. .env
- Add MCP environment variables:
```
# Claude MCP Server Configuration
N8N_API_KEY=your-n8n-api-key-if-you-have-one
MCP_SERVER_PORT=8765
HTTP_PORT=3000
LOG_LEVEL=INFO
```

## Next Steps

1. Populate all the files with content
2. Run: `docker-compose build claude-mcp-server`
3. Run: `docker-compose up -d claude-mcp-server`
4. Test: `curl http://localhost:3000/health`
