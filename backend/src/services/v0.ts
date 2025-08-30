import { config } from '../config/env';

export interface V0ComponentRequest {
  prompt: string;
  variables?: Record<string, any>;
  model?: string;
}

export interface V0ComponentResponse {
  component: string;
  metadata?: Record<string, any>;
}

export interface V0GenerateRequest {
  prompt: string;
  variables?: Record<string, any>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface V0GenerateResponse {
  text: string;
  metadata?: Record<string, any>;
}

export class V0Service {
  private static instance: V0Service;
  private enabled: boolean;

  private constructor() {
    this.enabled = config.v0.enabled;
  }

  public static getInstance(): V0Service {
    if (!V0Service.instance) {
      V0Service.instance = new V0Service();
    }
    return V0Service.instance;
  }

  public async generateComponent(request: V0ComponentRequest): Promise<V0ComponentResponse> {
    if (!this.enabled) {
      throw new Error('V0 service is not enabled');
    }

    try {
      const response = await fetch(`${config.v0.baseUrl}/api/v0/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.v0.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          variables: request.variables || {},
          model: request.model || 'gpt-4',
        }),
      });

      if (!response.ok) {
        throw new Error(`V0 API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        component: data.component,
        metadata: data.metadata,
      };
    } catch (error) {
      console.error('[V0] Error generating component:', error);
      throw error;
    }
  }

  public async generateText(request: V0GenerateRequest): Promise<V0GenerateResponse> {
    if (!this.enabled) {
      throw new Error('V0 service is not enabled');
    }

    try {
      const response = await fetch(`${config.v0.baseUrl}/api/v0/generate-text`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.v0.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          variables: request.variables || {},
          model: request.model || 'gpt-4',
          temperature: request.temperature || 0.7,
          maxTokens: request.maxTokens || 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`V0 API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        text: data.text,
        metadata: data.metadata,
      };
    } catch (error) {
      console.error('[V0] Error generating text:', error);
      throw error;
    }
  }

  // ThaiTable-specific AI features
  public async generateMenuDescription(menuItem: {
    name_th: string;
    name_en: string;
    ingredients?: string[];
    spice_level?: number;
    price: number;
  }): Promise<string> {
    const prompt = `Generate an appetizing description for a Thai restaurant menu item:

Name (Thai): ${menuItem.name_th}
Name (English): ${menuItem.name_en}
Ingredients: ${menuItem.ingredients?.join(', ') || 'Traditional Thai ingredients'}
Spice Level: ${menuItem.spice_level || 'Medium'} (1-5 scale)
Price: ฿${menuItem.price}

Please write a compelling description in English that highlights the authentic Thai flavors, texture, and appeal. Keep it under 100 words.`;

    const response = await this.generateText({
      prompt,
      temperature: 0.8,
      maxTokens: 150,
    });

    return response.text;
  }

  public async generateOrderSummary(order: {
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
    customer_name?: string;
  }): Promise<string> {
    const itemsList = order.items.map(item =>
      `${item.quantity}x ${item.name} (฿${item.price})`
    ).join('\n');

    const prompt = `Generate a friendly order summary for a Thai restaurant:

Customer: ${order.customer_name || 'Guest'}
Items:
${itemsList}
Total: ฿${order.total}

Please create a warm, professional summary that thanks the customer and confirms their order. Include a note about estimated preparation time.`;

    const response = await this.generateText({
      prompt,
      temperature: 0.7,
      maxTokens: 200,
    });

    return response.text;
  }

  public async generateRestaurantRecommendations(userPreferences: {
    cuisine_preferences?: string[];
    dietary_restrictions?: string[];
    budget_range?: string;
    location?: string;
  }): Promise<string> {
    const prompt = `Generate personalized restaurant recommendations for a customer:

Preferences: ${userPreferences.cuisine_preferences?.join(', ') || 'Thai cuisine'}
Dietary Restrictions: ${userPreferences.dietary_restrictions?.join(', ') || 'None'}
Budget Range: ${userPreferences.budget_range || 'Moderate'}
Location: ${userPreferences.location || 'Bangkok'}

Please provide 3-5 restaurant recommendations with brief descriptions, highlighting why they match the customer's preferences.`;

    const response = await this.generateText({
      prompt,
      temperature: 0.8,
      maxTokens: 300,
    });

    return response.text;
  }

  public async generateCustomerFeedbackResponse(feedback: {
    rating: number;
    comment: string;
    category: 'food' | 'service' | 'ambiance' | 'general';
  }): Promise<string> {
    const prompt = `Generate a professional response to customer feedback for a Thai restaurant:

Rating: ${feedback.rating}/5
Category: ${feedback.category}
Comment: "${feedback.comment}"

Please write a thoughtful, professional response that:
1. Thanks the customer for their feedback
2. Addresses their specific concerns or praises
3. Shows commitment to improvement (if rating < 4)
4. Maintains a warm, authentic Thai hospitality tone
5. Is under 100 words`;

    const response = await this.generateText({
      prompt,
      temperature: 0.7,
      maxTokens: 150,
    });

    return response.text;
  }
}

export const v0Service = V0Service.getInstance();
