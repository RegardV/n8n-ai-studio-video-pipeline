// templates/index.js - Main integration module
const NativeTemplateProcessor = require('./NativeTemplateProcessor');
const MobileTemplateLibrary = require('./MobileTemplateLibrary');

/**
 * Template Service Integration for FFCreator Server
 * Provides unified interface for native template processing
 */
class TemplateService {
  constructor(options = {}) {
    this.processor = new NativeTemplateProcessor({
      cacheDir: options.cacheDir || '/app/cache',
      outputDir: options.outputDir || '/app/videos',
      assetsDir: options.assetsDir || '/app/ai-assets',
      ttsDir: options.ttsDir || '/app/tts-audio',
      logger: options.logger || console
    });
  }

  /**
   * Process a template by ID with variables
   * @param {string} templateId - Template identifier
   * @param {Object} variables - Template variables
   * @returns {Promise<FFCreator>} Configured FFCreator instance
   */
  async processTemplateById(templateId, variables = {}) {
    try {
      // Get template configuration from library
      const templateConfig = MobileTemplateLibrary.getTemplate(templateId, variables);
      
      // Validate variables
      const validation = MobileTemplateLibrary.validateTemplateVariables(templateId, variables);
      if (!validation.valid) {
        throw new Error(`Missing required variables: ${validation.missing.join(', ')}`);
      }
      
      // Process template with native processor
      return await this.processor.processTemplate(templateConfig, variables);
      
    } catch (error) {
      throw new Error(`Template processing failed: ${error.message}`);
    }
  }

  /**
   * Process a custom template configuration
   * @param {Object} templateConfig - Raw template configuration
   * @param {Object} variables - Template variables
   * @returns {Promise<FFCreator>} Configured FFCreator instance
   */
  async processCustomTemplate(templateConfig, variables = {}) {
    return await this.processor.processTemplate(templateConfig, variables);
  }

  /**
   * Get template by platform
   * @param {string} platform - Target platform
   * @param {Object} variables - Template variables
   * @returns {Promise<FFCreator>} Configured FFCreator instance
   */
  async processTemplateByPlatform(platform, variables = {}) {
    const templateConfig = MobileTemplateLibrary.getTemplateByPlatform(platform, variables);
    return await this.processor.processTemplate(templateConfig, variables);
  }

  /**
   * Get available templates
   * @returns {Array} Available templates with metadata
   */
  getAvailableTemplates() {
    return MobileTemplateLibrary.getAvailableTemplates();
  }

  /**
   * Validate template variables
   * @param {string} templateId - Template identifier
   * @param {Object} variables - Variables to validate
   * @returns {Object} Validation result
   */
  validateVariables(templateId, variables) {
    return MobileTemplateLibrary.validateTemplateVariables(templateId, variables);
  }
}

module.exports = {
  TemplateService,
  NativeTemplateProcessor,
  MobileTemplateLibrary
};