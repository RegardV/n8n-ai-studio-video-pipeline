#!/usr/bin/env python3
"""
N8N AI Studio MCP Server
A comprehensive MCP server for controlling N8N workflows and multimodal AI services
"""

import asyncio
import json
import logging
import os
import sys
from datetime import datetime
from typing import Any, Dict, List, Optional, Sequence
from urllib.parse import urljoin

import httpx
from mcp.server import Server
from mcp.server.models import InitializationOptions
from mcp.server.stdio import stdio_server
from mcp.types import (
    CallToolRequest,
    CallToolResult,
    ListResourcesRequest,
    ListResourcesResult,
    ListToolsRequest,
    ListToolsResult,
    ReadResourceRequest,
    ReadResourceResult,
    Resource,
    TextContent,
    Tool,
)
from pydantic import BaseModel

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/app/logs/mcp-server.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("n8n-mcp-server")

# Configuration from environment variables
class Config:
    N8N_BASE_URL = os.getenv("N8N_BASE_URL", "http://n8n-main:5678")
    N8N_API_KEY = os.getenv("N8N_API_KEY", "")
    COMFYUI_BASE_URL = os.getenv("COMFYUI_BASE_URL", "http://comfyui-main:8188")
    FFCREATOR_BASE_URL = os.getenv("FFCREATOR_BASE_URL", "http://ffcreator-service:3001")
    KOKORO_BASE_URL = os.getenv("KOKORO_BASE_URL", "http://kokoro-tts-service:8880")
    REDIS_URL = os.getenv("REDIS_URL", "redis://redis-cache:6379")
    
    # MCP Server settings
    SERVER_NAME = os.getenv("MCP_SERVER_NAME", "n8n-ai-studio-controller")
    SERVER_VERSION = os.getenv("MCP_SERVER_VERSION", "1.0.0")

class N8NMCPServer:
    """Main MCP Server class for N8N AI Studio control"""
    
    def __init__(self):
        self.server = Server(Config.SERVER_NAME)
        self.http_client = None
        self.setup_handlers()
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.http_client = httpx.AsyncClient(timeout=30.0)
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit - cleanup resources"""
        if self.http_client:
            await self.http_client.aclose()
            self.http_client = None
    
    def setup_handlers(self):
        """Setup MCP server handlers"""
        
        @self.server.list_tools()
        async def handle_list_tools() -> List[Tool]:
            """List available tools for Claude to use"""
            return [
                Tool(
                    name="list_workflows",
                    description="List all N8N workflows with their status and details",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "active_only": {
                                "type": "boolean",
                                "description": "Only return active workflows",
                                "default": False
                            }
                        }
                    }
                ),
                Tool(
                    name="get_workflow",
                    description="Get detailed information about a specific N8N workflow",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "workflow_id": {
                                "type": "string",
                                "description": "The ID of the workflow to retrieve"
                            }
                        },
                        "required": ["workflow_id"]
                    }
                ),
                Tool(
                    name="execute_workflow",
                    description="Execute an N8N workflow with optional input data",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "workflow_id": {
                                "type": "string",
                                "description": "The ID of the workflow to execute"
                            },
                            "input_data": {
                                "type": "object",
                                "description": "Input data to pass to the workflow",
                                "default": {}
                            },
                            "wait_for_completion": {
                                "type": "boolean",
                                "description": "Wait for workflow execution to complete",
                                "default": True
                            }
                        },
                        "required": ["workflow_id"]
                    }
                ),
                Tool(
                    name="create_multimodal_workflow",
                    description="Create a new multimodal workflow that combines text, image, video, and audio generation",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "Name for the new workflow"
                            },
                            "description": {
                                "type": "string",
                                "description": "Description of what the workflow does"
                            },
                            "workflow_type": {
                                "type": "string",
                                "enum": ["content_creation", "social_media", "educational", "marketing", "custom"],
                                "description": "Type of multimodal workflow to create"
                            },
                            "components": {
                                "type": "array",
                                "items": {
                                    "type": "string",
                                    "enum": ["text_processing", "image_generation", "video_creation", "audio_synthesis"]
                                },
                                "description": "Components to include in the workflow"
                            }
                        },
                        "required": ["name", "workflow_type", "components"]
                    }
                ),
                Tool(
                    name="generate_image",
                    description="Generate an image using ComfyUI with specified parameters",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "prompt": {
                                "type": "string",
                                "description": "Text prompt for image generation"
                            },
                            "negative_prompt": {
                                "type": "string",
                                "description": "Negative prompt to avoid certain elements",
                                "default": ""
                            },
                            "width": {
                                "type": "integer",
                                "description": "Image width",
                                "default": 512
                            },
                            "height": {
                                "type": "integer",
                                "description": "Image height",
                                "default": 512
                            },
                            "steps": {
                                "type": "integer",
                                "description": "Number of generation steps",
                                "default": 20
                            }
                        },
                        "required": ["prompt"]
                    }
                ),
                Tool(
                    name="create_video",
                    description="Create a video using FFCreator with images, text, and audio",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string",
                                "description": "Video title"
                            },
                            "images": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "List of image file paths or URLs"
                            },
                            "audio_file": {
                                "type": "string",
                                "description": "Audio file path for background music or narration",
                                "default": ""
                            },
                            "duration": {
                                "type": "number",
                                "description": "Video duration in seconds",
                                "default": 10
                            },
                            "transition": {
                                "type": "string",
                                "enum": ["fade", "slide", "zoom", "none"],
                                "description": "Transition effect between images",
                                "default": "fade"
                            }
                        },
                        "required": ["title", "images"]
                    }
                ),
                Tool(
                    name="synthesize_speech",
                    description="Generate speech audio using Kokoro TTS",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "text": {
                                "type": "string",
                                "description": "Text to convert to speech"
                            },
                            "voice": {
                                "type": "string",
                                "description": "Voice to use for synthesis",
                                "default": "default"
                            },
                            "speed": {
                                "type": "number",
                                "description": "Speech speed multiplier",
                                "default": 1.0
                            },
                            "output_format": {
                                "type": "string",
                                "enum": ["wav", "mp3"],
                                "description": "Output audio format",
                                "default": "wav"
                            }
                        },
                        "required": ["text"]
                    }
                ),
                Tool(
                    name="get_service_status",
                    description="Check the status of all AI services (N8N, ComfyUI, FFCreator, Kokoro)",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "service": {
                                "type": "string",
                                "enum": ["all", "n8n", "comfyui", "ffcreator", "kokoro"],
                                "description": "Which service to check",
                                "default": "all"
                            }
                        }
                    }
                ),
                Tool(
                    name="list_generated_assets",
                    description="List generated assets (images, videos, audio) from the AI services",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "asset_type": {
                                "type": "string",
                                "enum": ["all", "images", "videos", "audio"],
                                "description": "Type of assets to list",
                                "default": "all"
                            },
                            "limit": {
                                "type": "integer",
                                "description": "Maximum number of assets to return",
                                "default": 20
                            }
                        }
                    }
                )
            ]
        
        @self.server.call_tool()
        async def handle_call_tool(name: str, arguments: Dict[str, Any]) -> CallToolResult:
            """Handle tool calls from Claude"""
            try:
                logger.info(f"Calling tool: {name} with arguments: {arguments}")
                
                if name == "list_workflows":
                    return await self.list_workflows(arguments.get("active_only", False))
                elif name == "get_workflow":
                    return await self.get_workflow(arguments["workflow_id"])
                elif name == "execute_workflow":
                    return await self.execute_workflow(
                        arguments["workflow_id"],
                        arguments.get("input_data", {}),
                        arguments.get("wait_for_completion", True)
                    )
                elif name == "create_multimodal_workflow":
                    return await self.create_multimodal_workflow(
                        arguments["name"],
                        arguments.get("description", ""),
                        arguments["workflow_type"],
                        arguments["components"]
                    )
                elif name == "generate_image":
                    return await self.generate_image(arguments)
                elif name == "create_video":
                    return await self.create_video(arguments)
                elif name == "synthesize_speech":
                    return await self.synthesize_speech(arguments)
                elif name == "get_service_status":
                    return await self.get_service_status(arguments.get("service", "all"))
                elif name == "list_generated_assets":
                    return await self.list_generated_assets(
                        arguments.get("asset_type", "all"),
                        arguments.get("limit", 20)
                    )
                else:
                    return CallToolResult(
                        content=[TextContent(type="text", text=f"Unknown tool: {name}")]
                    )
                    
            except Exception as e:
                logger.error(f"Error calling tool {name}: {str(e)}")
                return CallToolResult(
                    content=[TextContent(type="text", text=f"Error: {str(e)}")]
                )
        
        @self.server.list_resources()
        async def handle_list_resources() -> List[Resource]:
            """List available resources"""
            return [
                Resource(
                    uri="n8n://workflows",
                    name="N8N Workflows",
                    description="List of all N8N workflows",
                    mimeType="application/json"
                ),
                Resource(
                    uri="assets://generated",
                    name="Generated Assets",
                    description="Generated images, videos, and audio files",
                    mimeType="application/json"
                ),
                Resource(
                    uri="services://status",
                    name="Service Status",
                    description="Status of all AI services",
                    mimeType="application/json"
                )
            ]
        
        @self.server.read_resource()
        async def handle_read_resource(uri: str) -> ReadResourceResult:
            """Read resource content"""
            try:
                if uri == "n8n://workflows":
                    workflows = await self._get_n8n_workflows()
                    return ReadResourceResult(
                        contents=[TextContent(type="text", text=json.dumps(workflows, indent=2))]
                    )
                elif uri == "assets://generated":
                    assets = await self._get_generated_assets()
                    return ReadResourceResult(
                        contents=[TextContent(type="text", text=json.dumps(assets, indent=2))]
                    )
                elif uri == "services://status":
                    status = await self._get_all_service_status()
                    return ReadResourceResult(
                        contents=[TextContent(type="text", text=json.dumps(status, indent=2))]
                    )
                else:
                    return ReadResourceResult(
                        contents=[TextContent(type="text", text=f"Resource not found: {uri}")]
                    )
            except Exception as e:
                logger.error(f"Error reading resource {uri}: {str(e)}")
                return ReadResourceResult(
                    contents=[TextContent(type="text", text=f"Error: {str(e)}")]
                )
    
    # Tool implementation methods
    async def list_workflows(self, active_only: bool = False) -> CallToolResult:
        """List N8N workflows"""
        try:
            workflows = await self._get_n8n_workflows()
            if active_only:
                workflows = [w for w in workflows if w.get("active", False)]
            
            result = {
                "total_workflows": len(workflows),
                "workflows": workflows
            }
            
            return CallToolResult(
                content=[TextContent(type="text", text=json.dumps(result, indent=2))]
            )
        except Exception as e:
            return CallToolResult(
                content=[TextContent(type="text", text=f"Error listing workflows: {str(e)}")]
            )
    
    async def get_workflow(self, workflow_id: str) -> CallToolResult:
        """Get specific workflow details"""
        try:
            url = f"{Config.N8N_BASE_URL}/api/v1/workflows/{workflow_id}"
            headers = {"X-N8N-API-KEY": Config.N8N_API_KEY} if Config.N8N_API_KEY else {}
            
            response = await self.http_client.get(url, headers=headers)
            response.raise_for_status()
            
            workflow = response.json()
            return CallToolResult(
                content=[TextContent(type="text", text=json.dumps(workflow, indent=2))]
            )
        except Exception as e:
            return CallToolResult(
                content=[TextContent(type="text", text=f"Error getting workflow: {str(e)}")]
            )
    
    async def execute_workflow(self, workflow_id: str, input_data: Dict[str, Any], wait_for_completion: bool = True) -> CallToolResult:
        """Execute N8N workflow"""
        try:
            url = f"{Config.N8N_BASE_URL}/api/v1/workflows/{workflow_id}/execute"
            headers = {"X-N8N-API-KEY": Config.N8N_API_KEY} if Config.N8N_API_KEY else {}
            
            payload = {"data": input_data}
            response = await self.http_client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            
            execution = response.json()
            
            if wait_for_completion and execution.get("id"):
                # Poll for completion
                execution_id = execution["id"]
                for _ in range(30):  # Wait up to 30 seconds
                    await asyncio.sleep(1)
                    status_url = f"{Config.N8N_BASE_URL}/api/v1/executions/{execution_id}"
                    status_response = await self.http_client.get(status_url, headers=headers)
                    if status_response.status_code == 200:
                        execution_status = status_response.json()
                        if execution_status.get("finished"):
                            execution = execution_status
                            break
            
            return CallToolResult(
                content=[TextContent(type="text", text=json.dumps(execution, indent=2))]
            )
        except Exception as e:
            return CallToolResult(
                content=[TextContent(type="text", text=f"Error executing workflow: {str(e)}")]
            )
    
    async def create_multimodal_workflow(self, name: str, description: str, workflow_type: str, components: List[str]) -> CallToolResult:
        """Create a new multimodal workflow"""
        try:
            # Generate workflow definition based on components
            workflow_definition = self._generate_multimodal_workflow_definition(
                name, description, workflow_type, components
            )
            
            url = f"{Config.N8N_BASE_URL}/api/v1/workflows"
            headers = {"X-N8N-API-KEY": Config.N8N_API_KEY} if Config.N8N_API_KEY else {}
            
            response = await self.http_client.post(url, headers=headers, json=workflow_definition)
            response.raise_for_status()
            
            created_workflow = response.json()
            return CallToolResult(
                content=[TextContent(type="text", text=f"Created multimodal workflow: {json.dumps(created_workflow, indent=2)}")]
            )
        except Exception as e:
            return CallToolResult(
                content=[TextContent(type="text", text=f"Error creating workflow: {str(e)}")]
            )
    
    async def generate_image(self, params: Dict[str, Any]) -> CallToolResult:
        """Generate image using ComfyUI"""
        try:
            # Create ComfyUI workflow for image generation
            workflow = {
                "prompt": params["prompt"],
                "negative_prompt": params.get("negative_prompt", ""),
                "width": params.get("width", 512),
                "height": params.get("height", 512),
                "steps": params.get("steps", 20)
            }
            
            url = f"{Config.COMFYUI_BASE_URL}/api/prompt"
            response = await self.http_client.post(url, json={"prompt": workflow})
            response.raise_for_status()
            
            result = response.json()
            return CallToolResult(
                content=[TextContent(type="text", text=f"Image generation started: {json.dumps(result, indent=2)}")]
            )
        except Exception as e:
            return CallToolResult(
                content=[TextContent(type="text", text=f"Error generating image: {str(e)}")]
            )
    
    async def create_video(self, params: Dict[str, Any]) -> CallToolResult:
        """Create video using FFCreator"""
        try:
            video_config = {
                "title": params["title"],
                "images": params["images"],
                "audio_file": params.get("audio_file", ""),
                "duration": params.get("duration", 10),
                "transition": params.get("transition", "fade")
            }
            
            url = f"{Config.FFCREATOR_BASE_URL}/api/create"
            response = await self.http_client.post(url, json=video_config)
            response.raise_for_status()
            
            result = response.json()
            return CallToolResult(
                content=[TextContent(type="text", text=f"Video creation started: {json.dumps(result, indent=2)}")]
            )
        except Exception as e:
            return CallToolResult(
                content=[TextContent(type="text", text=f"Error creating video: {str(e)}")]
            )
    
    async def synthesize_speech(self, params: Dict[str, Any]) -> CallToolResult:
        """Synthesize speech using Kokoro TTS"""
        try:
            tts_config = {
                "text": params["text"],
                "voice": params.get("voice", "default"),
                "speed": params.get("speed", 1.0),
                "output_format": params.get("output_format", "wav")
            }
            
            url = f"{Config.KOKORO_BASE_URL}/v1/audio/speech"
            response = await self.http_client.post(url, json=tts_config)
            response.raise_for_status()
            
            result = response.json()
            return CallToolResult(
                content=[TextContent(type="text", text=f"Speech synthesis completed: {json.dumps(result, indent=2)}")]
            )
        except Exception as e:
            return CallToolResult(
                content=[TextContent(type="text", text=f"Error synthesizing speech: {str(e)}")]
            )
    
    async def get_service_status(self, service: str = "all") -> CallToolResult:
        """Get status of AI services"""
        try:
            status = await self._get_all_service_status()
            
            if service != "all" and service in status:
                status = {service: status[service]}
            
            return CallToolResult(
                content=[TextContent(type="text", text=json.dumps(status, indent=2))]
            )
        except Exception as e:
            return CallToolResult(
                content=[TextContent(type="text", text=f"Error getting service status: {str(e)}")]
            )
    
    async def list_generated_assets(self, asset_type: str = "all", limit: int = 20) -> CallToolResult:
        """List generated assets"""
        try:
            assets = await self._get_generated_assets()
            
            if asset_type != "all":
                assets = [a for a in assets if a.get("type") == asset_type]
            
            assets = assets[:limit]
            
            result = {
                "total_assets": len(assets),
                "assets": assets
            }
            
            return CallToolResult(
                content=[TextContent(type="text", text=json.dumps(result, indent=2))]
            )
        except Exception as e:
            return CallToolResult(
                content=[TextContent(type="text", text=f"Error listing assets: {str(e)}")]
            )
    
    # Helper methods
    async def _get_n8n_workflows(self) -> List[Dict[str, Any]]:
        """Get N8N workflows"""
        try:
            url = f"{Config.N8N_BASE_URL}/api/v1/workflows"
            headers = {"X-N8N-API-KEY": Config.N8N_API_KEY} if Config.N8N_API_KEY else {}
            
            response = await self.http_client.get(url, headers=headers)
            response.raise_for_status()
            
            return response.json().get("data", [])
        except Exception as e:
            logger.error(f"Error getting N8N workflows: {str(e)}")
            return []
    
    async def _get_all_service_status(self) -> Dict[str, Any]:
        """Get status of all services"""
        status = {}
        
        # Check N8N
        try:
            response = await self.http_client.get(f"{Config.N8N_BASE_URL}/healthz", timeout=5)
            status["n8n"] = {"status": "healthy" if response.status_code == 200 else "unhealthy"}
        except:
            status["n8n"] = {"status": "unreachable"}
        
        # Check ComfyUI
        try:
            response = await self.http_client.get(f"{Config.COMFYUI_BASE_URL}/", timeout=5)
            status["comfyui"] = {"status": "healthy" if response.status_code == 200 else "unhealthy"}
        except:
            status["comfyui"] = {"status": "unreachable"}
        
        # Check FFCreator
        try:
            response = await self.http_client.get(f"{Config.FFCREATOR_BASE_URL}/", timeout=5)
            status["ffcreator"] = {"status": "healthy" if response.status_code == 200 else "unhealthy"}
        except:
            status["ffcreator"] = {"status": "unreachable"}
        
        # Check Kokoro
        try:
            response = await self.http_client.get(f"{Config.KOKORO_BASE_URL}/", timeout=5)
            status["kokoro"] = {"status": "healthy" if response.status_code == 200 else "unhealthy"}
        except:
            status["kokoro"] = {"status": "unreachable"}
        
        return status
    
    async def _get_generated_assets(self) -> List[Dict[str, Any]]:
        """Get list of generated assets"""
        # This would scan the shared volumes for generated content
        # For now, return a placeholder
        return [
            {
                "type": "image",
                "name": "generated_image_001.png",
                "path": "/shared-data/comfyui/output/generated_image_001.png",
                "created": datetime.now().isoformat(),
                "size": "1024x1024"
            }
        ]
    
    def _generate_multimodal_workflow_definition(self, name: str, description: str, workflow_type: str, components: List[str]) -> Dict[str, Any]:
        """Generate N8N workflow definition for multimodal workflow"""
        nodes = []
        connections = {}
        
        # Start with a manual trigger
        nodes.append({
            "id": "manual-trigger",
            "name": "Manual Trigger",
            "type": "n8n-nodes-base.manualTrigger",
            "position": [100, 100],
            "parameters": {}
        })
        
        x_pos = 300
        y_pos = 100
        
        # Add nodes based on components
        if "text_processing" in components:
            nodes.append({
                "id": "text-processor",
                "name": "Text Processor",
                "type": "n8n-nodes-base.function",
                "position": [x_pos, y_pos],
                "parameters": {
                    "functionCode": "// Process input text\nreturn items;"
                }
            })
            x_pos += 200
        
        if "image_generation" in components:
            nodes.append({
                "id": "image-generator",
                "name": "ComfyUI Image Generator",
                "type": "n8n-nodes-base.httpRequest",
                "position": [x_pos, y_pos],
                "parameters": {
                    "url": f"{Config.COMFYUI_BASE_URL}/api/prompt",
                    "method": "POST"
                }
            })
            x_pos += 200
        
        if "video_creation" in components:
            nodes.append({
                "id": "video-creator",
                "name": "FFCreator Video",
                "type": "n8n-nodes-base.httpRequest",
                "position": [x_pos, y_pos],
                "parameters": {
                    "url": f"{Config.FFCREATOR_BASE_URL}/api/create",
                    "method": "POST"
                }
            })
            x_pos += 200
        
        if "audio_synthesis" in components:
            nodes.append({
                "id": "audio-synthesizer",
                "name": "Kokoro TTS",
                "type": "n8n-nodes-base.httpRequest",
                "position": [x_pos, y_pos],
                "parameters": {
                    "url": f"{Config.KOKORO_BASE_URL}/v1/audio/speech",
                    "method": "POST"
                }
            })
        
        return {
            "name": name,
            "nodes": nodes,
            "connections": connections,
            "active": True,
            "settings": {
                "description": description
            },
            "tags": [workflow_type, "multimodal", "ai-generated"]
        }

async def main():
    """Main entry point for the MCP server"""
    logger.info(f"🚀 Starting N8N AI Studio MCP Server v{Config.SERVER_VERSION}")
    
    # Initialize the server with proper resource management
    async with N8NMCPServer() as mcp_server:
        # Run the server
        async with stdio_server() as (read_stream, write_stream):
            await mcp_server.server.run(
                read_stream,
                write_stream,
                InitializationOptions(
                    server_name=Config.SERVER_NAME,
                    server_version=Config.SERVER_VERSION,
                    capabilities=mcp_server.server.get_capabilities(),
                ),
            )

if __name__ == "__main__":
    asyncio.run(main())
