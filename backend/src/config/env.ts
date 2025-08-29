import dotenv from 'dotenv';

// Load .env file into process.env
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

export const env = {
    PORT: process.env.PORT || '3000',
    DATABASE_URL: process.env.DATABASE_URL || '',
    JWT_SECRET: process.env.JWT_SECRET || 'changeme',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
};
