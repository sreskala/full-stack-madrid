import { preloadTextures, isLowPerformanceDevice, isImageUrl } from './textureUtils';

// Verify texture paths with the actual file structure
// Use simplified paths that are guaranteed to exist
const planetTextures = {
  // Earth textures
  earth: {
    textureMap: '/textures/planets/8081_earthmap4k.jpg',
    normalMap: '/textures/planets/earth_normalmap.jpg',
    roughnessMap: '/textures/planets/8081_earthbump4k.jpg',
    cloudMap: '/textures/planets/earthcloudmap.jpg',
  },
  // Mars textures
  mars: {
    textureMap: '/textures/planets/Mars_Map.webp',
    normalMap: '/textures/planets/mars_1k_normal.jpg',
    roughnessMap: '/textures/planets/marsbump1k.jpg',
  },
  // Pluto textures
  pluto: {
    textureMap: '/textures/planets/plutomap2k.jpg',
    normalMap: '/textures/planets/mars_1k_normal.jpg',
    roughnessMap: '/textures/planets/plutobump2k.jpg',
  },
  // Default textures using simple colors for fallbacks
  default: {
    textureMap: null,  // Use default material if texture fails to load
    normalMap: null,
    roughnessMap: null,
  }
};

// Font resources
const fonts = [
  '/fonts/SpaceCrusaders-x3DP0.ttf',
];

/**
 * Class that handles preloading resources in stages
 */
class PreloadService {
  private isLoading: boolean = false;
  private loadQueue: string[] = [];
  private loadedResources: Set<string> = new Set();
  private lowPerformance: boolean;
  private failedResources: Set<string> = new Set();
  private progressCallback: ((progress: number) => void) | null = null;
  
  constructor() {
    this.lowPerformance = isLowPerformanceDevice();
    
    // Initialize load queue with critical resources
    this.initializeQueue();
  }
  
  /**
   * Initialize the loading queue based on priority and device capabilities
   */
  private initializeQueue(): void {
    const queue: string[] = [];
    
    // Critical textures first (texture maps for all planets)
    Object.values(planetTextures).forEach(planet => {
      if (planet.textureMap && isImageUrl(planet.textureMap)) 
        queue.push(planet.textureMap);
    });
    
    // Fonts
    queue.push(...fonts);
    
    // If not a low-performance device, add detail textures
    if (!this.lowPerformance) {
      // Normal maps
      Object.values(planetTextures).forEach(planet => {
        if (planet.normalMap && isImageUrl(planet.normalMap)) 
          queue.push(planet.normalMap);
      });
      
      // Roughness maps
      Object.values(planetTextures).forEach(planet => {
        if (planet.roughnessMap && isImageUrl(planet.roughnessMap)) 
          queue.push(planet.roughnessMap);
      });
      
      // Cloud maps (least priority)
      Object.values(planetTextures).forEach(planet => {
        //@ts-ignore
        if (planet.cloudMap && isImageUrl(planet.cloudMap)) 
        //@ts-ignore
          queue.push(planet.cloudMap);
      });
    }
    
    // Remove duplicates from the queue
    this.loadQueue = Array.from(new Set(queue));
    
    console.log(`Preload queue initialized with ${this.loadQueue.length} resources`);
  }
  
  /**
   * Set a callback to track loading progress
   */
  public setProgressCallback(callback: (progress: number) => void): void {
    this.progressCallback = callback;
  }
  
  /**
   * Start preloading resources in the background
   */
  public startPreloading(): void {
    if (this.isLoading || this.loadQueue.length === 0) return;
    
    this.isLoading = true;
    console.log('Started preloading resources');
    this.loadNextBatch();
  }
  
  /**
   * Load the next batch of resources
   */
  private loadNextBatch(): void {
    // Report progress
    if (this.progressCallback) {
      this.progressCallback(this.getLoadingProgress());
    }
    
    // No more resources to load
    if (this.loadQueue.length === 0) {
      this.isLoading = false;
      
      // Log results when complete
      console.log(`Preloading complete: Loaded ${this.loadedResources.size} resources, Failed: ${this.failedResources.size}`);
      
      if (this.failedResources.size > 0) {
        console.warn("Failed to preload the following resources:", Array.from(this.failedResources));
      }
      
      // Final progress update
      if (this.progressCallback) {
        this.progressCallback(100);
      }
      
      return;
    }
    
    // Determine batch size based on device capabilities
    const batchSize = this.lowPerformance ? 1 : 3;
    
    // Get next batch
    const batch = this.loadQueue.splice(0, batchSize);
    
    // Filter out only image textures (not fonts)
    const textures = batch.filter(url => isImageUrl(url));
    const nonTextures = batch.filter(url => !isImageUrl(url));
    
    // Begin loading textures
    if (textures.length > 0) {
      preloadTextures(textures, {
        anisotropy: this.lowPerformance ? 1 : 4,
        generateMipmaps: !this.lowPerformance
      })
      .then((loadedTextures) => {
        // Mark successfully loaded textures
        textures.forEach((url, index) => {
          if (loadedTextures[index]) {
            this.loadedResources.add(url);
          } else {
            this.failedResources.add(url);
          }
        });
        
        // Load next batch after a small delay to avoid blocking the main thread
        setTimeout(() => this.loadNextBatch(), 100);
      })
      .catch(error => {
        console.error('Error preloading textures:', error);
        
        // Mark all textures in this batch as failed
        textures.forEach(url => this.failedResources.add(url));
        
        // Continue with next batch even if there's an error
        setTimeout(() => this.loadNextBatch(), 100);
      });
    } else {
      // Handle non-texture resources (e.g., fonts)
      nonTextures.forEach(url => {
        // Just mark them as "loaded" without actually loading
        this.loadedResources.add(url);
      });
      
      // Move to next batch immediately
      setTimeout(() => this.loadNextBatch(), 50);
    }
  }
  
  /**
   * Check if a specific resource has been loaded
   */
  public isResourceLoaded(url: string): boolean {
    return this.loadedResources.has(url);
  }
  
  /**
   * Check if a specific resource failed to load
   */
  public didResourceFail(url: string): boolean {
    return this.failedResources.has(url);
  }
  
  /**
   * Get loading progress as a percentage
   */
  public getLoadingProgress(): number {
    const totalResources = this.loadedResources.size + this.failedResources.size + this.loadQueue.length;
    if (totalResources === 0) return 100;
    
    return Math.round(((this.loadedResources.size + this.failedResources.size) / totalResources) * 100);
  }
  
  /**
   * Get loading status
   */
  public getStatus(): {
    isLoading: boolean;
    loaded: number;
    failed: number;
    pending: number;
    progress: number;
  } {
    return {
      isLoading: this.isLoading,
      loaded: this.loadedResources.size,
      failed: this.failedResources.size,
      pending: this.loadQueue.length,
      progress: this.getLoadingProgress()
    };
  }
}

// Export singleton instance
export const preloadService = new PreloadService();

// Export texture maps for easy access
export const textureMap = planetTextures;
