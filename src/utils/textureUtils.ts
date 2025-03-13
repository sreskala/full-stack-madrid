import { Texture, TextureLoader, Cache, RepeatWrapping } from 'three';

// Singleton texture loader instance
const textureLoader = new TextureLoader();

// Enable three.js cache
Cache.enabled = true;

// Texture cache to avoid reloading textures
const textureCache: Record<string, Texture> = {};

// Interface for texture loading options
interface TextureOptions {
  anisotropy?: number;
  repeat?: [number, number];
  flipY?: boolean;
  encoding?: number;
  generateMipmaps?: boolean;
}

/**
 * Load a texture with optimized settings and caching
 */
export const loadTexture = (url: string, options: TextureOptions = {}): Promise<Texture> => {
  // Return from cache if available
  if (textureCache[url]) {
    return Promise.resolve(textureCache[url]);
  }

  // Set default options
  const {
    anisotropy = 1,
    repeat = [1, 1],
    flipY = true,
    encoding = 3001, // sRGB encoding
    generateMipmaps = true,
  } = options;

  return new Promise((resolve, reject) => {
    textureLoader.load(
      url,
      (texture) => {
        // Apply settings
        texture.anisotropy = anisotropy;
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(repeat[0], repeat[1]);
        texture.flipY = flipY;
        texture.encoding = encoding;
        texture.generateMipmaps = generateMipmaps;
        
        // Cache the texture
        textureCache[url] = texture;
        
        resolve(texture);
      },
      undefined, // onProgress not used
      (error) => {
        console.error(`Error loading texture ${url}:`, error);
        reject(error);
      }
    );
  });
};

/**
 * Preload a set of textures
 */
export const preloadTextures = (urls: string[], options: TextureOptions = {}): Promise<Texture[]> => {
  return Promise.all(urls.map(url => loadTexture(url, options)));
};

/**
 * Release texture from cache
 */
export const releaseTexture = (url: string): void => {
  if (textureCache[url]) {
    textureCache[url].dispose();
    delete textureCache[url];
  }
};

/**
 * Clear all textures from cache
 */
export const clearTextureCache = (): void => {
  Object.keys(textureCache).forEach(key => {
    textureCache[key].dispose();
  });
  Object.keys(textureCache).length = 0;
};

/**
 * Create a downsampled texture for lower quality rendering
 */
export const createLowQualityTexture = (texture: Texture): Texture => {
  const lowQualityTexture = texture.clone();
  lowQualityTexture.generateMipmaps = false;
  lowQualityTexture.minFilter = 1006; // LinearFilter
  lowQualityTexture.magFilter = 1006; // LinearFilter
  lowQualityTexture.anisotropy = 1;
  return lowQualityTexture;
};

/**
 * Check if current device is likely to have performance issues
 */
export const isLowPerformanceDevice = (): boolean => {
  // Check for mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Check for small screens
  const isSmallScreen = window.innerWidth < 768 || window.innerHeight < 768;
  
  // Check for slow hardware (if deviceMemory or hardwareConcurrency are available)
  const hasLowMemory = 'deviceMemory' in navigator && (navigator as any).deviceMemory < 4;
  const hasFewCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
  
  return isMobile || isSmallScreen || hasLowMemory || hasFewCores;
};

/**
 * Get optimized texture settings based on device capabilities
 */
export const getOptimalTextureSettings = (): TextureOptions => {
  const isLowPerf = isLowPerformanceDevice();
  
  return {
    anisotropy: isLowPerf ? 1 : 4,
    generateMipmaps: !isLowPerf,
    encoding: 3001, // sRGB encoding
  };
};

/**
 * Get planet textures with appropriate quality settings
 */
export const getPlanetTextures = (
  textureMap: string,
  normalMap: string,
  roughnessMap: string,
  lowQuality: boolean
): Record<string, string | null> => {
  // For low quality, only return the texture map
  if (lowQuality) {
    return {
      map: textureMap,
      normalMap: null,
      roughnessMap: null
    };
  }
  
  // Return full quality textures
  return {
    map: textureMap,
    normalMap: normalMap,
    roughnessMap: roughnessMap
  };
};
