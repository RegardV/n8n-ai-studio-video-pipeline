# 📥 AI Model Downloads Guide

## 🎯 Overview

N8N AI Studio requires several AI models for optimal functionality. This guide provides exact download instructions and sources for all required models.

**Total Download Size**: ~16.3GB
- ComfyUI Models: ~15GB
- Kokoro TTS Models: ~1.3GB (auto-downloaded)

---

## 🎨 ComfyUI Models (Required - ~15GB)

### **📁 Installation Directory**
```bash
# Target location
persistent-data/comfyui/basedir/models/checkpoints/
```

### **🔧 Automatic Download Script**
Create this script to automate model downloads:

```bash
#!/bin/bash
# setup/download-comfyui-models.sh

echo "📥 Downloading ComfyUI models..."
echo "⚠️  Total download: ~15GB - Ensure good internet connection"

# Create model directory
mkdir -p persistent-data/comfyui/basedir/models/checkpoints/SD1.5
cd persistent-data/comfyui/basedir/models/checkpoints/

echo "🎨 Downloading Stable Diffusion v1.5 (2.0GB)..."
if [ ! -f "v1-5-pruned-emaonly-fp16.safetensors" ]; then
    wget -O v1-5-pruned-emaonly-fp16.safetensors \
        "https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly-fp16.safetensors"
fi

echo "🎨 Downloading Stable Diffusion XL Base (6.5GB)..."
if [ ! -f "sd_xl_base_1.0.safetensors" ]; then
    wget -O sd_xl_base_1.0.safetensors \
        "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors"
fi

echo "🎨 Downloading COLR_001 Model (2.5GB)..."
if [ ! -f "COLR_001.ckpt" ]; then
    echo "⚠️  Manual download required for COLR_001.ckpt"
    echo "   Please download from your preferred source and place here"
fi

echo "🎨 Downloading SD v1.5 Full (4.0GB)..."
cd SD1.5/
if [ ! -f "v1-5-pruned-emaonly.ckpt" ]; then
    wget -O v1-5-pruned-emaonly.ckpt \
        "https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.ckpt"
fi

cd ../../../..
echo "✅ ComfyUI model downloads complete!"
echo "📁 Models installed in: $(pwd)/persistent-data/comfyui/basedir/models/checkpoints/"
```

### **📋 Model Details**

#### **1. Stable Diffusion v1.5 FP16 (Primary Model)**
- **File**: `v1-5-pruned-emaonly-fp16.safetensors`
- **Size**: 2.0GB
- **Source**: Hugging Face - Stability AI
- **URL**: `https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5`
- **License**: Apache 2.0
- **Description**: Optimized FP16 version for faster inference

```bash
wget -O v1-5-pruned-emaonly-fp16.safetensors \
    "https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly-fp16.safetensors"
```

#### **2. Stable Diffusion XL Base 1.0**
- **File**: `sd_xl_base_1.0.safetensors`
- **Size**: 6.5GB
- **Source**: Stability AI Official
- **URL**: `https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0`
- **License**: OpenRAIL++
- **Description**: High-resolution image generation (1024x1024+)

```bash
wget -O sd_xl_base_1.0.safetensors \
    "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors"
```

#### **3. COLR_001 (Custom Model)**
- **File**: `COLR_001.ckpt`
- **Size**: 2.5GB
- **Source**: Custom/Community Model
- **Description**: Specialized model for specific use cases
- **Note**: Download source to be provided by user

#### **4. Stable Diffusion v1.5 Full**
- **File**: `SD1.5/v1-5-pruned-emaonly.ckpt`
- **Size**: 4.0GB
- **Source**: Hugging Face - Stability AI
- **Description**: Full precision version for maximum quality

```bash
mkdir -p SD1.5/
cd SD1.5/
wget -O v1-5-pruned-emaonly.ckpt \
    "https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.ckpt"
```

### **🗂️ Additional Model Types**

#### **LoRA Models (Optional)**
```bash
# Location: persistent-data/comfyui/basedir/models/loras/
# Examples found in your setup:
# - ColoringBookRedmond-ColoringBook-ColoringBookAF.safetensors
# - elementalplaner.safetensors
# - Coloring_Book_HiDream_v1_renderartist.safetensors
```

#### **Embeddings (Optional)**
```bash
# Location: persistent-data/comfyui/basedir/models/embeddings/
# Example: more_details.safetensors
```

---

## 🎤 Kokoro TTS Models (Automatic - ~1.3GB)

### **📁 Installation Directory**
```bash
# Auto-created location
persistent-data/kokoro/models/
```

### **🔄 Automatic Download Process**
Kokoro TTS models are **automatically downloaded** on first container startup:

```bash
# Models auto-downloaded on first run:
persistent-data/kokoro/models/v1_0/
├── kokoro-v1_0.pth (313MB x4 variants = 1.3GB total)
├── config.json files
└── Voice configuration files
```

### **🎵 Voice Models Included**
**70+ voices across multiple languages:**
- **English**: af_bella, af_nova, am_adam, bf_emma, etc.
- **Japanese**: jf_alpha, jf_gongitsune, jm_kumo
- **Chinese**: zf_xiaobei, zm_yunjian, zm_yunxi
- **And many more...**

**No manual download required** - handled automatically by container.

---

## 🚀 Quick Setup Commands

### **1. Make Download Script Executable**
```bash
chmod +x setup/download-comfyui-models.sh
```

### **2. Run Model Downloads**
```bash
# Download ComfyUI models
./setup/download-comfyui-models.sh

# Kokoro models will auto-download on first container start
docker-compose up -d kokoro
```

### **3. Verify Downloads**
```bash
# Check ComfyUI models
ls -lh persistent-data/comfyui/basedir/models/checkpoints/
du -sh persistent-data/comfyui/basedir/models/checkpoints/

# Check Kokoro models (after first startup)
ls -lh persistent-data/kokoro/models/
```

---

## 📊 Storage Requirements

### **Disk Space Planning**
```bash
ComfyUI Models:           ~15.0GB
Kokoro TTS Models:        ~1.3GB
Docker Images:            ~24.0GB
Generated Content:        ~10.0GB (estimate)
System Overhead:          ~5.0GB
--------------------------------
Total Recommended:        ~55.0GB free space
```

### **Performance Considerations**
- **SSD Recommended**: For faster model loading
- **Network**: High-speed internet for initial downloads
- **RAM**: 32GB recommended for loading large models
- **GPU VRAM**: 10GB+ for optimal performance

---

## ⚠️ Important Notes

### **Download Reliability**
- **Large Files**: Downloads may take several hours
- **Interruption Recovery**: Use `wget -c` to resume partial downloads
- **Checksums**: Verify file integrity after download
- **Bandwidth**: Consider bandwidth limits and peak hours

### **Model Versions**
- **Stable Releases**: Use specific version tags when possible
- **License Compliance**: Ensure compliance with model licenses
- **Updates**: Check for model updates periodically
- **Compatibility**: Verify model compatibility with ComfyUI version

### **Alternative Sources**
If Hugging Face is slow, consider these mirrors:
- **ModelScope**: `https://www.modelscope.cn/`
- **CivitAI**: `https://civitai.com/` (for community models)
- **Torrents**: Some models available via BitTorrent

### **Troubleshooting Downloads**

**Slow Download Speeds:**
```bash
# Use aria2 for faster parallel downloads
sudo apt-get install aria2
aria2c -x 8 -s 8 [URL]
```

**Download Interruptions:**
```bash
# Resume partial downloads
wget -c [URL]
```

**Insufficient Space:**
```bash
# Check available space
df -h
# Clean up if needed
docker system prune -a
```

---

## 🔒 Security & Legal

### **Model Licenses**
- **Stable Diffusion**: Apache 2.0 / OpenRAIL++
- **Kokoro TTS**: Apache 2.0
- **Custom Models**: Check individual licenses

### **Usage Rights**
- **Commercial Use**: Verify license allows commercial usage
- **Attribution**: Some models require attribution
- **Restrictions**: Some models have content/usage restrictions

### **Data Privacy**
- **Model Training**: Understand what data models were trained on
- **Generated Content**: Be aware of potential bias in outputs
- **Compliance**: Ensure compliance with local data protection laws

---

This guide ensures you have all required models for a fully functional N8N AI Studio setup. Follow the download order and verify each step for optimal results.