// templates/MobileTemplateLibrary.js
/**
 * Mobile Template Library for FFCreator
 * Pre-built mobile-first video templates optimized for social media platforms
 */
class MobileTemplateLibrary {
  
  /**
   * Get template by ID with variable substitution
   * @param {string} templateId - Template identifier
   * @param {Object} variables - Variables for template substitution
   * @returns {Object} Template configuration
   */
  static getTemplate(templateId, variables = {}) {
    const template = this.templates[templateId];
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }
    
    // Return a deep copy with metadata
    return {
      template_id: templateId,
      template_meta: this.templateMeta[templateId] || {},
      ...JSON.parse(JSON.stringify(template)),
      variables
    };
  }

  /**
   * Get all available templates
   * @returns {Object} Available templates with metadata
   */
  static getAvailableTemplates() {
    return Object.keys(this.templates).map(id => ({
      id,
      ...this.templateMeta[id]
    }));
  }

  /**
   * Template metadata
   */
  static templateMeta = {
    'mobile_vertical_standard': {
      name: 'Mobile Vertical Standard',
      description: 'Clean 9:16 template with image background and bottom subtitles',
      aspect_ratio: '9:16',
      resolution: '1080x1920',
      duration: 'variable',
      platforms: ['TikTok', 'Instagram Stories', 'YouTube Shorts'],
      features: ['Background Image', 'Subtitle Text', 'Audio Support', 'Fade Animations']
    },
    
    'mobile_tiktok_style': {
      name: 'TikTok Style Mobile',
      description: 'Energetic template with branded intro and dynamic animations',
      aspect_ratio: '9:16',
      resolution: '1080x1920',
      duration: 'variable',
      platforms: ['TikTok', 'Instagram Reels'],
      features: ['Intro Scene', 'Bounce Animations', 'Brand Colors', 'Text Effects']
    },
    
    'mobile_instagram_stories': {
      name: 'Instagram Stories',
      description: 'Stories-optimized template with centered image and glass effects',
      aspect_ratio: '9:16',
      resolution: '1080x1920',
      duration: '15s (Stories limit)',
      platforms: ['Instagram Stories'],
      features: ['Blur Background', 'Centered Image', 'Glass Effects', 'Pulse Animation']
    },
    
    'mobile_youtube_shorts': {
      name: 'YouTube Shorts',
      description: 'YouTube Shorts template with bold text and high contrast',
      aspect_ratio: '9:16',
      resolution: '1080x1920',
      duration: '30s (Shorts limit)',
      platforms: ['YouTube Shorts'],
      features: ['Bold Typography', 'Text Stroke', 'High Contrast', 'Bounce Effects']
    },
    
    'mobile_square_universal': {
      name: 'Universal Square',
      description: 'Cross-platform square template for maximum compatibility',
      aspect_ratio: '1:1',
      resolution: '1080x1080',
      duration: 'variable',
      platforms: ['Instagram Posts', 'Facebook', 'Twitter', 'LinkedIn'],
      features: ['Universal Format', 'Clean Design', 'Professional Look']
    }
  };

  /**
   * Template configurations
   */
  static templates = {
    
    // Standard Mobile Vertical Template (9:16)
    'mobile_vertical_standard': {
      creator_config: {
        width: 1080,
        height: 1920,
        fps: 30,
        debug: false
      },
      
      scenes: [
        {
          type: 'main_content',
          duration: '{{duration}}',
          background_color: '#000000',
          
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
                { effect: 'fadeIn', duration: 1, delay: 0 }
              ]
            },
            {
              type: 'FFText',
              props: {
                text: '{{subtitle_text}}',
                x: 540,
                y: 1750,
                width: 1000,
                style: {
                  fontSize: 48,
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  textAlign: 'center',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: 'bold',
                  padding: '20px',
                  borderRadius: '12px',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                }
              },
              animations: [
                { effect: 'slideInUp', duration: 0.8, delay: 0.5 }
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

    // TikTok Style Template
    'mobile_tiktok_style': {
      creator_config: {
        width: 1080,
        height: 1920,
        fps: 30,
        debug: false
      },
      
      scenes: [
        {
          type: 'intro_scene',
          duration: 2,
          background_color: '#ff0050',
          
          elements: [
            {
              type: 'FFText',
              props: {
                text: '🎬 AI Generated',
                x: 540,
                y: 960,
                style: {
                  fontSize: 72,
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  textShadow: '4px 4px 8px rgba(0,0,0,0.8)'
                }
              },
              animations: [
                { effect: 'bounceIn', duration: 1.5, delay: 0 }
              ]
            }
          ]
        },
        {
          type: 'main_content',
          duration: '{{duration}}',
          background_color: '#000000',
          
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
                { effect: 'zoomIn', duration: 1, delay: 0 }
              ]
            },
            {
              type: 'FFRect',
              props: {
                x: 0,
                y: 1500,
                width: 1080,
                height: 420,
                color: 'linear-gradient(transparent, rgba(0,0,0,0.9))'
              }
            },
            {
              type: 'FFText',
              props: {
                text: '{{subtitle_text}}',
                x: 540,
                y: 1700,
                width: 1000,
                style: {
                  fontSize: 52,
                  color: '#FFFFFF',
                  textAlign: 'center',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: '700',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  lineHeight: 1.3
                }
              },
              animations: [
                { effect: 'slideInUp', duration: 0.6, delay: 0.3 }
              ]
            }
          ],
          
          audio: {
            path: '{{tts_audio}}',
            volume: 0.9
          }
        }
      ]
    },

    // Instagram Stories Template
    'mobile_instagram_stories': {
      creator_config: {
        width: 1080,
        height: 1920,
        fps: 30,
        debug: false
      },
      
      scenes: [
        {
          type: 'story_content',
          duration: '{{duration}}',
          
          elements: [
            // Blurred background
            {
              type: 'FFImage',
              props: {
                path: '{{comfyui_image}}',
                x: 540,
                y: 960,
                width: 1080,
                height: 1920,
                fit: 'cover',
                filter: 'blur(10px) brightness(0.4)'
              }
            },
            // Main centered image
            {
              type: 'FFImage',
              props: {
                path: '{{comfyui_image}}',
                x: 540,
                y: 800,
                width: 900,
                height: 900,
                fit: 'contain',
                style: {
                  borderRadius: '20px',
                  border: '4px solid #FFFFFF',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                }
              },
              animations: [
                { effect: 'pulse', duration: 0.8, delay: 0.2 }
              ]
            },
            // Top title
            {
              type: 'FFText',
              props: {
                text: '{{title_text}}',
                x: 540,
                y: 200,
                width: 1000,
                style: {
                  fontSize: 48,
                  color: '#FFFFFF',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,1)'
                }
              },
              animations: [
                { effect: 'fadeInDown', duration: 1, delay: 0 }
              ]
            },
            // Bottom subtitle with glass effect
            {
              type: 'FFText',
              props: {
                text: '{{subtitle_text}}',
                x: 540,
                y: 1750,
                width: 1000,
                style: {
                  fontSize: 36,
                  color: '#FFFFFF',
                  textAlign: 'center',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '15px',
                  borderRadius: '25px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }
              },
              animations: [
                { effect: 'slideInUp', duration: 0.8, delay: 0.5 }
              ]
            }
          ],
          
          audio: {
            path: '{{tts_audio}}',
            volume: 0.8
          }
        }
      ]
    },

    // YouTube Shorts Template
    'mobile_youtube_shorts': {
      creator_config: {
        width: 1080,
        height: 1920,
        fps: 30,
        debug: false
      },
      
      scenes: [
        {
          type: 'shorts_content',
          duration: '{{duration}}',
          
          elements: [
            // Full background image
            {
              type: 'FFImage',
              props: {
                path: '{{comfyui_image}}',
                x: 540,
                y: 960,
                width: 1080,
                height: 1920,
                fit: 'cover'
              }
            },
            // Large title with stroke
            {
              type: 'FFText',
              props: {
                text: '{{title_text}}',
                x: 540,
                y: 300,
                width: 1000,
                style: {
                  fontSize: 64,
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  textStroke: '3px #000000',
                  textShadow: '4px 4px 8px rgba(0,0,0,0.8)',
                  fontFamily: 'Arial Black, sans-serif'
                }
              },
              animations: [
                { effect: 'bounceInDown', duration: 1, delay: 0.2 }
              ]
            },
            // Description with high contrast background
            {
              type: 'FFText',
              props: {
                text: '{{subtitle_text}}',
                x: 540,
                y: 1600,
                width: 1000,
                style: {
                  fontSize: 40,
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  padding: '25px',
                  borderRadius: '15px',
                  textAlign: 'center',
                  border: '2px solid #FFFFFF',
                  fontWeight: '600'
                }
              },
              animations: [
                { effect: 'slideInUp', duration: 0.8, delay: 0.8 }
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

    // Universal Square Template (1:1)
    'mobile_square_universal': {
      creator_config: {
        width: 1080,
        height: 1080,
        fps: 30,
        debug: false
      },
      
      scenes: [
        {
          type: 'square_content',
          duration: '{{duration}}',
          background_color: '#f8f9fa',
          
          elements: [
            // Centered image with padding
            {
              type: 'FFImage',
              props: {
                path: '{{comfyui_image}}',
                x: 540,
                y: 400,
                width: 900,
                height: 500,
                fit: 'contain',
                style: {
                  borderRadius: '20px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                }
              },
              animations: [
                { effect: 'fadeIn', duration: 1, delay: 0 }
              ]
            },
            // Clean text below image
            {
              type: 'FFText',
              props: {
                text: '{{subtitle_text}}',
                x: 540,
                y: 850,
                width: 1000,
                style: {
                  fontSize: 36,
                  color: '#2c3e50',
                  textAlign: 'center',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: '600',
                  lineHeight: 1.4
                }
              },
              animations: [
                { effect: 'slideInUp', duration: 0.8, delay: 0.5 }
              ]
            }
          ],
          
          audio: {
            path: '{{tts_audio}}',
            volume: 0.9
          }
        }
      ]
    }
  };

  /**
   * Create a custom mobile template with specific parameters
   * @param {Object} params - Template parameters
   * @returns {Object} Custom template configuration
   */
  static createCustomMobileTemplate(params) {
    const {
      width = 1080,
      height = 1920,
      fps = 30,
      duration = 10,
      backgroundColor = '#000000',
      imageProps = {},
      textProps = {},
      audioProps = {}
    } = params;

    return {
      template_id: 'custom_mobile',
      creator_config: {
        width,
        height,
        fps,
        debug: false
      },
      
      scenes: [
        {
          type: 'custom_content',
          duration: duration,
          background_color: backgroundColor,
          
          elements: [
            {
              type: 'FFImage',
              props: {
                path: '{{comfyui_image}}',
                x: width / 2,
                y: height / 2,
                width: width,
                height: height,
                fit: 'cover',
                ...imageProps
              },
              animations: [
                { effect: 'fadeIn', duration: 1, delay: 0 }
              ]
            },
            {
              type: 'FFText',
              props: {
                text: '{{subtitle_text}}',
                x: width / 2,
                y: height - 170,
                width: width - 80,
                style: {
                  fontSize: Math.floor(width * 0.045),
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  textAlign: 'center',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: 'bold',
                  padding: '20px',
                  borderRadius: '12px',
                  ...textProps
                }
              },
              animations: [
                { effect: 'slideInUp', duration: 0.8, delay: 0.5 }
              ]
            }
          ],
          
          audio: {
            path: '{{tts_audio}}',
            volume: 1.0,
            ...audioProps
          }
        }
      ]
    };
  }

  /**
   * Get template by platform optimization
   * @param {string} platform - Target platform (tiktok, instagram, youtube, etc.)
   * @param {Object} variables - Template variables
   * @returns {Object} Platform-optimized template
   */
  static getTemplateByPlatform(platform, variables = {}) {
    const platformMap = {
      'tiktok': 'mobile_tiktok_style',
      'instagram_stories': 'mobile_instagram_stories',
      'instagram_reels': 'mobile_tiktok_style',
      'youtube_shorts': 'mobile_youtube_shorts',
      'facebook': 'mobile_square_universal',
      'twitter': 'mobile_square_universal',
      'linkedin': 'mobile_square_universal',
      'default': 'mobile_vertical_standard'
    };

    const templateId = platformMap[platform.toLowerCase()] || platformMap.default;
    return this.getTemplate(templateId, variables);
  }

  /**
   * Validate template variables
   * @param {string} templateId - Template identifier
   * @param {Object} variables - Variables to validate
   * @returns {Object} Validation result
   */
  static validateTemplateVariables(templateId, variables) {
    const requiredVars = {
      'mobile_vertical_standard': ['comfyui_image', 'subtitle_text', 'tts_audio', 'duration'],
      'mobile_tiktok_style': ['comfyui_image', 'subtitle_text', 'tts_audio', 'duration'],
      'mobile_instagram_stories': ['comfyui_image', 'title_text', 'subtitle_text', 'tts_audio', 'duration'],
      'mobile_youtube_shorts': ['comfyui_image', 'title_text', 'subtitle_text', 'tts_audio', 'duration'],
      'mobile_square_universal': ['comfyui_image', 'subtitle_text', 'tts_audio', 'duration']
    };

    const required = requiredVars[templateId] || [];
    const missing = required.filter(varName => !variables[varName]);
    const provided = Object.keys(variables);

    return {
      valid: missing.length === 0,
      missing,
      provided,
      required
    };
  }
}

module.exports = MobileTemplateLibrary;