// templates/NativeTemplateProcessor.js
const { FFCreator, FFScene, FFImage, FFText, FFRect, FFVideo } = require('ffcreator');
const path = require('path');
const fs = require('fs');

/**
 * Native Template Processor for FFCreator
 * Handles mobile-first video template generation with JavaScript objects
 */
class NativeTemplateProcessor {
  constructor(options = {}) {
    this.options = {
      cacheDir: options.cacheDir || '/app/cache',
      outputDir: options.outputDir || '/app/videos',
      assetsDir: options.assetsDir || '/app/ai-assets',
      ttsDir: options.ttsDir || '/app/tts-audio',
      logger: options.logger || console,
      ...options
    };
  }

  /**
   * Process a native template configuration into FFCreator instance
   * @param {Object} templateConfig - Native template configuration
   * @param {Object} variables - Template variables for dynamic content
   * @returns {Promise<FFCreator>} Configured FFCreator instance
   */
  async processTemplate(templateConfig, variables = {}) {
    try {
      this.validateTemplateConfig(templateConfig);
      
      // Create FFCreator instance with template configuration
      const creator = this.createFFCreatorInstance(templateConfig, variables);
      
      // Process each scene in the template
      for (const sceneConfig of templateConfig.scenes) {
        const scene = await this.createScene(sceneConfig, variables);
        creator.addChild(scene);
      }
      
      // Add global audio if specified
      this.addGlobalAudio(creator, templateConfig, variables);
      
      this.options.logger.info(`✅ Native template processed: ${templateConfig.template_id || 'custom'}`);
      return creator;
      
    } catch (error) {
      this.options.logger.error('❌ Native template processing failed:', error);
      throw new Error(`Template processing failed: ${error.message}`);
    }
  }

  /**
   * Create FFCreator instance with optimized settings
   */
  createFFCreatorInstance(templateConfig, variables) {
    const config = templateConfig.creator_config || {};
    
    return new FFCreator({
      cacheDir: this.options.cacheDir,
      outputDir: this.options.outputDir,
      width: config.width || 1920,
      height: config.height || 1080,
      fps: config.fps || 30,
      
      // Core settings
      debug: config.debug || false,
      pool: config.pool !== false,
      parallel: config.parallel || (this.hasGPU() ? 8 : 4),
      threads: config.threads || (this.hasGPU() ? 12 : 6),
      highWaterMark: config.highWaterMark || '512kb',
      
      // Rendering settings
      render: config.render || 0,
      forceCanvas: config.forceCanvas || false,
      
      // GPU-optimized encoding
      ...(this.hasGPU() ? {
        outputVideoCodec: 'h264_nvenc',
        outputVideoQuality: 'high',
        outputPixelFormat: 'yuv420p',
        ffmpegParams: [
          '-c:v', 'h264_nvenc',
          '-preset', 'fast',
          '-crf', '18',
          '-b:v', '10M',
          '-maxrate', '15M',
          '-bufsize', '20M'
        ]
      } : {
        outputVideoCodec: 'libx264',
        outputVideoQuality: 'medium',
        outputPixelFormat: 'yuv420p'
      }),
      
      // Custom configuration overrides
      ...config.ffcreator_options
    });
  }

  /**
   * Create a scene from scene configuration
   */
  async createScene(sceneConfig, variables) {
    const scene = new FFScene();
    
    // Basic scene settings
    scene.setDuration(this.resolveValue(sceneConfig.duration, variables) || 5);
    
    if (sceneConfig.background_color) {
      scene.setBgColor(this.resolveValue(sceneConfig.background_color, variables));
    }
    
    if (sceneConfig.transition) {
      scene.setTransition(sceneConfig.transition.type || sceneConfig.transition, 
                         sceneConfig.transition.duration || 1);
    }
    
    // Add elements to scene
    if (sceneConfig.elements) {
      for (const elementConfig of sceneConfig.elements) {
        const element = await this.createElement(elementConfig, variables);
        if (element) {
          scene.addChild(element);
        }
      }
    }
    
    // Add scene-specific audio
    if (sceneConfig.audio) {
      this.addSceneAudio(scene, sceneConfig.audio, variables);
    }
    
    return scene;
  }

  /**
   * Create an element from element configuration
   */
  async createElement(config, variables) {
    const { type, props, animations } = config;
    let element;
    
    try {
      switch (type) {
        case 'FFImage':
        case 'background_image':
        case 'comfyui_image':
          element = await this.createImageElement(props, variables);
          break;
          
        case 'FFText':
        case 'subtitle_text':
        case 'title_text':
          element = this.createTextElement(props, variables);
          break;
          
        case 'FFRect':
        case 'rectangle':
          element = this.createRectElement(props, variables);
          break;
          
        case 'FFVideo':
        case 'video':
          element = this.createVideoElement(props, variables);
          break;
          
        default:
          this.options.logger.warn(`⚠️ Unknown element type: ${type}`);
          return null;
      }
      
      // Apply animations if specified
      if (animations && element) {
        this.applyAnimations(element, animations, variables);
      }
      
      return element;
      
    } catch (error) {
      this.options.logger.error(`❌ Failed to create element ${type}:`, error);
      return null;
    }
  }

  /**
   * Create image element with path resolution
   */
  async createImageElement(props, variables) {
    const resolvedProps = this.resolveProps(props, variables);
    
    // Resolve image path
    let imagePath = resolvedProps.path || resolvedProps.src;
    if (!imagePath) {
      throw new Error('Image path is required');
    }
    
    // Convert relative paths to absolute
    if (!path.isAbsolute(imagePath)) {
      imagePath = path.resolve(this.options.assetsDir, imagePath);
    }
    
    // Verify file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }
    
    const image = new FFImage({
      path: imagePath,
      x: resolvedProps.x || 0,
      y: resolvedProps.y || 0,
      width: resolvedProps.width,
      height: resolvedProps.height,
      fit: resolvedProps.fit || 'contain',
      ...resolvedProps
    });
    
    return image;
  }

  /**
   * Create text element with styling
   */
  createTextElement(props, variables) {
    const resolvedProps = this.resolveProps(props, variables);
    
    const text = new FFText({
      text: resolvedProps.text || '',
      x: resolvedProps.x || 0,
      y: resolvedProps.y || 0,
      fontSize: resolvedProps.fontSize || 36,
      ...resolvedProps
    });
    
    // Apply text styling
    if (resolvedProps.style) {
      this.applyTextStyling(text, resolvedProps.style);
    }
    
    return text;
  }

  /**
   * Create rectangle element
   */
  createRectElement(props, variables) {
    const resolvedProps = this.resolveProps(props, variables);
    
    return new FFRect({
      x: resolvedProps.x || 0,
      y: resolvedProps.y || 0,
      width: resolvedProps.width || 100,
      height: resolvedProps.height || 100,
      color: resolvedProps.color || resolvedProps.background || '#000000',
      ...resolvedProps
    });
  }

  /**
   * Create video element
   */
  createVideoElement(props, variables) {
    const resolvedProps = this.resolveProps(props, variables);
    
    let videoPath = resolvedProps.path || resolvedProps.src;
    if (!path.isAbsolute(videoPath)) {
      videoPath = path.resolve(this.options.assetsDir, videoPath);
    }
    
    return new FFVideo({
      path: videoPath,
      x: resolvedProps.x || 0,
      y: resolvedProps.y || 0,
      width: resolvedProps.width,
      height: resolvedProps.height,
      ...resolvedProps
    });
  }

  /**
   * Apply animations to element
   */
  applyAnimations(element, animations, variables) {
    if (!Array.isArray(animations)) {
      animations = [animations];
    }
    
    animations.forEach(anim => {
      const effect = this.resolveValue(anim.effect, variables);
      const duration = this.resolveValue(anim.duration, variables) || 1;
      const delay = this.resolveValue(anim.delay, variables) || 0;
      
      if (effect) {
        element.addEffect(effect, duration, delay);
      }
    });
  }

  /**
   * Apply text styling
   */
  applyTextStyling(textElement, style) {
    if (style.color) textElement.setColor(style.color);
    if (style.backgroundColor) textElement.setBackgroundColor(style.backgroundColor);
    if (style.fontSize) textElement.setStyle({ fontSize: style.fontSize });
    if (style.fontFamily) textElement.setStyle({ fontFamily: style.fontFamily });
    if (style.fontWeight) textElement.setStyle({ fontWeight: style.fontWeight });
    if (style.textAlign) textElement.setStyle({ textAlign: style.textAlign });
    if (style.textShadow) textElement.setStyle({ textShadow: style.textShadow });
    if (style.lineHeight) textElement.setStyle({ lineHeight: style.lineHeight });
    if (style.padding) textElement.setStyle({ padding: style.padding });
    if (style.borderRadius) textElement.setStyle({ borderRadius: style.borderRadius });
  }

  /**
   * Add global audio to creator
   */
  addGlobalAudio(creator, templateConfig, variables) {
    if (templateConfig.audio) {
      const audioConfig = templateConfig.audio;
      let audioPath = this.resolveValue(audioConfig.path || audioConfig.src, variables);
      
      if (audioPath) {
        if (!path.isAbsolute(audioPath)) {
          audioPath = path.resolve(this.options.ttsDir, audioPath);
        }
        
        if (fs.existsSync(audioPath)) {
          creator.addAudio({
            path: audioPath,
            volume: this.resolveValue(audioConfig.volume, variables) || 1.0,
            loop: this.resolveValue(audioConfig.loop, variables) || false,
            start: this.resolveValue(audioConfig.start, variables) || 0
          });
        } else {
          this.options.logger.warn(`⚠️ Audio file not found: ${audioPath}`);
        }
      }
    }
  }

  /**
   * Add scene-specific audio
   */
  addSceneAudio(scene, audioConfig, variables) {
    let audioPath = this.resolveValue(audioConfig.path || audioConfig.src, variables);
    
    if (audioPath) {
      if (!path.isAbsolute(audioPath)) {
        audioPath = path.resolve(this.options.ttsDir, audioPath);
      }
      
      if (fs.existsSync(audioPath)) {
        scene.addAudio({
          path: audioPath,
          volume: this.resolveValue(audioConfig.volume, variables) || 1.0,
          loop: this.resolveValue(audioConfig.loop, variables) || false,
          start: this.resolveValue(audioConfig.start, variables) || 0
        });
      } else {
        this.options.logger.warn(`⚠️ Scene audio file not found: ${audioPath}`);
      }
    }
  }

  /**
   * Resolve template variables in values
   */
  resolveValue(value, variables) {
    if (typeof value === 'string' && value.includes('{{')) {
      // Simple template variable resolution
      return value.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        const trimmedKey = key.trim();
        return variables[trimmedKey] !== undefined ? variables[trimmedKey] : match;
      });
    }
    return value;
  }

  /**
   * Resolve all properties in an object
   */
  resolveProps(props, variables) {
    const resolved = {};
    for (const [key, value] of Object.entries(props)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        resolved[key] = this.resolveProps(value, variables);
      } else {
        resolved[key] = this.resolveValue(value, variables);
      }
    }
    return resolved;
  }

  /**
   * Validate template configuration structure
   */
  validateTemplateConfig(config) {
    if (!config || typeof config !== 'object') {
      throw new Error('Template configuration must be an object');
    }
    
    if (!config.scenes || !Array.isArray(config.scenes)) {
      throw new Error('Template must contain scenes array');
    }
    
    if (config.scenes.length === 0) {
      throw new Error('Template must contain at least one scene');
    }
    
    // Validate each scene
    config.scenes.forEach((scene, index) => {
      if (!scene || typeof scene !== 'object') {
        throw new Error(`Scene ${index} must be an object`);
      }
      
      if (scene.elements && !Array.isArray(scene.elements)) {
        throw new Error(`Scene ${index} elements must be an array`);
      }
    });
  }

  /**
   * Check GPU availability
   */
  hasGPU() {
    try {
      const { execSync } = require('child_process');
      execSync('nvidia-smi --query-gpu=name --format=csv,noheader', 
        { encoding: 'utf8', timeout: 3000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get available mobile templates
   */
  static getMobileTemplates() {
    return {
      'mobile_vertical_standard': {
        name: 'Mobile Vertical Standard',
        description: 'Standard 9:16 mobile template with image and subtitles',
        aspect_ratio: '9:16',
        resolution: '1080x1920'
      },
      'mobile_tiktok_style': {
        name: 'TikTok Style Mobile',
        description: 'TikTok-optimized template with animations',
        aspect_ratio: '9:16',
        resolution: '1080x1920'
      },
      'mobile_instagram_stories': {
        name: 'Instagram Stories',
        description: 'Instagram Stories format with branded styling',
        aspect_ratio: '9:16',
        resolution: '1080x1920'
      },
      'mobile_youtube_shorts': {
        name: 'YouTube Shorts',
        description: 'YouTube Shorts optimized template',
        aspect_ratio: '9:16',
        resolution: '1080x1920'
      },
      'mobile_square': {
        name: 'Mobile Square',
        description: 'Square format for cross-platform compatibility',
        aspect_ratio: '1:1',
        resolution: '1080x1080'
      }
    };
  }
}

module.exports = NativeTemplateProcessor;