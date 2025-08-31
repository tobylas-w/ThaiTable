import { z } from 'zod';
import { env } from './env';
// Integration environment schema
export const integrationSchema = z.object({
    // AWS S3 Configuration
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().default('ap-southeast-1'),
    AWS_S3_BUCKET: z.string().optional(),
    // Email Service (SendGrid)
    SENDGRID_API_KEY: z.string().optional(),
    SENDGRID_FROM_EMAIL: z.string().email().optional(),
    // SMS Service (Thai SMS Gateway)
    THAI_SMS_API_KEY: z.string().optional(),
    THAI_SMS_SENDER: z.string().optional(),
    // LINE Notify
    LINE_NOTIFY_TOKEN: z.string().optional(),
    // Food Delivery Platforms
    GRABFOOD_API_KEY: z.string().optional(),
    GRABFOOD_MERCHANT_ID: z.string().optional(),
    FOODPANDA_API_KEY: z.string().optional(),
    FOODPANDA_STORE_ID: z.string().optional(),
    LINEMAN_API_KEY: z.string().optional(),
    LINEMAN_CHANNEL_ID: z.string().optional(),
    // Analytics & Monitoring
    GOOGLE_ANALYTICS_ID: z.string().optional(),
    SENTRY_DSN: z.string().optional(),
    LOGROCKET_APP_ID: z.string().optional(),
    // Maps & Location
    GOOGLE_MAPS_API_KEY: z.string().optional(),
    LINE_MAPS_API_KEY: z.string().optional(),
    // Thai Government APIs
    THAI_TAX_API_KEY: z.string().optional(),
    THAI_BUSINESS_API_KEY: z.string().optional(),
    // QR Code Generation
    QR_CODE_API_KEY: z.string().optional(),
    // Redis (Caching)
    REDIS_URL: z.string().optional(),
});
export const integrationConfig = {
    // AWS S3 Configuration
    aws: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        region: env.AWS_REGION || 'ap-southeast-1',
        s3Bucket: env.AWS_S3_BUCKET,
        enabled: !!(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.AWS_S3_BUCKET),
    },
    // Email Service
    email: {
        sendgrid: {
            apiKey: env.SENDGRID_API_KEY,
            fromEmail: env.SENDGRID_FROM_EMAIL || 'noreply@thaitable.com',
            enabled: !!env.SENDGRID_API_KEY,
        },
    },
    // SMS Service
    sms: {
        thaiSms: {
            apiKey: env.THAI_SMS_API_KEY,
            sender: env.THAI_SMS_SENDER || 'ThaiTable',
            enabled: !!env.THAI_SMS_API_KEY,
        },
    },
    // LINE Notify
    lineNotify: {
        token: env.LINE_NOTIFY_TOKEN,
        enabled: !!env.LINE_NOTIFY_TOKEN,
    },
    // Food Delivery Platforms
    delivery: {
        grabFood: {
            apiKey: env.GRABFOOD_API_KEY,
            merchantId: env.GRABFOOD_MERCHANT_ID,
            enabled: !!(env.GRABFOOD_API_KEY && env.GRABFOOD_MERCHANT_ID),
        },
        foodPanda: {
            apiKey: env.FOODPANDA_API_KEY,
            storeId: env.FOODPANDA_STORE_ID,
            enabled: !!(env.FOODPANDA_API_KEY && env.FOODPANDA_STORE_ID),
        },
        lineMan: {
            apiKey: env.LINEMAN_API_KEY,
            channelId: env.LINEMAN_CHANNEL_ID,
            enabled: !!(env.LINEMAN_API_KEY && env.LINEMAN_CHANNEL_ID),
        },
    },
    // Analytics & Monitoring
    analytics: {
        googleAnalytics: {
            id: env.GOOGLE_ANALYTICS_ID,
            enabled: !!env.GOOGLE_ANALYTICS_ID,
        },
        sentry: {
            dsn: env.SENTRY_DSN,
            enabled: !!env.SENTRY_DSN,
        },
        logRocket: {
            appId: env.LOGROCKET_APP_ID,
            enabled: !!env.LOGROCKET_APP_ID,
        },
    },
    // Maps & Location
    maps: {
        googleMaps: {
            apiKey: env.GOOGLE_MAPS_API_KEY,
            enabled: !!env.GOOGLE_MAPS_API_KEY,
        },
        lineMaps: {
            apiKey: env.LINE_MAPS_API_KEY,
            enabled: !!env.LINE_MAPS_API_KEY,
        },
    },
    // Thai Government APIs
    thaiGovernment: {
        taxApi: {
            apiKey: env.THAI_TAX_API_KEY,
            enabled: !!env.THAI_TAX_API_KEY,
        },
        businessApi: {
            apiKey: env.THAI_BUSINESS_API_KEY,
            enabled: !!env.THAI_BUSINESS_API_KEY,
        },
    },
    // QR Code Generation
    qrCode: {
        apiKey: env.QR_CODE_API_KEY,
        enabled: !!env.QR_CODE_API_KEY,
    },
    // Redis Configuration
    redis: {
        url: env.REDIS_URL || 'redis://localhost:6379',
        enabled: !!env.REDIS_URL,
    },
};
// Helper functions for checking integration status
export const isIntegrationEnabled = (integration) => {
    const config = integrationConfig[integration];
    if (typeof config === 'object' && 'enabled' in config) {
        return config.enabled;
    }
    return false;
};
export const getIntegrationConfig = (integration) => {
    return integrationConfig[integration];
};
