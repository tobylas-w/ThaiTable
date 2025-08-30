import { config } from '../config/env';

export interface HeliconeEvent {
  event: string;
  properties: Record<string, any>;
  userId?: string;
  timestamp?: Date;
}

export class HeliconeService {
  private static instance: HeliconeService;
  private enabled: boolean;

  private constructor() {
    this.enabled = config.helicone.enabled;
  }

  public static getInstance(): HeliconeService {
    if (!HeliconeService.instance) {
      HeliconeService.instance = new HeliconeService();
    }
    return HeliconeService.instance;
  }

  public async trackEvent(event: HeliconeEvent): Promise<void> {
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
    } catch (error) {
      console.error('[Helicone] Error tracking event:', error);
    }
  }

  public async trackOrderEvent(orderId: string, event: string, userId?: string, metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      event: `order_${event}`,
      properties: {
        orderId,
        ...metadata,
      },
      userId,
    });
  }

  public async trackMenuEvent(menuId: string, event: string, userId?: string, metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      event: `menu_${event}`,
      properties: {
        menuId,
        ...metadata,
      },
      userId,
    });
  }

  public async trackUserEvent(userId: string, event: string, metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      event: `user_${event}`,
      properties: metadata || {},
      userId,
    });
  }

  public async trackRestaurantEvent(restaurantId: string, event: string, userId?: string, metadata?: Record<string, any>): Promise<void> {
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
