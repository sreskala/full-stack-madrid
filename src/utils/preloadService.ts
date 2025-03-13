import { preloadTextures, isLowPerformanceDevice } from './textureUtils';

// Map of all textures in the scene
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
      queue.push(planet.textureMap);
    });
    
    // Fonts
    queue.push(...fonts);
    
    // If not a low-performance device, add detail textures
    if (!this.lowPerformance) {
      // Normal maps
      Object.values(planetTextures).forEach(planet => {
        if (planet.normalMap) queue.push(planet.normalMap);
      });
      
      // Roughness maps
      Object.values(planetTextures).forEach(planet => {
        if (planet.roughnessMap) queue.push(planet.roughnessMap);
      });
      
      // Cloud maps (least priority)
      Object.values(planetTextures).forEach(planet => {
        if (planet.cloudMap) queue.push(planet.cloudMap);
      });
    }
    
    this.loadQueue = queue;
  }
  
  /**
   * Start preloading resources in the background
   */
  public startPreloading(): void {
    if (this.isLoading || this.loadQueue.length === 0) return;
    
    this.isLoading = true;
    this.loadNextBatch();
  }
  
  /**
   * Load the next batch of resources
   */
  private loadNextBatch(): void {
    // No more resources to load
    if (this.loadQueue.length === 0) {
      this.isLoading = false;
      return;
    }
    
    // Determine batch size based on device capabilities
    const batchSize = this.lowPerformance ? 1 : 3;
    
    // Get next batch
    const batch = this.loadQueue.splice(0, batchSize);
    
    // Filter out only image textures (not fonts)
    const textures = batch.filter(url => 
      url.endsWith('.jpg') || 
      url.endsWith('.png') || 
      url.endsWith('.webp')
    );
    
    // Begin loading textures
    if (textures.length > 0) {
      preloadTextures(textures, {
        anisotropy: this.lowPerformance ? 1 : 4,
        generateMipmaps: !this.lowPerformance
      })
      .then(() => {
        // Mark as loaded
        textures.forEach(url => this.loadedResources.add(url));
        
        // Load next batch after a small delay to avoid blocking the main thread
        setTimeout(() => this.loadNextBatch(), 100);
      })
      .catch(error => {
        console.error('Error preloading textures:', error);
        // Continue with next batch even if there's an error
        setTimeout(() => this.loadNextBatch(), 100);
      });
    } else {
      // If no textures in this batch, move to next batch
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
   * Get loading progress as a percentage
   */
  public getLoadingProgress(): number {
    const totalResources = this.loadedResources.size + this.loadQueue.length;
    if (totalResources === 0) return 100;
    
    return Math.round((this.loadedResources.size / totalResources) * 100);
  }
}

// Export singleton instance
export const preloadService = new PreloadService();

// Export texture maps for easy access
export const textureMap = planetTextures;
