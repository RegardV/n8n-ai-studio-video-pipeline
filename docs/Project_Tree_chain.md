#!/bin/bash

# N8N AI Studio - Complete File Tree with DDC Document Mapping
# Shows original project structure and where DDC extracted files came from

cat << 'EOF'
📂 N8N AI Studio Project Structure & DDC Document Mapping
═══════════════════════════════════════════════════════════════════════════════════

🏠 PROJECT ROOT: /home/inky/n8n-ai-studio/
├── 📄 docker-compose.yml                           ➤ ✅ EXTRACTED: docker-compose.yml_docker-composeyml
├── 📄 .env                                         ➤ ✅ EXTRACTED: .env_env
├── 📄 .gitignore
├── 📄 .gitattributes
├── 📁 .github/
│   └── [GitHub configuration files]
├── 📁 Documentation/
│   ├── [Project documentation files]
│   └── [Setup guides and references]
├── 📁 DDC/                                         ➤ 🎯 EXTRACTION TARGET DIRECTORY
│   ├── 📄 Manifest.txt                             ➤ 📋 Generated documentation
│   ├── 📄 docker-compose.yml_docker-composeyml    ➤ 🔄 FROM: ./docker-compose.yml
│   ├── 📄 .env_env                                 ➤ 🔄 FROM: ./.env
│   ├── 📄 nginx.conf_nginx_nginxconf               ➤ 🔄 FROM: ./nginx/nginx.conf
│   ├── 📄 n8n.crt_ssl_n8ncrt                       ➤ 🔄 FROM: ./ssl/n8n.crt
│   ├── 📄 n8n.key_ssl_n8nkey                       ➤ 🔄 FROM: ./ssl/n8n.key
│   ├── 📄 Dockerfile.ffcreator_persistent-data_... ➤ 🔄 FROM: ./persistent-data/ffcreator/Dockerfile.ffcreator
│   ├── 📄 package.json_persistent-data_...         ➤ 🔄 FROM: ./persistent-data/ffcreator/package.json
│   ├── 📄 package-lock.json_persistent-data_...    ➤ 🔄 FROM: ./persistent-data/ffcreator/package-lock.json
│   ├── 📄 server.js_persistent-data_...            ➤ 🔄 FROM: ./persistent-data/ffcreator/server.js
│   └── 📄 start-kokoro-production.sh_scripts_...   ➤ 🔄 FROM: ./scripts/start-kokoro-production.sh
├── 📁 nginx/
│   ├── 📄 nginx.conf                               ➤ ✅ EXTRACTED: nginx.conf_nginx_nginxconf
│   └── [Additional nginx configurations]
├── 📁 ssl/
│   ├── 📄 n8n.crt                                  ➤ ✅ EXTRACTED: n8n.crt_ssl_n8ncrt
│   ├── 📄 n8n.key                                  ➤ ✅ EXTRACTED: n8n.key_ssl_n8nkey
│   └── [Additional SSL certificates]
├── 📁 scripts/
│   ├── 📄 start-kokoro-production.sh               ➤ ✅ EXTRACTED: start-kokoro-production.sh_scripts_...
│   └── [Additional runtime scripts]
├── 📁 persistent-data/                             ➤ 🗂️  MAIN DATA DIRECTORY
│   ├── 📁 assets/
│   │   └── [Shared static assets]
│   ├── 📁 comfyui/
│   │   ├── 📁 basedir/
│   │   │   ├── 📁 models/
│   │   │   │   ├── 📁 checkpoints/                 ➤ 📊 DOCUMENTED: ComfyUI models (15GB)
│   │   │   │   │   ├── 📄 v1-5-pruned-emaonly-fp16.safetensors
│   │   │   │   │   ├── 📄 sd_xl_base_1.0.safetensors  
│   │   │   │   │   ├── 📄 COLR_001.ckpt
│   │   │   │   │   └── 📄 v1-5-pruned-emaonly.ckpt
│   │   │   │   ├── 📁 loras/
│   │   │   │   ├── 📁 embeddings/
│   │   │   │   └── 📁 style_models/
│   │   │   ├── 📁 output/
│   │   │   └── 📁 workflows/
│   │   └── 📁 run/
│   │       └── 📁 ComfyUI/
│   ├── 📁 ffcreator/                               ➤ 🏗️  BUILD CONTEXT DIRECTORY
│   │   ├── 📄 Dockerfile.ffcreator                 ➤ ✅ EXTRACTED: Dockerfile.ffcreator_persistent-data_...
│   │   ├── 📄 package.json                         ➤ ✅ EXTRACTED: package.json_persistent-data_...
│   │   ├── 📄 package-lock.json                    ➤ ✅ EXTRACTED: package-lock.json_persistent-data_...
│   │   ├── 📄 server.js                            ➤ ✅ EXTRACTED: server.js_persistent-data_...
│   │   └── [Additional FFCreator files]
│   ├── 📁 ffcreator-db/                            ➤ 📊 DOCUMENTED: Database data
│   │   └── [PostgreSQL database files]
│   ├── 📁 kokoro/
│   │   ├── 📁 models/                              ➤ 📊 DOCUMENTED: Voice models (1.3GB)
│   │   │   └── [Voice model files]
│   │   ├── 📁 audio/
│   │   ├── 📁 voices/
│   │   └── 📁 cache/
│   ├── 📁 n8n/
│   │   └── 📁 workflows/
│   └── 📁 videos/
│       └── [Generated video files]
├── 📁 postgres-data/                               ➤ 📊 DOCUMENTED: Main database (runtime)
│   └── [PostgreSQL database files]
├── 📁 redis-data/                                  ➤ 📊 DOCUMENTED: Cache data (runtime)
│   └── [Redis cache files]
├── 📁 n8n-data/
│   └── [N8N application data]
├── 📁 node_modules/
│   └── [NPM dependencies]
├── 📁 temp/
├── 📁 temp-processing/
├── 📁 backupModels/
├── 📁 claude-mcp/
├── 📄 container_health_check.sh
├── 📄 ddc_extractor.sh
├── 📄 ddc_validator.sh
├── 📄 model_verification.sh
├── 📄 n8n_endpoint_tester.js
├── 📄 docker-images-inventory.log
└── 📄 test_report_*.json

═══════════════════════════════════════════════════════════════════════════════════
📊 DDC EXTRACTION SUMMARY:
═══════════════════════════════════════════════════════════════════════════════════

🎯 EXTRACTED FILES (10 total):
   ✅ ROOT_ORCHESTRATION (2 files):
      • docker-compose.yml        ➤ docker-compose.yml_docker-composeyml
      • .env                      ➤ .env_env

   ✅ NGINX_CONFIG (1 file):
      • nginx/nginx.conf          ➤ nginx.conf_nginx_nginxconf

   ✅ SSL_CERTIFICATES (2 files):
      • ssl/n8n.crt               ➤ n8n.crt_ssl_n8ncrt
      • ssl/n8n.key               ➤ n8n.key_ssl_n8nkey

   ✅ FFCREATOR_BUILD (4 files):
      • persistent-data/ffcreator/Dockerfile.ffcreator     ➤ Dockerfile.ffcreator_persistent-data_...
      • persistent-data/ffcreator/package.json             ➤ package.json_persistent-data_...
      • persistent-data/ffcreator/package-lock.json        ➤ package-lock.json_persistent-data_...
      • persistent-data/ffcreator/server.js                ➤ server.js_persistent-data_...

   ✅ SCRIPTS (1 file):
      • scripts/start-kokoro-production.sh                 ➤ start-kokoro-production.sh_scripts_...

📊 DOCUMENTED LARGE DATA (5 directories):
   🔵 persistent-data/comfyui/basedir/models/checkpoints/  (15GB AI models)
   🔵 persistent-data/kokoro/models/                       (1.3GB voice models)
   🔵 postgres-data/                                       (Runtime database)
   🔵 persistent-data/ffcreator-db/                        (FFCreator database)
   🔵 redis-data/                                          (Cache data)

═══════════════════════════════════════════════════════════════════════════════════
🔄 FILE PATH ENCODING EXPLANATION:
═══════════════════════════════════════════════════════════════════════════════════

Original Path: nginx/nginx.conf
Encoded As:    nginx.conf_nginx_nginxconf
Logic:         [filename]_[path_with_slashes_as_underscores_and_dots_removed]

Original Path: persistent-data/ffcreator/server.js  
Encoded As:    server.js_persistent-data_ffcreator_serverjs
Logic:         [filename]_[persistent-data]_[ffcreator]_[serverjs]

Original Path: ssl/n8n.key
Encoded As:    n8n.key_ssl_n8nkey  
Logic:         [filename]_[ssl]_[n8nkey]

═══════════════════════════════════════════════════════════════════════════════════
🚀 MIGRATION USAGE:
═══════════════════════════════════════════════════════════════════════════════════

1. Copy entire DDC/ directory to target system
2. Rename files back to original paths:
   DDC/docker-compose.yml_docker-composeyml  ➤  ./docker-compose.yml
   DDC/.env_env                              ➤  ./.env  
   DDC/nginx.conf_nginx_nginxconf            ➤  ./nginx/nginx.conf
   DDC/n8n.crt_ssl_n8ncrt                    ➤  ./ssl/n8n.crt
   DDC/n8n.key_ssl_n8nkey                    ➤  ./ssl/n8n.key
   [etc...]

3. Download large data files separately (16+ GB total)
4. Update IP addresses and domain names in configurations
5. Test complete system

═══════════════════════════════════════════════════════════════════════════════════

