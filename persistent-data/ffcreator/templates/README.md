# FFCreator Mobile Templates

This directory contains the native template processing system for mobile-first video generation.

## Files:
- `index.js` - Main template service integration
- `NativeTemplateProcessor.js` - Core template processor
- `MobileTemplateLibrary.js` - Pre-built mobile templates

- `server.js-integrations-Instructions.md` - Pre-built mobile templates

## Usage:
See `/routes/templateRoutes.js` for API endpoints and server integration.


## 📡 New API Endpoints
After integration, you'll have these new endpoints:
Template Management

GET /api/templates - List available templates
POST /api/templates/:templateId/validate - Validate template variables

Video Creation with Templates

POST /api/videos/template - Create video using template ID
POST /api/videos/platform - Create video using platform-specific template
POST /api/videos/custom-template - Create video using custom template

Existing Endpoints (Still Work)

POST /api/videos - Original N8N workflow endpoint
GET /api/jobs/:jobId - Job status checking
GET /download/:filename - File downloads

