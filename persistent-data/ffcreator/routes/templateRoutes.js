// routes/templateRoutes.js - Complete file

const { TemplateService } = require('../templates');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');

/**
 * Initialize Template Service (add this to your server.js startup)
 */
function initializeTemplateService(logger, directories) {
  const templateService = new TemplateService({
    cacheDir: directories.CACHE_DIR,
    outputDir: directories.OUTPUT_DIR,
    assetsDir: directories.ASSETS_DIR,
    ttsDir: directories.TTS_DIR,
    logger: logger
  });
  
  console.log('✅ Template service initialized');
  return templateService;
}

/**
 * Validation schemas for template requests
 */
const templateValidationSchemas = {
  // Template by ID request
  templateById: Joi.object({
    template_id: Joi.string().required(),
    variables: Joi.object({
      comfyui_image: Joi.string().required(),
      subtitle_text: Joi.string().required(),
      tts_audio: Joi.string().required(),
      duration: Joi.number().min(1).max(300).default(10),
      title_text: Joi.string().optional()
    }).required(),
    output_name: Joi.string().optional(),
    webhook_url: Joi.string().uri().optional()
  }),

  // Platform-specific template request
  platformTemplate: Joi.object({
    platform: Joi.string().valid('tiktok', 'instagram_stories', 'instagram_reels', 'youtube_shorts', 'facebook', 'twitter', 'linkedin').required(),
    variables: Joi.object({
      comfyui_image: Joi.string().required(),
      subtitle_text: Joi.string().required(),
      tts_audio: Joi.string().required(),
      duration: Joi.number().min(1).max(300).default(10),
      title_text: Joi.string().optional()
    }).required(),
    output_name: Joi.string().optional(),
    webhook_url: Joi.string().uri().optional()
  }),

  // Custom template request
  customTemplate: Joi.object({
    template_config: Joi.object().required(),
    variables: Joi.object().required(),
    output_name: Joi.string().optional(),
    webhook_url: Joi.string().uri().optional()
  })
};

/**
 * Template Routes - Add these to your Express app
 * 
 * USAGE in your server.js:
 * const templateService = initializeTemplateService(logger, { CACHE_DIR, OUTPUT_DIR, ASSETS_DIR, TTS_DIR });
 * setupTemplateRoutes(app, templateService, pool, videoQueue);
 */
function setupTemplateRoutes(app, templateService, pool, videoQueue) {

  // Get available templates
  app.get('/api/templates', (req, res) => {
    try {
      const templates = templateService.getAvailableTemplates();
      res.json({
        success: true,
        templates: templates,
        count: templates.length
      });
    } catch (error) {
      console.error('Failed to get templates:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve templates'
      });
    }
  });

  // Validate template variables
  app.post('/api/templates/:templateId/validate', (req, res) => {
    try {
      const { templateId } = req.params;
      const { variables } = req.body;
      
      const validation = templateService.validateVariables(templateId, variables);
      
      res.json({
        success: true,
        validation: validation
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  // Create video using template by ID
  app.post('/api/videos/template', async (req, res) => {
    try {
      // Validate request
      const { error, value } = templateValidationSchemas.templateById.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.details
        });
      }

      const { template_id, variables, output_name, webhook_url } = value;
      const jobId = uuidv4();
      const outputName = output_name || `template_${template_id}_${jobId}.mp4`;

      // Validate template variables
      const validation = templateService.validateVariables(template_id, variables);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Missing required variables',
          missing: validation.missing,
          required: validation.required
        });
      }

      // Store job in database
      await pool.query(
        'INSERT INTO jobs (id, status, config, output_name, webhook_url) VALUES ($1, $2, $3, $4, $5)',
        [jobId, 'queued', JSON.stringify({ template_id, variables, type: 'template' }), outputName, webhook_url]
      );

      // Queue the template job
      const job = await videoQueue.add('processTemplate', {
        template_id,
        variables,
        output_name: outputName,
        jobId,
        type: 'template'
      });

      res.status(202).json({
        success: true,
        jobId: jobId,
        template_id: template_id,
        status: 'queued',
        message: 'Template video creation queued successfully',
        statusUrl: `/api/jobs/${jobId}`,
        downloadUrl: null
      });

    } catch (error) {
      console.error('Template video creation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create template video job'
      });
    }
  });

  // Create video using platform-specific template
  app.post('/api/videos/platform', async (req, res) => {
    try {
      // Validate request
      const { error, value } = templateValidationSchemas.platformTemplate.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.details
        });
      }

      const { platform, variables, output_name, webhook_url } = value;
      const jobId = uuidv4();
      const outputName = output_name || `platform_${platform}_${jobId}.mp4`;

      // Store job in database
      await pool.query(
        'INSERT INTO jobs (id, status, config, output_name, webhook_url) VALUES ($1, $2, $3, $4, $5)',
        [jobId, 'queued', JSON.stringify({ platform, variables, type: 'platform' }), outputName, webhook_url]
      );

      // Queue the platform job
      const job = await videoQueue.add('processPlatformTemplate', {
        platform,
        variables,
        output_name: outputName,
        jobId,
        type: 'platform'
      });

      res.status(202).json({
        success: true,
        jobId: jobId,
        platform: platform,
        status: 'queued',
        message: 'Platform video creation queued successfully',
        statusUrl: `/api/jobs/${jobId}`,
        downloadUrl: null
      });

    } catch (error) {
      console.error('Platform video creation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create platform video job'
      });
    }
  });

  // Create video using custom template
  app.post('/api/videos/custom-template', async (req, res) => {
    try {
      // Validate request
      const { error, value } = templateValidationSchemas.customTemplate.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.details
        });
      }

      const { template_config, variables, output_name, webhook_url } = value;
      const jobId = uuidv4();
      const outputName = output_name || `custom_template_${jobId}.mp4`;

      // Store job in database
      await pool.query(
        'INSERT INTO jobs (id, status, config, output_name, webhook_url) VALUES ($1, $2, $3, $4, $5)',
        [jobId, 'queued', JSON.stringify({ template_config, variables, type: 'custom' }), outputName, webhook_url]
      );

      // Queue the custom template job
      const job = await videoQueue.add('processCustomTemplate', {
        template_config,
        variables,
        output_name: outputName,
        jobId,
        type: 'custom'
      });

      res.status(202).json({
        success: true,
        jobId: jobId,
        status: 'queued',
        message: 'Custom template video creation queued successfully',
        statusUrl: `/api/jobs/${jobId}`,
        downloadUrl: null
      });

    } catch (error) {
      console.error('Custom template video creation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create custom template video job'
      });
    }
  });
}

/**
 * Job Processors - Add these to your job processing initialization
 * 
 * USAGE in your server.js initializeJobProcessing function:
 * setupTemplateJobProcessors(videoQueue, templateService, pool, OUTPUT_DIR);
 */
function setupTemplateJobProcessors(videoQueue, templateService, pool, OUTPUT_DIR) {
  const path = require('path');

  // Process template by ID
  videoQueue.process('processTemplate', 4, async (job) => {
    const { template_id, variables, output_name, jobId } = job.data;
    
    try {
      await pool.query('UPDATE jobs SET status = $1, started_at = NOW() WHERE id = $2', ['processing', jobId]);
      
      const outputPath = path.join(OUTPUT_DIR, output_name || `template_${jobId}.mp4`);
      
      // Create FFCreator instance using template service
      const creator = await templateService.processTemplateById(template_id, variables);
      
      // Set up creator with output path and event handlers
      creator.output(outputPath);
      
      await new Promise((resolve, reject) => {
        creator.on('error', (error) => {
          console.error(`❌ Template video creation failed for job ${jobId}:`, error);
          reject(error);
        });
        
        creator.on('progress', (e) => {
          const progress = Math.round(e.percent * 100);
          console.log(`🎬 Template progress for job ${jobId}: ${progress}%`);
          job.progress(progress);
          pool.query('UPDATE jobs SET progress = $1 WHERE id = $2', [progress, jobId]);
        });
        
        creator.on('complete', (e) => {
          console.log(`🎉 Template video completed for job ${jobId}: ${e.output}`);
          resolve(e);
        });
        
        creator.start();
      });

      const downloadUrl = `/download/${path.basename(outputPath)}`;
      await pool.query(
        'UPDATE jobs SET status = $1, completed_at = NOW(), download_url = $2, output_path = $3 WHERE id = $4',
        ['completed', downloadUrl, outputPath, jobId]
      );

      return { jobId, status: 'completed', downloadUrl, template_id };

    } catch (error) {
      await pool.query(
        'UPDATE jobs SET status = $1, failed_at = NOW(), error_message = $2 WHERE id = $3',
        ['failed', error.message, jobId]
      );
      throw error;
    }
  });

  // Process platform template
  videoQueue.process('processPlatformTemplate', 4, async (job) => {
    const { platform, variables, output_name, jobId } = job.data;
    
    try {
      await pool.query('UPDATE jobs SET status = $1, started_at = NOW() WHERE id = $2', ['processing', jobId]);
      
      const outputPath = path.join(OUTPUT_DIR, output_name || `platform_${jobId}.mp4`);
      
      // Create FFCreator instance using platform template
      const creator = await templateService.processTemplateByPlatform(platform, variables);
      
      creator.output(outputPath);
      
      await new Promise((resolve, reject) => {
        creator.on('error', reject);
        creator.on('progress', (e) => {
          const progress = Math.round(e.percent * 100);
          job.progress(progress);
          pool.query('UPDATE jobs SET progress = $1 WHERE id = $2', [progress, jobId]);
        });
        creator.on('complete', resolve);
        creator.start();
      });

      const downloadUrl = `/download/${path.basename(outputPath)}`;
      await pool.query(
        'UPDATE jobs SET status = $1, completed_at = NOW(), download_url = $2, output_path = $3 WHERE id = $4',
        ['completed', downloadUrl, outputPath, jobId]
      );

      return { jobId, status: 'completed', downloadUrl, platform };

    } catch (error) {
      await pool.query(
        'UPDATE jobs SET status = $1, failed_at = NOW(), error_message = $2 WHERE id = $3',
        ['failed', error.message, jobId]
      );
      throw error;
    }
  });

  // Process custom template
  videoQueue.process('processCustomTemplate', 4, async (job) => {
    const { template_config, variables, output_name, jobId } = job.data;
    
    try {
      await pool.query('UPDATE jobs SET status = $1, started_at = NOW() WHERE id = $2', ['processing', jobId]);
      
      const outputPath = path.join(OUTPUT_DIR, output_name || `custom_${jobId}.mp4`);
      
      // Create FFCreator instance using custom template
      const creator = await templateService.processCustomTemplate(template_config, variables);
      
      creator.output(outputPath);
      
      await new Promise((resolve, reject) => {
        creator.on('error', reject);
        creator.on('progress', (e) => {
          const progress = Math.round(e.percent * 100);
          job.progress(progress);
          pool.query('UPDATE jobs SET progress = $1 WHERE id = $2', [progress, jobId]);
        });
        creator.on('complete', resolve);
        creator.start();
      });

      const downloadUrl = `/download/${path.basename(outputPath)}`;
      await pool.query(
        'UPDATE jobs SET status = $1, completed_at = NOW(), download_url = $2, output_path = $3 WHERE id = $4',
        ['completed', downloadUrl, outputPath, jobId]
      );

      return { jobId, status: 'completed', downloadUrl };

    } catch (error) {
      await pool.query(
        'UPDATE jobs SET status = $1, failed_at = NOW(), error_message = $2 WHERE id = $3',
        ['failed', error.message, jobId]
      );
      throw error;
    }
  });
}

module.exports = {
  initializeTemplateService,
  setupTemplateRoutes,
  setupTemplateJobProcessors,
  templateValidationSchemas
};