#!/bin/bash
# Download AI models for N8N AI Studio

echo "📥 Downloading AI models for N8N AI Studio..."
echo "⚠️  This will download ~16GB of data. Ensure good internet connection."

# Create model directories
mkdir -p persistent-data/comfyui/basedir/models/checkpoints
mkdir -p persistent-data/kokoro/models

# Download ComfyUI models (examples - adjust URLs as needed)
echo "🎨 Downloading ComfyUI models..."
cd persistent-data/comfyui/basedir/models/checkpoints

# Add actual model download URLs here
echo "📝 Please manually download these models:"
echo "   - v1-5-pruned-emaonly-fp16.safetensors"
echo "   - sd_xl_base_1.0.safetensors"
echo "   - COLR_001.ckpt"
echo "See docs/MODEL-DOWNLOADS.md for complete list and sources"

cd ../../../../..

echo "🎤 Kokoro TTS models will be downloaded automatically on first startup"

echo "✅ Model setup complete!"