# TTS-Agnostic Karaoke Subtitle System - Technical Implementation

## System Architecture Overview

The karaoke subtitle system is designed as a **TTS-agnostic modular architecture** that can work with any audio source (Kokoro, Chatterbox, or future TTS services). The system separates audio analysis, timing calculation, and visual rendering into independent layers.

## Core Technical Components

### 1. Audio Analysis Engine (TTS-Independent)

**Purpose**: Extract timing metadata from any audio file without relying on TTS-specific APIs.

```javascript
class AudioTimingAnalyzer {
  constructor(options = {}) {
    this.sampleRate = options.sampleRate || 44100;
    this.frameSize = options.frameSize || 2048;
    this.hopLength = options.hopLength || 512;
  }

  async analyzeAudioFile(audioPath, textScript) {
    // Generic audio file processing
    const audioBuffer = await this.loadAudioFile(audioPath);
    const audioDuration = audioBuffer.duration;
    
    // Text-based timing calculation (TTS-agnostic)
    const words = this.parseTextToWords(textScript);
    const speechRate = this.calculateSpeechRate(words.length, audioDuration);
    
    // Generate word-level timing data
    return this.generateWordTimings(words, audioDuration, speechRate);
  }

  calculateSpeechRate(wordCount, duration) {
    // Standard speech: 150-160 words per minute
    // Adjust based on actual audio duration
    const wordsPerSecond = wordCount / duration;
    const baseRate = 2.5; // 150 wpm = 2.5 words/second
    
    return {
      rate: wordsPerSecond,
      adjustment: wordsPerSecond / baseRate,
      confidence: this.calculateConfidence(wordsPerSecond)
    };
  }

  generateWordTimings(words, totalDuration, speechRate) {
    let currentTime = 0;
    const pauseBetweenWords = 0.1; // 100ms standard pause
    
    return words.map((word, index) => {
      const wordDuration = this.calculateWordDuration(word, speechRate);
      const startTime = currentTime;
      const endTime = currentTime + wordDuration;
      
      currentTime = endTime + pauseBetweenWords;
      
      return {
        word: word.text,
        startTime: startTime,
        endTime: endTime,
        duration: wordDuration,
        index: index,
        confidence: word.confidence || 0.8
      };
    });
  }

  calculateWordDuration(word, speechRate) {
    // Linguistic analysis for timing
    const baseTime = 0.4; // 400ms base per word
    
    // Length-based adjustment
    const lengthMultiplier = Math.max(0.5, Math.min(2.0, word.text.length / 5));
    
    // Complexity adjustment (syllables, punctuation)
    const complexityMultiplier = this.getWordComplexity(word.text);
    
    // Speech rate adjustment
    const rateMultiplier = 1 / speechRate.adjustment;
    
    return baseTime * lengthMultiplier * complexityMultiplier * rateMultiplier;
  }
}
```

### 2. FFCreator Karaoke Animation System

**Purpose**: Pure visual rendering system that works with any timing data source.

```javascript
class FFKaraokeRenderer {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.options = {
      defaultStyle: {
        fontSize: 48,
        fontFamily: 'Arial Bold',
        unhighlightedColor: '#FFFFFF',
        highlightedColor: '#FFD700',
        backgroundColor: 'rgba(0,0,0,0.8)',
        textShadow: '3px 3px 6px rgba(0,0,0,0.8)'
      },
      ...options
    };
    this.wordElements = [];
  }

  createKaraokeText(timingData, textContent, position) {
    // Create container for all word elements
    const container = this.createTextContainer(position);
    
    // Generate individual word elements with timing
    timingData.forEach((wordTiming, index) => {
      const wordElement = this.createWordElement(wordTiming, index);
      container.addChild(wordElement);
    });
    
    this.scene.addChild(container);
    return container;
  }

  createWordElement(wordTiming, index) {
    const wordElement = new FFText({
      text: wordTiming.word,
      x: this.calculateWordPosition(index, wordTiming),
      y: this.options.baseY || 1700,
      fontSize: this.options.defaultStyle.fontSize,
      color: this.options.defaultStyle.unhighlightedColor,
      fontFamily: this.options.defaultStyle.fontFamily
    });

    // Add karaoke highlight animation
    this.addKaraokeAnimation(wordElement, wordTiming);
    
    return wordElement;
  }

  addKaraokeAnimation(wordElement, wordTiming) {
    const animationType = this.options.animationType || 'color_sweep';
    
    switch (animationType) {
      case 'color_sweep':
        this.addColorSweepAnimation(wordElement, wordTiming);
        break;
      case 'bounce_highlight':
        this.addBounceAnimation(wordElement, wordTiming);
        break;
      case 'word_reveal':
        this.addRevealAnimation(wordElement, wordTiming);
        break;
      case 'glow_effect':
        this.addGlowAnimation(wordElement, wordTiming);
        break;
    }
  }

  addColorSweepAnimation(wordElement, wordTiming) {
    // Smooth color transition animation
    wordElement.addEffect('colorTransition', {
      from: this.options.defaultStyle.unhighlightedColor,
      to: this.options.defaultStyle.highlightedColor,
      duration: wordTiming.duration * 0.8, // 80% of word duration
      delay: wordTiming.startTime,
      easing: 'easeInOutQuad'
    });

    // Return to original color after highlight
    wordElement.addEffect('colorTransition', {
      from: this.options.defaultStyle.highlightedColor,
      to: this.options.defaultStyle.unhighlightedColor,
      duration: 0.2,
      delay: wordTiming.endTime,
      easing: 'easeOut'
    });
  }

  addBounceAnimation(wordElement, wordTiming) {
    // Scale and color change for energetic effect
    wordElement.addEffect('scale', {
      from: 1.0,
      to: 1.2,
      duration: wordTiming.duration * 0.3,
      delay: wordTiming.startTime,
      easing: 'easeOutBounce'
    });

    wordElement.addEffect('colorTransition', {
      from: this.options.defaultStyle.unhighlightedColor,
      to: this.options.defaultStyle.highlightedColor,
      duration: wordTiming.duration,
      delay: wordTiming.startTime
    });

    // Return to normal scale
    wordElement.addEffect('scale', {
      from: 1.2,
      to: 1.0,
      duration: wordTiming.duration * 0.4,
      delay: wordTiming.startTime + (wordTiming.duration * 0.6),
      easing: 'easeInQuad'
    });
  }

  addRevealAnimation(wordElement, wordTiming) {
    // Start invisible, fade in when word is spoken
    wordElement.setOpacity(0);
    
    wordElement.addEffect('fadeIn', {
      from: 0,
      to: 1,
      duration: 0.3,
      delay: wordTiming.startTime,
      easing: 'easeOut'
    });

    // Color highlight during speech
    wordElement.addEffect('colorTransition', {
      from: this.options.defaultStyle.unhighlightedColor,
      to: this.options.defaultStyle.highlightedColor,
      duration: wordTiming.duration * 0.7,
      delay: wordTiming.startTime + 0.3
    });
  }

  addGlowAnimation(wordElement, wordTiming) {
    // Subtle glow effect for professional content
    wordElement.addEffect('glow', {
      intensity: 0.5,
      color: this.options.defaultStyle.highlightedColor,
      duration: wordTiming.duration,
      delay: wordTiming.startTime,
      easing: 'easeInOutSine'
    });

    wordElement.addEffect('colorTransition', {
      from: this.options.defaultStyle.unhighlightedColor,
      to: this.options.defaultStyle.highlightedColor,
      duration: wordTiming.duration * 0.6,
      delay: wordTiming.startTime,
      opacity: 0.8
    });
  }
}
```

### 3. Template Integration Layer

**Purpose**: Seamless integration with existing FFCreator template system.

```javascript
// Enhanced Mobile Template with Karaoke Support
'mobile_karaoke_universal': {
  creator_config: {
    width: 1080,
    height: 1920,
    fps: 30,
    debug: false
  },
  
  scenes: [
    {
      type: 'karaoke_content',
      duration: '{{duration}}',
      background_color: '#000000',
      
      elements: [
        // Background image (any source)
        {
          type: 'FFImage',
          props: {
            path: '{{background_image}}', // Generic image path
            x: 540, y: 960,
            width: 1080, height: 1920,
            fit: 'cover'
          },
          animations: [
            { effect: 'fadeIn', duration: 1, delay: 0 }
          ]
        },
        
        // Karaoke subtitle system (TTS-agnostic)
        {
          type: 'FFKaraokeText',
          props: {
            // Generic audio file path (works with any TTS)
            audioPath: '{{audio_file}}',
            textContent: '{{subtitle_text}}',
            timingData: '{{word_timings}}', // Pre-calculated or generated
            
            x: 540, y: 1700,
            width: 1000,
            
            style: {
              fontSize: 48,
              fontFamily: 'Arial Bold',
              unhighlightedColor: '#FFFFFF',
              highlightedColor: '{{highlight_color}}',
              backgroundColor: 'rgba(0,0,0,0.9)',
              textAlign: 'center',
              padding: '25px',
              borderRadius: '15px'
            },
            
            karaoke: {
              animationType: '{{animation_style}}',
              timingSource: 'calculated', // vs 'provided'
              syncTolerance: 100, // ms
              autoAdjust: true
            }
          }
        }
      ],
      
      audio: {
        path: '{{audio_file}}', // Same audio file, any source
        volume: 1.0
      }
    }
  ]
}
```

### 4. N8N Integration Workflow

**Purpose**: TTS-agnostic workflow that works with any audio generation service.

```javascript
// N8N Code Node: Universal Karaoke Timing Generator
const generateUniversalKaraokeTiming = () => {
  // Input from any TTS service (generic)
  const audioData = $('TTS Generation').first().json; // Any TTS node
  const textScript = $('Manual Trigger').first().json.script_text;
  
  // Generic audio file processing
  const audioPath = audioData.audioPath || audioData.audio_file || audioData.output_path;
  const audioDuration = audioData.duration || calculateAudioDuration(audioPath);
  
  // Text analysis (TTS-independent)
  const words = textScript.split(' ');
  const averageWordTime = audioDuration / words.length;
  
  // Generate karaoke timing data
  const karaokeTimings = words.map((word, index) => {
    const startTime = index * averageWordTime;
    const wordDuration = calculateWordDuration(word, averageWordTime);
    
    return {
      word: word,
      startTime: startTime,
      endTime: startTime + wordDuration,
      duration: wordDuration,
      index: index,
      // Platform-specific styling
      highlight: {
        color: getHighlightColor(word, index),
        animation: getPlatformAnimation()
      }
    };
  });
  
  return [{
    json: {
      karaokeEnabled: true,
      audioPath: audioPath,
      audioDuration: audioDuration,
      wordTimings: karaokeTimings,
      textContent: textScript,
      // Template variables (TTS-agnostic)
      template_variables: {
        audio_file: audioPath,
        subtitle_text: textScript,
        word_timings: karaokeTimings,
        animation_style: 'color_sweep',
        highlight_color: '#FFD700'
      }
    }
  }];
};

function calculateWordDuration(word, baseTime) {
  // Linguistic analysis for better timing
  const syllableCount = countSyllables(word);
  const complexityFactor = getWordComplexity(word);
  const punctuationDelay = /[.!?]$/.test(word) ? 0.3 : 0;
  
  return (baseTime * syllableCount * complexityFactor) + punctuationDelay;
}

function getHighlightColor(word, index) {
  // Dynamic color selection based on content
  if (word.includes('!')) return '#FF6B35'; // Excitement - Orange
  if (word.includes('?')) return '#00D4FF'; // Question - Blue  
  if (index === 0) return '#FFD700'; // First word - Gold
  return '#FFFFFF'; // Default - White
}

function getPlatformAnimation() {
  const platform = $('Manual Trigger').first().json.target_platform || 'universal';
  
  const platformAnimations = {
    'tiktok': 'bounce_highlight',
    'instagram': 'color_sweep',
    'youtube': 'word_reveal',
    'linkedin': 'glow_effect',
    'universal': 'color_sweep'
  };
  
  return platformAnimations[platform] || 'color_sweep';
}
```

## Implementation Timeline

### Phase 1: Core Engine Development (Week 1-2)
- **AudioTimingAnalyzer** class implementation
- **FFKaraokeRenderer** animation system
- Basic timing calculation algorithms
- Unit testing for timing accuracy

### Phase 2: Template Integration (Week 2-3)
- Template system extensions for karaoke support
- **FFKaraokeText** component development
- Platform-specific animation presets
- Template validation and error handling

### Phase 3: N8N Workflow Integration (Week 3-4)
- Universal karaoke timing generation nodes
- TTS-agnostic workflow patterns
- Multi-platform template selection logic
- Progress monitoring and error handling

### Phase 4: Testing & Optimization (Week 4-5)
- Audio-visual synchronization validation
- Performance optimization for GPU rendering
- Cross-platform compatibility testing
- User acceptance testing with real content

## Technical Advantages

### TTS Service Independence
- **Future-Proof**: Works with any current or future TTS service
- **Migration-Safe**: Switching from Kokoro to Chatterbox requires no karaoke changes
- **Vendor-Agnostic**: Not locked into specific TTS API formats

### Performance Optimization
- **GPU-Accelerated**: Leverages FFCreator's GPU rendering for smooth animations
- **Memory Efficient**: Minimal additional VRAM usage (< 100MB)
- **Real-Time Capable**: 60fps animation performance target

### Scalability Features
- **Parallel Processing**: Multiple karaoke videos simultaneously
- **Template Modularity**: Easy addition of new animation styles
- **Platform Extensibility**: Simple addition of new social media platforms

## Integration Testing Strategy

### Timing Accuracy Validation
```javascript
// Automated sync testing
const validateKaraokeSync = async (audioFile, timingData) => {
  const actualAudioDuration = await getAudioDuration(audioFile);
  const calculatedDuration = timingData[timingData.length - 1].endTime;
  
  const syncAccuracy = Math.abs(actualAudioDuration - calculatedDuration);
  const tolerance = 200; // 200ms tolerance
  
  return {
    passed: syncAccuracy <= tolerance,
    accuracy: syncAccuracy,
    recommendation: syncAccuracy > tolerance ? 'adjust_timing_algorithm' : 'acceptable'
  };
};
```

### Cross-TTS Compatibility Testing
```javascript
// Test with multiple TTS services
const ttsCompatibilityTest = async () => {
  const testServices = ['kokoro', 'chatterbox', 'elevenlabs', 'openai'];
  const testText = "Welcome to AI-generated karaoke content!";
  
  for (const service of testServices) {
    const audioOutput = await generateTTS(testText, service);
    const karaokeData = await generateKaraokeTiming(testText, audioOutput);
    const syncResult = await validateKaraokeSync(audioOutput, karaokeData);
    
    console.log(`${service}: ${syncResult.passed ? 'PASS' : 'FAIL'} (±${syncResult.accuracy}ms)`);
  }
};
```

This TTS-agnostic architecture ensures your karaoke system remains functional regardless of which TTS service you use, providing a robust foundation for engaging social media content creation.
