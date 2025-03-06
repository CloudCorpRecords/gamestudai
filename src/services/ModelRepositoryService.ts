import axios from 'axios';

export interface RepositoryModel {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  modelUrl: string;
  format: string;
  category: string;
  tags: string[];
  author: string;
  dateCreated: string;
  dateModified: string;
  license: string;
  fileSize: number;
  polyCount?: number;
  isAnimated: boolean;
  isRigged: boolean;
}

export interface ModelCategory {
  id: string;
  name: string;
  description: string;
  count: number;
}

export interface ModelSearchParams {
  query?: string;
  category?: string;
  tags?: string[];
  author?: string;
  isAnimated?: boolean;
  isRigged?: boolean;
  sortBy?: 'name' | 'dateCreated' | 'dateModified' | 'fileSize' | 'polyCount';
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface ModelSearchResult {
  models: RepositoryModel[];
  total: number;
}

export class ModelRepositoryService {
  private static instance: ModelRepositoryService;
  private apiUrl: string;
  private categories: ModelCategory[] = [];
  private models: Map<string, RepositoryModel> = new Map();
  
  constructor(apiUrl = '/api/models') {
    this.apiUrl = apiUrl;
    
    // Pre-populate with some example categories
    this.categories = [
      { id: 'characters', name: 'Characters', description: 'Humanoid and creature models', count: 42 },
      { id: 'environments', name: 'Environments', description: 'Landscapes, buildings and scenes', count: 29 },
      { id: 'props', name: 'Props', description: 'Objects and items', count: 78 },
      { id: 'vehicles', name: 'Vehicles', description: 'Cars, ships and other transportation', count: 15 },
      { id: 'weapons', name: 'Weapons', description: 'Weapons and combat items', count: 22 }
    ];
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): ModelRepositoryService {
    if (!ModelRepositoryService.instance) {
      ModelRepositoryService.instance = new ModelRepositoryService();
    }
    return ModelRepositoryService.instance;
  }

  /**
   * Get a list of all model categories
   */
  async getCategories(): Promise<ModelCategory[]> {
    try {
      // In a real implementation, this would fetch from the API
      // const response = await axios.get(`${this.apiUrl}/categories`);
      // return response.data.categories;
      
      // Return mock data for now
      return this.categories;
    } catch (error) {
      console.error('Error fetching model categories:', error);
      return this.categories; // Fallback to mock data on error
    }
  }

  /**
   * Search for models with filters
   */
  async searchModels(params: ModelSearchParams = {}): Promise<ModelSearchResult> {
    try {
      // In a real implementation, this would fetch from the API
      // const response = await axios.get(`${this.apiUrl}/search`, { params });
      // return response.data;
      
      // Generate mock data for development
      const mockModels: RepositoryModel[] = [];
      
      // Number of models to generate (respecting limit)
      const count = params.limit || 20;
      
      for (let i = 0; i < count; i++) {
        const category = params.category || this.getRandomCategory();
        const id = `model-${category}-${i}`;
        
        mockModels.push({
          id,
          name: `${this.capitalizeFirstLetter(category)} Model ${i + 1}`,
          description: `A sample ${category} model for testing purposes.`,
          thumbnailUrl: `/mock-assets/thumbnails/${category}${i % 5 + 1}.jpg`,
          modelUrl: `/mock-assets/models/${category}${i % 3 + 1}.glb`,
          format: 'glb',
          category,
          tags: this.getRandomTags(category),
          author: this.getRandomAuthor(),
          dateCreated: this.getRandomDate(2021, 2022),
          dateModified: this.getRandomDate(2022, 2023),
          license: 'CC-BY-4.0',
          fileSize: Math.floor(Math.random() * 50000) + 1000,
          polyCount: Math.floor(Math.random() * 20000) + 1000,
          isAnimated: Math.random() > 0.5,
          isRigged: Math.random() > 0.3
        });
        
        // Cache the model
        this.models.set(id, mockModels[i]);
      }
      
      return {
        models: mockModels,
        total: 100 // Mock total count
      };
    } catch (error) {
      console.error('Error searching models:', error);
      // Return empty result on error
      return { models: [], total: 0 };
    }
  }

  /**
   * Get a specific model by ID
   */
  async getModelById(id: string): Promise<RepositoryModel | null> {
    // Check cache first
    if (this.models.has(id)) {
      return this.models.get(id)!;
    }
    
    try {
      // In a real implementation, this would fetch from the API
      // const response = await axios.get(`${this.apiUrl}/${id}`);
      // return response.data;
      
      // Generate a mock model if not in cache
      const category = this.getRandomCategory();
      
      const model: RepositoryModel = {
        id,
        name: `${this.capitalizeFirstLetter(category)} Model`,
        description: `A sample ${category} model for testing purposes.`,
        thumbnailUrl: `/mock-assets/thumbnails/${category}${Math.floor(Math.random() * 5) + 1}.jpg`,
        modelUrl: `/mock-assets/models/${category}${Math.floor(Math.random() * 3) + 1}.glb`,
        format: 'glb',
        category,
        tags: this.getRandomTags(category),
        author: this.getRandomAuthor(),
        dateCreated: this.getRandomDate(2021, 2022),
        dateModified: this.getRandomDate(2022, 2023),
        license: 'CC-BY-4.0',
        fileSize: Math.floor(Math.random() * 50000) + 1000,
        polyCount: Math.floor(Math.random() * 20000) + 1000,
        isAnimated: Math.random() > 0.5,
        isRigged: Math.random() > 0.3
      };
      
      // Cache the model
      this.models.set(id, model);
      
      return model;
    } catch (error) {
      console.error(`Error fetching model with ID ${id}:`, error);
      return null;
    }
  }

  // Helper methods for generating mock data
  private getRandomCategory(): string {
    const categories = this.categories.map(c => c.id);
    return categories[Math.floor(Math.random() * categories.length)];
  }
  
  private getRandomTags(category: string): string[] {
    const tagsByCategory: Record<string, string[]> = {
      'characters': ['fantasy', 'sci-fi', 'human', 'monster', 'npc', 'player', 'animated'],
      'environments': ['forest', 'city', 'dungeon', 'space', 'indoor', 'outdoor', 'medieval', 'modern'],
      'props': ['furniture', 'container', 'decoration', 'interactive', 'collectible'],
      'vehicles': ['car', 'spaceship', 'boat', 'flying', 'ground', 'military', 'civilian'],
      'weapons': ['sword', 'gun', 'magic', 'melee', 'ranged', 'explosive', 'legendary']
    };
    
    const possibleTags = tagsByCategory[category] || ['game', 'asset', '3d', 'model'];
    const numTags = Math.floor(Math.random() * 4) + 1;
    const selectedTags: string[] = [];
    
    for (let i = 0; i < numTags; i++) {
      const tag = possibleTags[Math.floor(Math.random() * possibleTags.length)];
      if (!selectedTags.includes(tag)) {
        selectedTags.push(tag);
      }
    }
    
    return selectedTags;
  }
  
  private getRandomAuthor(): string {
    const authors = [
      'GameStudio AI', 
      'ModelMaster', 
      'ArtificialArtist', 
      'VirtualSculptor', 
      '3DCreator'
    ];
    return authors[Math.floor(Math.random() * authors.length)];
  }
  
  private getRandomDate(startYear: number, endYear: number): string {
    const start = new Date(startYear, 0, 1).getTime();
    const end = new Date(endYear, 11, 31).getTime();
    const date = new Date(start + Math.random() * (end - start));
    return date.toISOString();
  }
  
  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
} 