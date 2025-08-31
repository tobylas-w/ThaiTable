import { config } from '../config/env';
export class V0Service {
    constructor() {
        this.enabled = config.v0.enabled;
    }
    static getInstance() {
        if (!V0Service.instance) {
            V0Service.instance = new V0Service();
        }
        return V0Service.instance;
    }
    async generateComponent(request) {
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
        }
        catch (error) {
            console.error('[V0] Error generating component:', error);
            throw error;
        }
    }
    async generateText(request) {
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
        }
        catch (error) {
            console.error('[V0] Error generating text:', error);
            throw error;
        }
    }
    // ThaiTable-specific AI features
    async generateMenuDescription(menuItem) {
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
    async generateOrderSummary(order) {
        const itemsList = order.items.map(item => `${item.quantity}x ${item.name} (฿${item.price})`).join('\n');
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
    async generateRestaurantRecommendations(userPreferences) {
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
    async generateCustomerFeedbackResponse(feedback) {
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
