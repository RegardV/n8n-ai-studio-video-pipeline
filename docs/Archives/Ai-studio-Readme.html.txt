
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>N8N AI Studio - Docker Architecture Documentation</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    <style>
        .service-card {
            transition: all 0.3s ease;
        }
        .service-card:hover {
            transform: translateY(-2px);
        }
        .code-block {
            font-family: 'Courier New', monospace;
            font-size: 0.875rem;
        }
         {
            body { font-size: 12px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body class="bg-gray-50 text-gray-800">
    <!-- Header -->
    <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div class="container mx-auto px-6">
            <h1 class="text-4xl font-bold mb-4">
                <i class="fas fa-docker mr-3"></i>N8N AI Studio - Docker Architecture
            </h1>
            <p class="text-xl opacity-90">Complete Documentation & Configuration Guide</p>
            <div class="mt-4 text-sm opacity-75">
                <i class="fas fa-calendar mr-2"></i>Generated: <span id="currentDate"></span>
                <i class="fas fa-server ml-4 mr-2"></i>Server: 192.168.1.13
            </div>
        </div>
    </div>

    <div class="container mx-auto px-6 py-8">
        <!-- Table of Contents -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">
                <i class="fas fa-list mr-3 text-blue-600"></i>Table of Contents
            </h2>
            <div class="grid md:grid-cols-2 gap-4">
                <ul class="space-y-2">
                    <li><a href="#overview" class="text-blue-600 hover:underline">1. Architecture Overview</a></li>
                    <li><a href="#services" class="text-blue-600 hover:underline">2. Docker Services</a></li>
                    <li><a href="#nginx" class="text-blue-600 hover:underline">3. Nginx Proxy Configuration</a></li>
                    <li><a href="#file-structure" class="text-blue-600 hover:underline">4. File Structure & Paths</a></li>
                </ul>
                <ul class="space-y-2">
                    <li><a href="#endpoints" class="text-blue-600 hover:underline">5. API Endpoints</a></li>
                    <li><a href="#troubleshooting" class="text-blue-600 hover:underline">6. Troubleshooting</a></li>
                    <li><a href="#config-files" class="text-blue-600 hover:underline">7. Configuration Files</a></li>
                    <li><a href="#maintenance" class="text-blue-600 hover:underline">8. Maintenance Guide</a></li>
                </ul>
            </div>
        </div>

        <!-- Architecture Overview -->
        <section id="overview" class="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-6">
                <i class="fas fa-sitemap mr-3 text-green-600"></i>Architecture Overview
            </h2>
            
            <div class="grid lg:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-xl font-semibold text-gray-700 mb-4">System Components</h3>
                    <div class="space-y-3">
                        <div class="flex items-center p-3 bg-blue-50 rounded-lg">
                            <i class="fas fa-network-wired text-blue-600 mr-3"></i>
                            <div>
                                <div class="font-semibold">Nginx Reverse Proxy</div>
                                <div class="text-sm text-gray-600">Traffic routing & SSL termination</div>
                            </div>
                        </div>
                        <div class="flex items-center p-3 bg-green-50 rounded-lg">
                            <i class="fas fa-cogs text-green-600 mr-3"></i>
                            <div>
                                <div class="font-semibold">N8N Workflow Engine</div>
                                <div class="text-sm text-gray-600">Automation & workflow orchestration</div>
                            </div>
                        </div>
                        <div class="flex items-center p-3 bg-purple-50 rounded-lg">
                            <i class="fas fa-image text-purple-600 mr-3"></i>
                            <div>
                                <div class="font-semibold">ComfyUI</div>
                                <div class="text-sm text-gray-600">AI image generation service</div>
                            </div>
                        </div>
                        <div class="flex items-center p-3 bg-red-50 rounded-lg">
                            <i class="fas fa-video text-red-600 mr-3"></i>
                            <div>
                                <div class="font-semibold">FFCreator</div>
                                <div class="text-sm text-gray-600">Video processing & creation</div>
                            </div>
                        </div>
                        <div class="flex items-center p-3 bg-yellow-50 rounded-lg">
                            <i class="fas fa-volume-up text-yellow-600 mr-3"></i>
                            <div>
                                <div class="font-semibold">Kokoro TTS</div>
                                <div class="text-sm text-gray-600">Text-to-speech processing</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h3 class="text-xl font-semibold text-gray-700 mb-4">Network Architecture</h3>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="text-center mb-4">
                            <div class="bg-blue-100 p-3 rounded-lg inline-block">
                                <i class="fas fa-globe text-blue-600 text-2xl"></i>
                                <div class="font-semibold mt-2">Internet/Local Network</div>
                            </div>
                        </div>
                        <div class="text-center mb-4">
                            <i class="fas fa-arrow-down text-gray-400 text-xl"></i>
                        </div>
                        <div class="text-center mb-4">
                            <div class="bg-green-100 p-3 rounded-lg inline-block">
                                <i class="fas fa-server text-green-600 text-2xl"></i>
                                <div class="font-semibold mt-2">Nginx Reverse Proxy</div>
                                <div class="text-sm text-gray-600">Ports: 80, 443, 3001, 8188, 8443, 8880</div>
                            </div>
                        </div>
                        <div class="text-center mb-4">
                            <i class="fas fa-arrow-down text-gray-400 text-xl"></i>
                        </div>
                        <div class="text-center">
                            <div class="bg-purple-100 p-3 rounded-lg inline-block">
                                <i class="fas fa-layer-group text-purple-600 text-2xl"></i>
                                <div class="font-semibold mt-2">Docker Network</div>
                                <div class="text-sm text-gray-600">n8n-ai-studio_ai-network (172.20.0.0/16)</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                <h4 class="font-semibold text-blue-800 mb-2">Key Features</h4>
                <ul class="text-blue-700 space-y-1">
                    <li>• SSL/TLS encryption for secure communications</li>
                    <li>• GPU acceleration for AI workloads (ComfyUI & Kokoro)</li>
                    <li>• Persistent data storage with volume mounts</li>
                    <li>• Health checks and automatic restart policies</li>
                    <li>• Resource limits and reservations for optimal performance</li>
                </ul>
            </div>
        </section>

        <!-- Docker Services -->
        <section id="services" class="mb-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-6">
                <i class="fab fa-docker mr-3 text-blue-600"></i>Docker Services Breakdown
            </h2>

            <!-- Nginx Service -->
            <div class="service-card bg-white rounded-lg shadow-lg p-6 mb-6">
                <div class="flex items-center mb-4">
                    <div class="bg-green-100 p-3 rounded-full mr-4">
                        <i class="fas fa-server text-green-600 text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-2xl font-bold text-gray-800">Nginx Reverse Proxy</h3>
                        <p class="text-gray-600">Traffic routing, SSL termination, and load balancing</p>
                    </div>
                </div>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-2">Configuration</h4>
                        <ul class="space-y-1 text-sm">
                            <li><strong>Image:</strong> nginx:alpine</li>
                            <li><strong>Container:</strong> nginx-proxy</li>
                            <li><strong>Restart Policy:</strong> unless-stopped</li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-2">Port Mappings</h4>
                        <ul class="space-y-1 text-sm">
                            <li><span class="bg-blue-100 px-2 py-1 rounded">80:80</span> HTTP (redirects to HTTPS)</li>
                            <li><span class="bg-green-100 px-2 py-1 rounded">443:443</span> HTTPS (N8N)</li>
                            <li><span class="bg-purple-100 px-2 py-1 rounded">8443:8443</span> HTTPS (ComfyUI)</li>
                        </ul>
                    </div>
                </div>

                <div class="mt-4">
                    <h4 class="font-semibold text-gray-700 mb-2">Volume Mounts</h4>
                    <div class="bg-gray-50 p-3 rounded text-sm code-block">
                        <div>./nginx/nginx.conf → /etc/nginx/nginx.conf:ro</div>
                        <div>./ssl/n8n.crt → /etc/ssl/certs/n8n.crt:ro</div>
                        <div>./ssl/n8n.key → /etc/ssl/private/n8n.key:ro</div>
                    </div>
                </div>
            </div>

            <!-- PostgreSQL Service -->
            <div class="service-card bg-white rounded-lg shadow-lg p-6 mb-6">
                <div class="flex items-center mb-4">
                    <div class="bg-blue-100 p-3 rounded-full mr-4">
                        <i class="fas fa-database text-blue-600 text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-2xl font-bold text-gray-800">PostgreSQL Database</h3>
                        <p class="text-gray-600">Primary database for N8N workflows and user data</p>
                    </div>
                </div>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-2">Configuration</h4>
                        <ul class="space-y-1 text-sm">
                            <li><strong>Image:</strong> postgres:16.4</li>
                            <li><strong>Container:</strong> n8n-postgres</li>
                            <li><strong>Internal Only:</strong> No external ports</li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-2">Resource Limits</h4>
                        <ul class="space-y-1 text-sm">
                            <li><strong>CPU:</strong> 1-2 cores</li>
                            <li><strong>Memory:</strong> 2-4GB RAM</li>
                            <li><strong>Storage:</strong> ./postgres-data (persistent)</li>
                        </ul>
                    </div>
                </div>

                <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <h4 class="font-semibold text-green-800 mb-1">Health Check</h4>
                    <p class="text-sm text-green-700">pg_isready check every 10s, 10 retries, 40s start period</p>
                </div>
            </div>

            <!-- N8N Service -->
            <div class="service-card bg-white rounded-lg shadow-lg p-6 mb-6">
                <div class="flex items-center mb-4">
                    <div class="bg-purple-100 p-3 rounded-full mr-4">
                        <i class="fas fa-cogs text-purple-600 text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-2xl font-bold text-gray-800">N8N Workflow Automation</h3>
                        <p class="text-gray-600">Main automation engine with PostgreSQL integration</p>
                    </div>
                </div>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-2">Configuration</h4>
                        <ul class="space-y-1 text-sm">
                            <li><strong>Image:</strong> n8nio/n8n:latest</li>
                            <li><strong>Container:</strong> n8n-main</li>
                            <li><strong>Port:</strong> 5678:5678</li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-2">Resource Limits</h4>
                        <ul class="space-y-1 text-sm">
                            <li><strong>CPU:</strong> 1-3 cores</li>
                            <li><strong>Memory:</strong> 4-8GB RAM</li>
                            <li><strong>Database:</strong> PostgreSQL backend</li>
                        </ul>
                    </div>
                </div>

                <div class="mt-4">
                    <h4 class="font-semibold text-gray-700 mb-2">Volume Mounts</h4>
                    <div class="bg-gray-50 p-3 rounded text-sm code-block">
                        <div>./n8n-data → /home/node/.n8n</div>
                        <div>./persistent-data/n8n/workflows → /home/node/workflows:rw</div>
                        <div>./persistent-data/comfyui/basedir/output → /outputs:rw</div>
                        <div>./scripts → /scripts:ro</div>
                    </div>
                </div>
            </div>

            <!-- ComfyUI Service -->
            <div class="service-card bg-white rounded-lg shadow-lg p-6 mb-6">
                <div class="flex items-center mb-4">
                    <div class="bg-pink-100 p-3 rounded-full mr-4">
                        <i class="fas fa-image text-pink-600 text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-2xl font-bold text-gray-800">ComfyUI AI Image Generation</h3>
                        <p class="text-gray-600">GPU-accelerated AI image generation service</p>
                    </div>
                </div>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-2">Configuration</h4>
                        <ul class="space-y-1 text-sm">
                            <li><strong>Image:</strong> mmartial/comfyui-nvidia-docker:ubuntu22_cuda12.2.2-latest</li>
                            <li><strong>Container:</strong> comfyui-main</li>
                            <li><strong>Port:</strong> 8188:8188</li>
                            <li><strong>Runtime:</strong> nvidia (GPU access)</li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-2">Resource Limits</h4>
                        <ul class="space-y-1 text-sm">
                            <li><strong>CPU:</strong> 6-8 cores</li>
                            <li><strong>Memory:</strong> 12-16GB RAM</li>
                            <li><strong>GPU:</strong> CUDA support enabled</li>
                        </ul>
                    </div>
                </div>

                <div class="mt-4">
                    <h4 class="font-semibold text-gray-700 mb-2">Volume Mounts</h4>
                    <div class="bg-gray-50 p-3 rounded text-sm code-block">
                        <div>./persistent-data/comfyui/run → /comfy/mnt</div>
                        <div>./persistent-data/comfyui/basedir → /basedir</div>
                        <div>./persistent-data/comfyui/basedir/models → /models</div>
                        <div>./persistent-data/comfyui/basedir/output → /output</div>
                    </div>
                </div>
            </div>

            <!-- FFCreator Service -->
            <div class="service-card bg-white rounded-lg shadow-lg p-6 mb-6">
                <div class="flex items-center mb-4">
                    <div class="bg-red-100 p-3 rounded-full mr-4">
                        <i class="fas fa-video text-red-600 text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-2xl font-bold text-gray-800">FFCreator Video Processing</h3>
                        <p class="text-gray-600">Video composition and rendering service</p>
                    </div>
                </div>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-2">Configuration</h4>
                        <ul class="space-y-1 text-sm">
                            <li><strong>Build:</strong> Custom Dockerfile.ffcreator</li>
                            <li><strong>Container:</strong> ffcreator-service</li>
                            <li><strong>Port:</strong> 3001:3001</li>
                            <li><strong>Runtime:</strong> nvidia (GPU access)</li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-2">Resource Limits</h4>
                        <ul class="space-y-1 text-sm">
                            <li><strong>CPU:</strong> 2-4 cores</li>
                            <li><strong>Memory:</strong> 4-8GB RAM</li>
                            <li><strong>Display:</strong> Xvfb virtual display</li>
                        </ul>
                    </div>
                </div>

                <div class="mt-4">
                    <h4 class="font-semibold text-gray-700 mb-2">Volume Mounts</h4>
                    <div class="bg-gray-50 p-3 rounded text-sm code-block">
                        <div>./persistent-data/videos → /app/videos:rw</div>
                        <div>./persistent-data/ffcreator-cache → /app/cache:rw</div>
                        <div>./persistent-data/assets → /app/assets:ro</div>
                        <div>./temp-processing → /app/temp:rw</div>
                    </div>
                </div>

                <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <h4 class="font-semibold text-green-800 mb-1">Health Check</h4>
                    <p class="text-sm text-green-700">curl -f http://localhost:3001/health every 30s</p>
                </div>
            </div>

            <!-- Kokoro Service -->
            <div class="service-card bg-white rounded-lg shadow-lg p-6 mb-6">
                <div class="flex items-center mb-4">
                    <div class="bg-yellow-100 p-3 rounded-full mr-4">
                        <i class="fas fa-volume-up text-yellow-600 text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-2xl font-bold text-gray-800">Kokoro Text-to-Speech</h3>
                        <p class="text-gray-600">GPU-accelerated TTS processing service</p>
                    </div>
                </div>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-2">Configuration</h4>
                        <ul class="space-y-1 text-sm">
                            <li><strong>Image:</strong> ghcr.io/remsky/kokoro-fastapi-gpu:latest</li>
                            <li><strong>Container:</strong> kokoro-tts-service</li>
                            <li><strong>Port:</strong> 8880:8880</li>
                            <li><strong>Runtime:</strong> nvidia (GPU access)</li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-2">Resource Limits</h4>
                        <ul class="space-y-1 text-sm">
                            <li><strong>CPU:</strong> 4-6 cores</li>
                            <li><strong>Memory:</strong> 4-8GB RAM</li>
                            <li><strong>GPU:</strong> CUDA support enabled</li>
                        </ul>
                    </div>
                </div>

                <div class="mt-4">
                    <h4 class="font-semibold text-gray-700 mb-2">Volume Mounts</h4>
                    <div class="bg-gray-50 p-3 rounded text-sm code-block">
                        <div>./persistent-data/kokoro/models → /app/models:rw</div>
                        <div>./persistent-data/kokoro/audio → /app/audio:rw</div>
                        <div>./persistent-data/kokoro/cache → /app/cache:rw</div>
                        <div>./temp-processing → /app/temp-processing:rw</div>
                    </div>
                </div>

                <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <h4 class="font-semibold text-green-800 mb-1">Health Check</h4>
                    <p class="text-sm text-green-700">curl -f http://localhost:8880/v1/audio/voices every 20 minutes</p>
                </div>
            </div>

            <!-- Redis Service -->
            <div class="service-card bg-white rounded-lg shadow-lg p-6 mb-6">
                <div class="flex items-center mb-4">
                    <div class="bg-orange-100 p-3 rounded-full mr-4">
                        <i class="fas fa-memory text-orange-600 text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-2xl font-bold text-gray-800">Redis Cache</h3>
                        <p class="text-gray-600">In-memory caching and session storage</p>
                    </div>
                </div>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-2">Configuration</h4>
                        <ul class="space-y-1 text-sm">
                            <li><strong>Image:</strong> redis:7-alpine</li>
                            <li><strong>Container:</strong> redis-cache</li>
                            <li><strong>Port:</strong> 6379:6379</li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-2">Resource Limits</h4>
                        <ul class="space-y-1 text-sm">
                            <li><strong>CPU:</strong> 0.5-1 cores</li>
                            <li><strong>Memory:</strong> 1-2GB RAM</li>
                            <li><strong>Storage:</strong> ./redis-data (persistent)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <!-- Nginx Configuration -->
        <section id="nginx" class="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-6">
                <i class="fas fa-network-wired mr-3 text-blue-600"></i>Nginx Proxy Configuration
            </h2>

            <div class="grid lg:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-xl font-semibold text-gray-700 mb-4">Upstream Definitions</h3>
                    <div class="space-y-3">
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <div class="font-semibold text-blue-600">upstream n8n</div>
                            <div class="text-sm text-gray-600">server n8n-main:5678;</div>
                        </div>
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <div class="font-semibold text-purple-600">upstream comfyui</div>
                            <div class="text-sm text-gray-600">server comfyui-main:8188;</div>
                        </div>
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <div class="font-semibold text-red-600">upstream ffcreator</div>
                            <div class="text-sm text-gray-600">server ffcreator-service:3001;</div>
                        </div>
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <div class="font-semibold text-yellow-600">upstream kokoro</div>
                            <div class="text-sm text-gray-600">server kokoro-tts-service:8880;</div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 class="text-xl font-semibold text-gray-700 mb-4">Server Blocks</h3>
                    <div class="space-y-3">
                        <div class="bg-green-50 p-3 rounded-lg border border-green-200">
                            <div class="font-semibold text-green-700">Port 443 (HTTPS)</div>
                            <div class="text-sm text-gray-600">N8N with SSL, WebSocket support</div>
                        </div>
                        <div class="bg-purple-50 p-3 rounded-lg border border-purple-200">
                            <div class="font-semibold text-purple-700">Port 8443 (HTTPS)</div>
                            <div class="text-sm text-gray-600">ComfyUI with SSL, 100MB uploads</div>
                        </div>
                        <div class="bg-red-50 p-3 rounded-lg border border-red-200">
                            <div class="font-semibold text-red-700">Port 3001 (HTTP)</div>
                            <div class="text-sm text-gray-600">FFCreator, 500MB uploads, extended timeouts</div>
                        </div>
                        <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                            <div class="font-semibold text-yellow-700">Port 8880 (HTTP)</div>
                            <div class="text-sm text-gray-600">Kokoro TTS, 100MB uploads</div>
                        </div>
                        <div class="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <div class="font-semibold text-blue-700">Port 80 (HTTP)</div>
                            <div class="text-sm text-gray-600">Redirects to HTTPS (301)</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-8">
                <h3 class="text-xl font-semibold text-gray-700 mb-4">SSL Configuration</h3>
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <h4 class="font-semibold text-gray-700 mb-2">Certificate Files</h4>
                            <ul class="text-sm space-y-1">
                                <li><strong>Certificate:</strong> /etc/ssl/certs/n8n.crt</li>
                                <li><strong>Private Key:</strong> /etc/ssl/private/n8n.key</li>
                                <li><strong>Host Path:</strong> ./ssl/ directory</li>
                            </ul>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-700 mb-2">SSL Settings</h4>
                            <ul class="text-sm space-y-1">
                                <li><strong>Protocols:</strong> TLSv1.2, TLSv1.3</li>
                                <li><strong>Ciphers:</strong> HIGH:!aNULL:!MD5</li>
                                <li><strong>HTTP/2:</strong> Enabled</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- File Structure -->
        <section id="file-structure" class="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-6">
                <i class="fas fa-folder-tree mr-3 text-green-600"></i>File Structure & Paths
            </h2>

            <div class="grid lg:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-xl font-semibold text-gray-700 mb-4">Project Directory Structure</h3>
                    <div class="bg-gray-50 p-4 rounded-lg code-block text-sm">
                        <div class="text-blue-600 font-semibold">/home/inky/n8n-ai-studio/</div>
                        <div class="ml-4">├── <span class="text-green-600">docker-compose.yml</span> <span class="text-gray-500"># Main orchestration file</span></div>
                        <div class="ml-4">├── <span class="text-green-600">Dockerfile.ffcreator</span> <span class="text-gray-500"># FFCreator build file</span></div>
                        <div class="ml-4">├── <span class="text-blue-600 font-semibold">nginx/</span></div>
                        <div class="ml-8">│   └── <span class="text-green-600">nginx.conf</span> <span class="text-gray-500"># Proxy configuration</span></div>
                        <div class="ml-4">├── <span class="text-blue-600 font-semibold">ssl/</span></div>
                        <div class="ml-8">│   ├── <span class="text-green-600">n8n.crt</span> <span class="text-gray-500"># SSL certificate</span></div>
                        <div class="ml-8">│   └── <span class="text-green-600">n8n.key</span> <span class="text-gray-500"># SSL private key</span></div>
                        <div class="ml-4">├── <span class="text-blue-600 font-semibold">scripts/</span> <span class="text-gray-500"># Runtime scripts</span></div>
                        <div class="ml-4">├── <span class="text-blue-600 font-semibold">n8n-data/</span> <span class="text-gray-500"># N8N app data</span></div>
                        <div class="ml-4">├── <span class="text-blue-600 font-semibold">postgres-data/</span> <span class="text-gray-500"># Database files</span></div>
                        <div class="ml-4">├── <span class="text-blue-600 font-semibold">redis-data/</span> <span class="text-gray-500"># Cache data</span></div>
                        <div class="ml-4">├── <span class="text-blue-600 font-semibold">temp-processing/</span> <span class="text-gray-500"># Temporary files</span></div>
                        <div class="ml-4">└── <span class="text-blue-600 font-semibold">persistent-data/</span></div>
                        <div class="ml-8">├── <span class="text-blue-600 font-semibold">comfyui/</span> <span class="text-gray-500"># ComfyUI data</span></div>
                        <div class="ml-8">├── <span class="text-blue-600 font-semibold">kokoro/</span> <span class="text-gray-500"># Kokoro TTS data</span></div>
                        <div class="ml-8">├── <span class="text-blue-600 font-semibold">videos/</span> <span class="text-gray-500"># FFCreator output</span></div>
                        <div class="ml-8">├── <span class="text-blue-600 font-semibold">assets/</span> <span class="text-gray-500"># Shared assets</span></div>
                        <div class="ml-8">└── <span class="text-blue-600 font-semibold">ffcreator-cache/</span> <span class="text-gray-500"># Video cache</span></div>
                    </div>
                </div>

                <div>
                    <h3 class="text-xl font-semibold text-gray-700 mb-4">Key Configuration Files</h3>
                    <div class="space-y-4">
                        <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 class="font-semibold text-blue-800">docker-compose.yml</h4>
                            <p class="text-sm text-blue-700 mb-2">Main orchestration file defining all services, networks, and volumes</p>
                            <div class="text-xs text-blue-600">Location: /home/inky/n8n-ai-studio/docker-compose.yml</div>
                        </div>

                        <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h4 class="font-semibold text-green-800">nginx.conf</h4>
                            <p class="text-sm text-green-700 mb-2">Reverse proxy configuration with upstream definitions and SSL settings</p>
                            <div class="text-xs text-green-600">Location: /home/inky/n8n-ai-studio/nginx/nginx.conf</div>
                        </div>

                        <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <h4 class="font-semibold text-purple-800">SSL Certificates</h4>
                            <p class="text-sm text-purple-700 mb-2">SSL certificate and private key for HTTPS encryption</p>
                            <div class="text-xs text-purple-600">Location: /home/inky/n8n-ai-studio/ssl/</div>
                        </div>

                        <div class="bg-red-50 p-4 rounded-lg border border-red-200">
                            <h4 class="font-semibold text-red-800">Dockerfile.ffcreator</h4>
                            <p class="text-sm text-red-700 mb-2">Custom build instructions for FFCreator video processing service</p>
                            <div class="text-xs text-red-600">Location: /home/inky/n8n-ai-studio/Dockerfile.ffcreator</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-8">
                <h3 class="text-xl font-semibold text-gray-700 mb-4">Volume Mount Mappings</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-4 py-2 text-left">Host Path</th>
                                <th class="px-4 py-2 text-left">Container Path</th>
                                <th class="px-4 py-2 text-left">Service</th>
                                <th class="px-4 py-2 text-left">Purpose</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <tr>
                                <td class="px-4 py-2 code-block">./nginx/nginx.conf</td>
                                <td class="px-4 py-2 code-block">/etc/nginx/nginx.conf</td>
                                <td class="px-4 py-2">Nginx</td>
                                <td class="px-4 py-2">Proxy configuration</td>
                            </tr>
                            <tr class="bg-gray-50">
                                <td class="px-4 py-2 code-block">./ssl/</td>
                                <td class="px-4 py-2 code-block">/etc/ssl/</td>
                                <td class="px-4 py-2">Nginx</td>
                                <td class="px-4 py-2">SSL certificates</td>
                            </tr>
                            <tr>
                                <td class="px-4 py-2 code-block">./n8n-data/</td>
                                <td class="px-4 py-2 code-block">/home/node/.n8n</td>
                                <td class="px-4 py-2">N8N</td>
                                <td class="px-4 py-2">Application data</td>
                            </tr>
                            <tr class="bg-gray-50">
                                <td class="px-4 py-2 code-block">./postgres-data/</td>
                                <td class="px-4 py-2 code-block">/var/lib/postgresql/data</td>
                                <td class="px-4 py-2">PostgreSQL</td>
                                <td class="px-4 py-2">Database files</td>
                            </tr>
                            <tr>
                                <td class="px-4 py-2 code-block">./persistent-data/comfyui/</td>
                                <td class="px-4 py-2 code-block">/basedir, /models, /output</td>
                                <td class="px-4 py-2">ComfyUI</td>
                                <td class="px-4 py-2">AI models & outputs</td>
                            </tr>
                            <tr class="bg-gray-50">
                                <td class="px-4 py-2 code-block">./persistent-data/videos/</td>
                                <td class="px-4 py-2 code-block">/app/videos</td>
                                <td class="px-4 py-2">FFCreator</td>
                                <td class="px-4 py-2">Video outputs</td>
                            </tr>
                            <tr>
                                <td class="px-4 py-2 code-block">./persistent-data/kokoro/</td>
                                <td class="px-4 py-2 code-block">/app/models, /app/audio</td>
                                <td class="px-4 py-2">Kokoro</td>
                                <td class="px-4 py-2">TTS models & audio</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        <!-- API Endpoints -->
        <section id="endpoints" class="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-6">
                <i class="fas fa-plug mr-3 text-purple-600"></i>API Endpoints Summary
            </h2>

            <div class="grid lg:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-xl font-semibold text-gray-700 mb-4">Service Access URLs</h3>
                    <div class="space-y-3">
                        <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h4 class="font-semibold text-green-800">N8N Workflow Engine</h4>
                            <div class="text-sm text-green-700 mt-1">
                                <div><strong>HTTPS:</strong> https://192.168.1.13/</div>
                                <div><strong>Direct:</strong> http://192.168.1.13:5678/</div>
                                <div><strong>Status:</strong> <span class="bg-green-100 px-2 py-1 rounded">✅ Working</span></div>
                            </div>
                        </div>

                        <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <h4 class="font-semibold text-purple-800">ComfyUI Image Generation</h4>
                            <div class="text-sm text-purple-700 mt-1">
                                <div><strong>HTTPS:</strong> https://192.168.1.13:8443/</div>
                                <div><strong>Direct:</strong> http://192.168.1.13:8188/</div>
                                <div><strong>Status:</strong> <span class="bg-green-100 px-2 py-1 rounded">✅ Working</span></div>
                            </div>
                        </div>

                        <div class="bg-red-50 p-4 rounded-lg border border-red-200">
                            <h4 class="font-semibold text-red-800">FFCreator Video Processing</h4>
                            <div class="text-sm text-red-700 mt-1">
                                <div><strong>HTTP:</strong> http://192.168.1.13:3001/</div>
                                <div><strong>Direct:</strong> http://192.168.1.13:3001/</div>
                                <div><strong>Status:</strong> <span class="bg-yellow-100 px-2 py-1 rounded">⚠️ Basic endpoints only</span></div>
                            </div>
                        </div>

                        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <h4 class="font-semibold text-yellow-800">Kokoro Text-to-Speech</h4>
                            <div class="text-sm text-yellow-700 mt-1">
                                <div><strong>HTTP:</strong> http://192.168.1.13:8880/</div>
                                <div><strong>Direct:</strong> http://192.168.1.13:8880/</div>
                                <div><strong>Status:</strong> <span class="bg-green-100 px-2 py-1 rounded">✅ Working</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 class="text-xl font-semibold text-gray-700 mb-4">FFCreator API Endpoints</h3>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b">
                                    <th class="text-left py-2">Endpoint</th>
                                    <th class="text-left py-2">Method</th>
                                    <th class="text-left py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                <tr>
                                    <td class="py-2 code-block">/</td>
                                    <td class="py-2">GET</td>
                                    <td class="py-2"><span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">200 ✅</span></td>
                                </tr>
                                <tr>
                                    <td class="py-2 code-block">/health</td>
                                    <td class="py-2">GET</td>
                                    <td class="py-2"><span class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">404 ❌</span></td>
                                </tr>
                                <tr>
                                    <td class="py-2 code-block">/api</td>
                                    <td class="py-2">GET</td>
                                    <td class="py-2"><span class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">404 ❌</span></td>
                                </tr>
                                <tr>
                                    <td class="py-2 code-block">/status</td>
                                    <td class="py-2">GET</td>
                                    <td class="py-2"><span class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">404 ❌</span></td>
                                </tr>
                                <tr>
                                    <td class="py-2 code-block">/create</td>
                                    <td class="py-2">GET</td>
                                    <td class="py-2"><span class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">404 ❌</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="mt-4">
                        <h4 class="font-semibold text-gray-700 mb-2">Kokoro API Endpoints</h4>
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="border-b">
                                        <th class="text-left py-2">Endpoint</th>
                                        <th class="text-left py-2">Method</th>
                                        <th class="text-left py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    <tr>
                                        <td class="py-2 code-block">/</td>
                                        <td class="py-2">GET</td>
                                        <td class="py-2"><span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">200 ✅</span></td>
                                    </tr>
                                    <tr>
                                        <td class="py-2 code-block">/v1/audio/voices</td>
                                        <td class="py-2">GET</td>
                                        <td class="py-2"><span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">200 ✅</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Troubleshooting -->
        <section id="troubleshooting" class="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-6">
                <i class="fas fa-tools mr-3 text-red-600"></i>Troubleshooting Guide
            </h2>

            <div class="space-y-6">
                <div class="bg-red-50 p-6 rounded-lg border border-red-200">
                    <h3 class="text-xl font-semibold text-red-800 mb-4">
                        <i class="fas fa-exclamation-triangle mr-2"></i>Common Issues & Solutions
                    </h3>
                    
                    <div class="space-y-4">
                        <div>
                            <h4 class="font-semibold text-red-700 mb-2">Issue: FFCreator API endpoints return 404</h4>
                            <div class="text-sm text-red-600 mb-2">
                                <strong>Symptoms:</strong> /health, /api, /status endpoints not found
                            </div>
                            <div class="text-sm text-red-600 mb-2">
                                <strong>Root Cause:</strong> FFCreator service lacks proper API endpoint implementation
                            </div>
                            <div class="text-sm text-red-600">
                                <strong>Solution:</strong> Implement enhanced API server with proper endpoints (see Configuration Files section)
                            </div>
                        </div>

                        <div>
                            <h4 class="font-semibold text-red-700 mb-2">Issue: Nginx cannot route to FFCreator/Kokoro</h4>
                            <div class="text-sm text-red-600 mb-2">
                                <strong>Symptoms:</strong> 502 Bad Gateway or connection refused errors
                            </div>
                            <div class="text-sm text-red-600 mb-2">
                                <strong>Root Cause:</strong> Missing upstream definitions in nginx.conf
                            </div>
                            <div class="text-sm text-red-600">
                                <strong>Solution:</strong> Add upstream blocks for ffcreator and kokoro services (already implemented in current config)
                            </div>
                        </div>

                        <div>
                            <h4 class="font-semibold text-red-700 mb-2">Issue: SSL certificate errors</h4>
                            <div class="text-sm text-red-600 mb-2">
                                <strong>Symptoms:</strong> "Certificate not trusted" or "SSL handshake failed"
                            </div>
                            <div class="text-sm text-red-600 mb-2">
                                <strong>Root Cause:</strong> Self-signed certificate or certificate mismatch
                            </div>
                            <div class="text-sm text-red-600">
                                <strong>Solution:</strong> Accept certificate in browser or generate new certificate for 192.168.1.13
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 class="text-xl font-semibold text-blue-800 mb-4">
                        <i class="fas fa-terminal mr-2"></i>Diagnostic Commands
                    </h3>
                    
                    <div class="space-y-4">
                        <div>
                            <h4 class="font-semibold text-blue-700 mb-2">Check Service Status</h4>
                            <div class="bg-gray-800 text-green-400 p-3 rounded code-block text-sm">
                                <div># Check all container status</div>
                                <div>docker ps -a</div>
                                <div><br></div>
                                <div># Check specific service logs</div>
                                <div>docker logs ffcreator-service --tail 50</div>
                                <div>docker logs nginx-proxy --tail 20</div>
                            </div>
                        </div>

                        <div>
                            <h4 class="font-semibold text-blue-700 mb-2">Test Network Connectivity</h4>
                            <div class="bg-gray-800 text-green-400 p-3 rounded code-block text-sm">
                                <div># Test nginx to ffcreator connectivity</div>
                                <div>docker exec nginx-proxy nslookup ffcreator-service</div>
                                <div>docker exec nginx-proxy wget -q --spider http://ffcreator-service:3001/</div>
                                <div><br></div>
                                <div># Test endpoints directly</div>
                                <div>curl -v http://localhost:3001/</div>
                                <div>curl -v http://localhost:8880/v1/audio/voices</div>
                            </div>
                        </div>

                        <div>
                            <h4 class="font-semibold text-blue-700 mb-2">Validate Nginx Configuration</h4>
                            <div class="bg-gray-800 text-green-400 p-3 rounded code-block text-sm">
                                <div># Test nginx configuration syntax</div>
                                <div>docker exec nginx-proxy nginx -t</div>
                                <div><br></div>
                                <div># Reload nginx configuration</div>
                                <div>docker exec nginx-proxy nginx -s reload</div>
                                <div><br></div>
                                <div># Restart nginx service</div>
                                <div>docker restart nginx-proxy</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-green-50 p-6 rounded-lg border border-green-200">
                    <h3 class="text-xl font-semibold text-green-800 mb-4">
                        <i class="fas fa-check-circle mr-2"></i>Health Check Commands
                    </h3>
                    
                    <div class="bg-gray-800 text-green-400 p-3 rounded code-block text-sm">
                        <div># Check all service health</div>
                        <div>curl -s http://localhost:3001/ | head -5</div>
                        <div>curl -s http://localhost:8880/v1/audio/voices | head -5</div>
                        <div>curl -s http://localhost:8188/ | head -5</div>
                        <div>curl -s http://localhost:5678/ | head -5</div>
                        <div><br></div>
                        <div># Database connectivity test</div>
                        <div>docker exec n8n-postgres pg_isready -U $POSTGRES_USER</div>
                        <div><br></div>
                        <div># Redis connectivity test</div>
                        <div>docker exec redis-cache redis-cli ping</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Configuration Files -->
        <section id="config-files" class="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-6">
                <i class="fas fa-file-code mr-3 text-purple-600"></i>Configuration Files Reference
            </h2>

            <div class="space-y-6">
                <div class="bg-gray-50 p-6 rounded-lg">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">
                        <i class="fas fa-cog mr-2 text-blue-600"></i>nginx.conf (Enhanced)
                    </h3>
                    <p class="text-gray-600 mb-4">Complete nginx configuration with FFCreator and Kokoro support</p>
                    <div class="text-sm text-gray-500 mb-2">Location: /home/inky/n8n-ai-studio/nginx/nginx.conf</div>
                    
                    <div class="bg-white p-4 rounded border">
                        <h4 class="font-semibold text-gray-700 mb-2">Key Features Added:</h4>
                        <ul class="text-sm space-y-1 text-gray-600">
                            <li>• FFCreator upstream definition (ffcreator-service:3001)</li>
                            <li>• Kokoro upstream definition (kokoro-tts-service:8880)</li>
                            <li>• FFCreator server block with extended timeouts (120s)</li>
                            <li>• Kokoro server block with audio processing optimizations</li>
                            <li>• Enhanced file upload limits (500MB for video, 100MB for audio)</li>
                            <li>• Comprehensive commenting for maintenance</li>
                        </ul>
                    </div>
                </div>

                <div class="bg-gray-50 p-6 rounded-lg">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">
                        <i class="fab fa-docker mr-2 text-blue-600"></i>docker-compose.yml
                    </h3>
                    <p class="text-gray-600 mb-4">Main orchestration file defining all services and their relationships</p>
                    <div class="text-sm text-gray-500 mb-2">Location: /home/inky/n8n-ai-studio/docker-compose.yml</div>
                    
                    <div class="bg-white p-4 rounded border">
                        <h4 class="font-semibold text-gray-700 mb-2">Service Dependencies:</h4>
                        <ul class="text-sm space-y-1 text-gray-600">
                            <li>• Nginx depends on all services (n8n, comfyui, ffcreator, kokoro)</li>
                            <li>• N8N depends on PostgreSQL (with health check)</li>
                            <li>• All services use custom bridge network (172.20.0.0/16)</li>
                            <li>• GPU services use nvidia runtime (ComfyUI, FFCreator, Kokoro)</li>
                            <li>• Comprehensive resource limits and health checks</li>
                        </ul>
                    </div>
                </div>

                <div class="bg-gray-50 p-6 rounded-lg">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">
                        <i class="fas fa-shield-alt mr-2 text-green-600"></i>SSL Configuration
                    </h3>
                    <p class="text-gray-600 mb-4">SSL certificate and key files for HTTPS encryption</p>
                    <div class="text-sm text-gray-500 mb-2">Location: /home/inky/n8n-ai-studio/ssl/</div>
                    
                    <div class="bg-white p-4 rounded border">
                        <h4 class="font-semibold text-gray-700 mb-2">Files Required:</h4>
                        <ul class="text-sm space-y-1 text-gray-600">
                            <li>• <strong>n8n.crt</strong> - SSL certificate file</li>
                            <li>• <strong>n8n.key</strong> - Private key file</li>
                            <li>• Both files mounted read-only into nginx container</li>
                            <li>• Certificate should match server name (192.168.1.13)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <!-- Maintenance Guide -->
        <section id="maintenance" class="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-6">
                <i class="fas fa-wrench mr-3 text-orange-600"></i>Maintenance Guide
            </h2>

            <div class="grid lg:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-xl font-semibold text-gray-700 mb-4">Regular Maintenance Tasks</h3>
                    <div class="space-y-4">
                        <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 class="font-semibold text-blue-800 mb-2">Daily</h4>
                            <ul class="text-sm text-blue-700 space-y-1">
                                <li>• Check container status: <code class="bg-blue-100 px-1 rounded">docker ps</code></li>
                                <li>• Monitor disk usage: <code class="bg-blue-100 px-1 rounded">df -h</code></li>
                                <li>• Review error logs for any issues</li>
                            </ul>
                        </div>

                        <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h4 class="font-semibold text-green-800 mb-2">Weekly</h4>
                            <ul class="text-sm text-green-700 space-y-1">
                                <li>• Clean up temporary files: <code class="bg-green-100 px-1 rounded">./temp-processing/</code></li>
                                <li>• Check SSL certificate expiration</li>
                                <li>• Review resource usage and performance</li>
                                <li>• Backup critical data (postgres-data, n8n-data)</li>
                            </ul>
                        </div>

                        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <h4 class="font-semibold text-yellow-800 mb-2">Monthly</h4>
                            <ul class="text-sm text-yellow-700 space-y-1">
                                <li>• Update Docker images: <code class="bg-yellow-100 px-1 rounded">docker-compose pull</code></li>
                                <li>• Clean Docker system: <code class="bg-yellow-100 px-1 rounded">docker system prune -a</code></li>
                                <li>• Review and rotate logs</li>
                                <li>• Test backup and restore procedures</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 class="text-xl font-semibold text-gray-700 mb-4">Emergency Procedures</h3>
                    <div class="space-y-4">
                        <div class="bg-red-50 p-4 rounded-lg border border-red-200">
                            <h4 class="font-semibold text-red-800 mb-2">Service Down</h4>
                            <div class="bg-gray-800 text-green-400 p-3 rounded code-block text-sm">
                                <div># Restart specific service</div>
                                <div>docker restart [service-name]</div>
                                <div><br></div>
                                <div># Restart all services</div>
                                <div>docker-compose restart</div>
                                <div><br></div>
                                <div># Check logs for errors</div>
                                <div>docker logs [service-name] --tail 50</div>
                            </div>
                        </div>

                        <div class="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <h4 class="font-semibold text-orange-800 mb-2">Complete System Recovery</h4>
                            <div class="bg-gray-800 text-green-400 p-3 rounded code-block text-sm">
                                <div># Stop all services</div>
                                <div>docker-compose down</div>
                                <div><br></div>
                                <div># Restart with clean state</div>
                                <div>docker-compose up -d</div>
                                <div><br></div>
                                <div># Verify all services</div>
                                <div>docker-compose ps</div>
                            </div>
                        </div>

                        <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <h4 class="font-semibold text-purple-800 mb-2">Configuration Rollback</h4>
                            <div class="bg-gray-800 text-green-400 p-3 rounded code-block text-sm">
                                <div># Restore nginx config backup</div>
                                <div>cp nginx.conf.backup nginx.conf</div>
                                <div><br></div>
                                <div># Test and reload</div>
                                <div>docker exec nginx-proxy nginx -t</div>
                                <div>docker restart nginx-proxy</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-8 p-4 bg-gray-100 rounded-lg">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">
                    <i class="fas fa-info-circle mr-2 text-blue-600"></i>Support Information
                </h3>
                <div class="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <div><strong>System Location:</strong> /home/inky/n8n-ai-studio/</div>
                        <div><strong>Primary IP:</strong> 192.168.1.13</div>
                        <div><strong>Docker Network:</strong> n8n-ai-studio_ai-network</div>
                    </div>
                    <div>
                        <div><strong>Key Services:</strong> nginx, n8n, postgres, comfyui, ffcreator, kokoro</div>
                        <div><strong>GPU Runtime:</strong> nvidia (CUDA support)</div>
                        <div><strong>SSL:</strong> Self-signed certificate</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <div class="text-center py-8 text-gray-500 text-sm border-t">
            <p>N8N AI Studio Docker Architecture Documentation</p>
            <p>Generated for system at 192.168.1.13 • <span id="footerDate"></span></p>
        </div>
    </div>

    <script>
        // Set current date
        const now = new Date();
        const dateString = now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('currentDate').textContent = dateString;
        document.getElementById('footerDate').textContent = dateString;

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    </script>
</body>
</html>
