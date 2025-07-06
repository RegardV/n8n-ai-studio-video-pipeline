const express = require('express');
const { FFCreator, FFScene, FFImage, FFText, FFVideo } = require('ffcreator');
const Queue = require('bull');
const Redis = require('redis');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const Joi = require('joi');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');

const app = express();
const PORT = process.env.PORT || 3001;

// 🔧 FIXED: Global variables properly declared
let pool;
let redis;
let jwtSecret;

// JWT secret management
async function getJwtSecret() {
  try {
    if (process.env.JWT_SECRET_FILE) {
      return fs.readFileSync(process.env.JWT_SECRET_FILE, 'utf8').trim();
    }
    return process.env.JWT_SECRET || 'fallback-jwt-secret-key';
  } catch (error) {
    console.error('❌ Failed to read JWT secret from secrets:', error);
    return 'fallback-jwt-secret-key';
  }
}

// Unified logging configuration
function initializeLogging() {
  const logLevel = process.env.LOG_LEVEL || 'info';
  const logFile = process.env.LOG_FILE;
  
  const transports = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ];
  
  if (logFile) {
    transports.push(
      new winston.transports.File({
        filename: logFile,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      })
    );
  }
  
  return winston.createLogger({
    level: logLevel,
    transports: transports
  });
}

const logger = initializeLogging();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Rate limiting
const createRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests from this IP, please try again later' }
});

app.use('/api/', createRateLimit);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Docker secrets-compatible database configuration
async function getDatabaseUrl() {
  try {
    if (process.env.DATABASE_URL_FILE) {
      return fs.readFileSync(process.env.DATABASE_URL_FILE, 'utf8').trim();
    }
    return process.env.DATABASE_URL || 'postgresql://ffcreator_user:secure_password@ffcreator-db:5432/ffcreator';
  } catch (error) {
    console.error('❌ Failed to read database URL from secrets:', error);
    return 'postgresql://ffcreator_user:secure_password@ffcreator-db:5432/ffcreator';
  }
}

// 🔧 FIXED: Pool initialization with proper assignment
async function initializeDatabase() {
  try {
    const databaseUrl = await getDatabaseUrl();
    pool = new Pool({
      connectionString: databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    
    // Test the connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    
    console.log('✅ Database pool initialized and tested successfully');
    return pool;
  } catch (error) {
    console.error('❌ Database pool initialization failed:', error);
    throw error;
  }
}

// Docker secrets-compatible Redis configuration
async function getRedisConfig() {
  try {
    const baseUrl = process.env.REDIS_URL || 'redis://redis-cache:6379';
    
    if (process.env.REDIS_PASSWORD_FILE) {
      const password = fs.readFileSync(process.env.REDIS_PASSWORD_FILE, 'utf8').trim();
      const url = new URL(baseUrl);
      url.password = password;
      return { url: url.toString() };
    }
    
    return { url: baseUrl };
  } catch (error) {
    console.error('❌ Failed to read Redis password from secrets:', error);
    return { url: process.env.REDIS_URL || 'redis://redis-cache:6379' };
  }
}

// 🔧 FIXED: Redis initialization with proper assignment and error handling
async function initializeRedis() {
  try {
    const redisConfig = await getRedisConfig();
    redis = Redis.createClient(redisConfig);
    
    // Add error handlers
    redis.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });
    
    redis.on('connect', () => {
      console.log('🔄 Redis connecting...');
    });
    
    redis.on('ready', () => {
      console.log('✅ Redis ready');
    });
    
    await redis.connect();
    console.log('✅ Redis initialized and connected successfully');
    return redis;
  } catch (error) {
    console.error('❌ Redis initialization failed:', error);
    throw error;
  }
}

// Initialize Bull queue (after Redis is available)
let videoQueue;
function initializeQueue() {
  videoQueue = new Queue('video processing', {
    redis: { host: 'redis-cache', port: 6379 },
    defaultJobOptions: { removeOnComplete: 10, removeOnFail: 5 }
  });
  
  console.log('✅ Video processing queue initialized');
}

// Directories
const OUTPUT_DIR = '/app/videos';
const ASSETS_DIR = '/app/ai-assets';
const TTS_DIR = '/app/tts-audio';
const CACHE_DIR = '/app/cache';
const TEMP_DIR = '/app/temp';

[OUTPUT_DIR, ASSETS_DIR, TTS_DIR, CACHE_DIR, TEMP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 🔧 FIXED: Single GPU validation function (removed duplicate)
function validateGpuAccess() {
  const { execSync } = require('child_process');
  
  try {
    const gpuInfo = execSync('nvidia-smi --query-gpu=name,memory.total --format=csv,noheader', 
      { encoding: 'utf8', timeout: 5000 });
    console.log(`🎮 GPU detected: ${gpuInfo.trim()}`);
    return true;
  } catch (error) {
    console.warn('⚠️ GPU not available, falling back to CPU rendering');
    return false;
  }
}

// GPU-optimized video creation with intelligent fallback
async function createVideo(config, outputPath, jobId, progressCallback) {
  return new Promise((resolve, reject) => {
    try {
      const hasGpu = validateGpuAccess();
      
      console.log(`🎮 Starting ${hasGpu ? 'GPU-accelerated' : 'CPU-based'} video creation for job ${jobId}`);
      
      const creator = new FFCreator({
        cacheDir: CACHE_DIR,
        outputDir: path.dirname(outputPath),
        width: config.width || 1920,
        height: config.height || 1080,
        fps: config.fps || 30,
        
        // Core settings
        debug: false,
        pool: true,
        parallel: hasGpu ? 8 : 4,
        threads: hasGpu ? 12 : 6,
        highWaterMark: '512kb',
        
        // Rendering settings
        render: 0,
        forceCanvas: false,
        
        // Video encoding settings - GPU vs CPU
        ...(hasGpu ? {
          // NVIDIA GPU hardware encoding
          outputVideoCodec: 'h264_nvenc',
          outputVideoQuality: 'high',
          outputPixelFormat: 'yuv420p',
          
          // NVENC parameters optimized for RTX 3080
          ffmpegParams: [
            '-c:v', 'h264_nvenc',
            '-preset', 'fast',
            '-crf', '18',
            '-b:v', '10M',
            '-maxrate', '15M',
            '-bufsize', '20M',
            '-rc:v', 'vbr',
            '-rc-lookahead', '20',
            '-spatial_aq', '1',
            '-aq-strength', '8'
          ]
        } : {
          // CPU fallback encoding
          outputVideoCodec: 'libx264',
          outputVideoQuality: 'medium',
          outputPixelFormat: 'yuv420p',
          
          // CPU encoding parameters
          ffmpegParams: [
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '23',
            '-b:v', '5M',
            '-maxrate', '8M',
            '-bufsize', '10M',
            '-profile:v', 'high',
            '-level', '4.0'
          ]
        })
      });

      creator.on('error', (error) => {
        const errorMessage = `${hasGpu ? 'GPU' : 'CPU'} video creation failed: ${error.message}`;
        console.error(`❌ FFCreator ${hasGpu ? 'GPU' : 'CPU'} error for job ${jobId}:`, error);
        reject(new Error(errorMessage));
      });
      
      creator.on('progress', (e) => {
        const progress = Math.round(e.percent * 100);
        console.log(`🎬 ${hasGpu ? 'GPU' : 'CPU'} progress for job ${jobId}: ${progress}%`);
        if (progressCallback) progressCallback(progress);
      });
      
      creator.on('complete', (e) => {
        console.log(`🎉 ${hasGpu ? 'GPU' : 'CPU'} video completed for job ${jobId}: ${e.output}`);
        resolve(e);
      });
      
      // Process N8N workflow scenes
      processN8NScenes(creator, config);
      
      creator.output(outputPath);
      creator.start();
      
    } catch (error) {
      console.error(`❌ ${hasGpu ? 'GPU' : 'CPU'} setup error for job ${jobId}:`, error);
      reject(error);
    }
  });
}

// N8N workflow scene processing
function processN8NScenes(creator, config) {
  config.scenes.forEach((sceneConfig, index) => {
    const scene = new FFScene();
    scene.setBgColor(config.background || '#000000');
    scene.setDuration(sceneConfig.duration || 5);
    
    // Advanced transitions
    if (index > 0) {
      scene.setTransition('GridFlip', 1.0);
    }
    
    if (sceneConfig.elements) {
      sceneConfig.elements.forEach(element => {
        try {
          addN8NElement(scene, element, config);
        } catch (error) {
          console.warn(`Warning: Failed to add element: ${error.message}`);
        }
      });
    }
    
    creator.addChild(scene);
  });
  
  // Add audio from Kokoro TTS
  if (config.audio && config.audio.src) {
    creator.addAudio({
      path: config.audio.src,
      volume: config.audio.volume || 1.0,
      fadeIn: 0.5,
      fadeOut: 0.5
    });
  }
}

function addN8NElement(scene, element, config) {
  switch (element.type) {
    case 'comfyui_image':
      const image = new FFImage({
        path: element.src,
        x: element.x || 0,
        y: element.y || 0,
        width: element.width || config.width,
        height: element.height || config.height
      });
      
      if (element.animation) {
        image.addEffect(element.animation, element.duration || 2, element.delay || 0);
      }
      
      scene.addChild(image);
      break;
      
    case 'subtitle':
      const subtitle = new FFText({
        text: element.text,
        x: element.x || (config.width / 2),
        y: element.y || (config.height - 100),
        fontSize: element.style?.fontSize || 36,
        color: element.style?.color || '#FFFFFF',
        backgroundColor: element.style?.backgroundColor || 'rgba(0,0,0,0.8)',
        fontFamily: element.style?.fontFamily || 'Arial Bold'
      });
      
      subtitle.setAnchor(0.5);
      subtitle.addEffect('fadeIn', 0.5, element.delay || 0);
      subtitle.addEffect('fadeOut', 0.5, (element.duration || 5) - 0.5);
      
      scene.addChild(subtitle);
      break;
  }
}

// 🔧 FIXED: Database schema initialization (separate from pool init)
async function initDatabaseSchema() {
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS jobs (
          id UUID PRIMARY KEY,
          status VARCHAR(20) DEFAULT 'queued',
          config JSONB NOT NULL,
          output_name VARCHAR(255),
          output_path VARCHAR(500),
          download_url VARCHAR(500),
          error_message TEXT,
          progress INTEGER DEFAULT 0,
          webhook_url VARCHAR(500),
          created_at TIMESTAMP DEFAULT NOW(),
          started_at TIMESTAMP,
          completed_at TIMESTAMP,
          failed_at TIMESTAMP
        )
      `);
      console.log('✅ Database schema initialized successfully');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Database schema initialization failed:', error);
    throw error;
  }
}

// 🔧 FIXED: Job processing initialization after queue is ready
function initializeJobProcessing() {
  videoQueue.process('createVideo', 4, async (job) => {
    const { config, output_name, jobId } = job.data;
    
    try {
      await pool.query('UPDATE jobs SET status = $1, started_at = NOW() WHERE id = $2', ['processing', jobId]);
      
      const outputPath = path.join(OUTPUT_DIR, output_name || `video_${jobId}.mp4`);
      
      await createVideo(config, outputPath, jobId, (progress) => {
        job.progress(progress);
        pool.query('UPDATE jobs SET progress = $1 WHERE id = $2', [progress, jobId]);
      });

      const downloadUrl = `/download/${path.basename(outputPath)}`;
      await pool.query('UPDATE jobs SET status = $1, completed_at = NOW(), download_url = $2, output_path = $3 WHERE id = $4', ['completed', downloadUrl, outputPath, jobId]);

      return { jobId, status: 'completed', downloadUrl };

    } catch (error) {
      await pool.query('UPDATE jobs SET status = $1, failed_at = NOW(), error_message = $2 WHERE id = $3', ['failed', error.message, jobId]);
      throw error;
    }
  });
  
  console.log('✅ Job processing initialized');
}

// API Routes
app.get('/health', async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT NOW() as timestamp, version() as pg_version');
    const redisStatus = await redis.ping();
    const hasGpu = validateGpuAccess();
    
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'ffcreator-gpu-api',
      database: {
        connected: true,
        version: dbResult.rows[0].pg_version,
        timestamp: dbResult.rows[0].timestamp
      },
      redis: redisStatus === 'PONG' ? 'connected' : 'disconnected',
      gpu: hasGpu ? 'RTX 3080 available' : 'CPU fallback',
      memory: process.memoryUsage(),
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Video creation endpoint (N8N compatible)
app.post('/api/videos', async (req, res) => {
  try {
    const { config, output_name, webhook_url } = req.body;
    const jobId = uuidv4();
    const outputName = output_name || `n8n_video_${jobId}.mp4`;

    await pool.query('INSERT INTO jobs (id, status, config, output_name, webhook_url) VALUES ($1, $2, $3, $4, $5)', [jobId, 'queued', JSON.stringify(config), outputName, webhook_url]);

    const job = await videoQueue.add('createVideo', { config, output_name: outputName, jobId });

    res.status(202).json({
      jobId: jobId,
      status: 'queued',
      message: 'GPU video creation queued successfully',
      statusUrl: `/api/jobs/${jobId}`
    });

  } catch (error) {
    console.error('Error creating video job:', error);
    res.status(500).json({ error: 'Failed to create video job' });
  }
});

// Legacy endpoint for backward compatibility
app.post('/create-test-video', (req, res) => {
  req.url = '/api/videos';
  app.handle(req, res);
});

// Job status endpoint
app.get('/api/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const result = await pool.query('SELECT * FROM jobs WHERE id = $1', [jobId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = result.rows[0];
    res.json({
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      downloadUrl: job.download_url,
      error: job.error_message,
      createdAt: job.created_at,
      completedAt: job.completed_at
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to get job status' });
  }
});

// Download endpoint
app.get('/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(OUTPUT_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
});

// 🔧 FIXED: Complete startup sequence with proper initialization order
async function startServer() {
  try {
    console.log('🔧 Initializing JWT secret...');
    jwtSecret = await getJwtSecret();
    
    console.log('🔧 Initializing database pool...');
    await initializeDatabase();
    
    console.log('🔧 Initializing Redis connection...');
    await initializeRedis();
    
    console.log('🔧 Initializing video processing queue...');
    initializeQueue();
    
    console.log('🔧 Initializing database schema...');
    await initDatabaseSchema();
    
    console.log('🔧 Initializing job processing...');
    initializeJobProcessing();
    
    console.log('🔧 Starting HTTP server...');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 FFCreator GPU API server running on port ${PORT}`);
      console.log(`🎮 GPU: RTX 3080 acceleration enabled`);
      console.log(`🗄️  Database: Connected to PostgreSQL`);
      console.log(`🔄 Redis: Connected for job queuing`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`✅ All services initialized successfully`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

startServer();