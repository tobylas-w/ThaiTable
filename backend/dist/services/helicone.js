import { config } from '../config/env';
export class HeliconeService {
    constructor() {
        this.enabled = config.helicone.enabled;
    }
    static getInstance() {
        if (!HeliconeService.instance) {
            HeliconeService.instance = new HeliconeService();
        }
        return HeliconeService.instance;
    }
    async trackEvent(event) {
        if (!this.enabled) {
            return;
        }
        try {
            const response = await fetch(`${config.helicone.baseUrl}/v1/events`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.helicone.apiKey}`,
                    'Content-Type': 'application/json',
                    'Helicone-Cache-Enabled': config.helicone.cacheEnabled.toString(),
                    'Helicone-Retry-Enabled': config.helicone.retryEnabled.toString(),
                },
                body: JSON.stringify({
                    event: event.event,
                    properties: {
                        ...event.properties,
                        timestamp: event.timestamp?.toISOString() || new Date().toISOString(),
                        environment: config.NODE_ENV,
                        api_version: config.API_VERSION,
                    },
                    userId: event.userId,
                }),
            });
            if (!response.ok) {
                console.warn(`[Helicone] Failed to track event: ${response.statusText}`);
            }
        }
        catch (error) {
            console.error('[Helicone] Error tracking event:', error);
        }
    }
    async trackOrderEvent(orderId, event, userId, metadata) {
        await this.trackEvent({
            event: `order_${event}`,
            properties: {
                orderId,
                ...metadata,
            },
            userId,
        });
    }
    async trackMenuEvent(menuId, event, userId, metadata) {
        await this.trackEvent({
            event: `menu_${event}`,
            properties: {
                menuId,
                ...metadata,
            },
            userId,
        });
    }
    async trackUserEvent(userId, event, metadata) {
        await this.trackEvent({
            event: `user_${event}`,
            properties: metadata || {},
            userId,
        });
    }
    async trackRestaurantEvent(restaurantId, event, userId, metadata) {
        await this.trackEvent({
            event: `restaurant_${event}`,
            properties: {
                restaurantId,
                ...metadata,
            },
            userId,
        });
    }
}
export const heliconeService = HeliconeService.getInstance();
