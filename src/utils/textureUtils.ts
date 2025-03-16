import { Texture, TextureLoader, Cache, RepeatWrapping, SRGBColorSpace, LinearFilter } from 'three';

// Singleton texture loader instance
const textureLoader = new TextureLoader();

// Enable three.js cache
Cache.enabled = true;

// Texture cache to avoid reloading textures
const textureCache: Record<string, Texture> = {};

// Track failed textures to avoid retrying them
const failedTextures = new Set<string>();

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
export const loadTexture = (url: string, options: TextureOptions = {}): Promise<Texture | null> => {
  // Check if this texture has failed before
  if (failedTextures.has(url)) {
    console.warn(`Skipping previously failed texture: ${url}`);
    return Promise.resolve(null);
  }

  // Return from cache if available
  if (textureCache[url]) {
    return Promise.resolve(textureCache[url]);
  }

  // Set default options
  const {
    anisotropy = 1,
    repeat = [1, 1],
    flipY = true,
    encoding = SRGBColorSpace,
    generateMipmaps = true,
  } = options;

  return new Promise((resolve, reject) => {
    // Add a timeout to catch hanging texture loads
    const timeoutId = setTimeout(() => {
      console.warn(`Texture load timeout for ${url}`);
      failedTextures.add(url);
      resolve(null);
    }, 10000); // 10 seconds timeout

    textureLoader.load(
      url,
      (texture) => {
        clearTimeout(timeoutId);
        
        // Apply settings
        texture.anisotropy = anisotropy;
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(repeat[0], repeat[1]);
        texture.flipY = flipY;
        texture.colorSpace = encoding;
        texture.generateMipmaps = generateMipmaps;
        texture.minFilter = generateMipmaps ? texture.minFilter : LinearFilter;
        
        // Cache the texture
        textureCache[url] = texture;
        
        resolve(texture);
      },
      undefined, // onProgress not used
      (error) => {
        clearTimeout(timeoutId);
        console.error(`Error loading texture ${url}:`, error);
        failedTextures.add(url);
        resolve(null); // Resolve with null instead of rejecting to avoid crashes
      }
    );
  });
};

/**
 * Preload a set of textures, with more error tolerance
 */
export const preloadTextures = (urls: string[], options: TextureOptions = {}): Promise<(Texture | null)[]> => {
  // Map each URL to a texture loading promise that won't reject
  const loadPromises = urls.map(url => {
    return loadTexture(url, options).catch(() => null);
  });
  
  return Promise.all(loadPromises);
};

/**
 * Release texture from cache
 */
export const releaseTexture = (url: string): void => {
  if (textureCache[url]) {
    textureCache[url].dispose();
    delete textureCache[url];
  }
  failedTextures.delete(url);
};

/**
 * Clear all textures from cache
 */
export const clearTextureCache = (): void => {
  Object.keys(textureCache).forEach(key => {
    textureCache[key].dispose();
  });
  Object.keys(textureCache).length = 0;
  failedTextures.clear();
};

/**
 * Create a downsampled texture for lower quality rendering
 */
export const createLowQualityTexture = (texture: Texture): Texture => {
  const lowQualityTexture = texture.clone();
  lowQualityTexture.generateMipmaps = false;
  lowQualityTexture.minFilter = LinearFilter;
  lowQualityTexture.magFilter = LinearFilter;
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
    encoding: SRGBColorSpace,
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

/**
 * Check if a URL is a valid image path
 */
export const isImageUrl = (url: string): boolean => {
  if (!url) return false;
  return /\.(jpe?g|png|gif|webp|bmp)$/i.test(url);
};
