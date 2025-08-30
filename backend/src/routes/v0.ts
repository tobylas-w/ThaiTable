import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';
import { v0Service } from '../services/v0';

const router = Router();

// Validation schemas
const generateTextSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  variables: z.record(z.any()).optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
});

const generateComponentSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  variables: z.record(z.any()).optional(),
  model: z.string().optional(),
});

const menuDescriptionSchema = z.object({
  name_th: z.string().min(1, 'Thai name is required'),
  name_en: z.string().min(1, 'English name is required'),
  ingredients: z.array(z.string()).optional(),
  spice_level: z.number().min(1).max(5).optional(),
  price: z.number().positive('Price must be positive'),
});

const orderSummarySchema = z.object({
  items: z.array(z.object({
    name: z.string().min(1),
    quantity: z.number().positive(),
    price: z.number().positive(),
  })),
  total: z.number().positive(),
  customer_name: z.string().optional(),
});

const feedbackResponseSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1),
  category: z.enum(['food', 'service', 'ambiance', 'general']),
});

// Generate text endpoint
router.post('/generate-text', authenticateToken, async (req, res) => {
  try {
    const validatedData = generateTextSchema.parse(req.body);

    const result = await v0Service.generateText(validatedData);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    console.error('[V0] Generate text error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate text',
    });
  }
});

// Generate component endpoint
router.post('/generate-component', authenticateToken, async (req, res) => {
  try {
    const validatedData = generateComponentSchema.parse(req.body);

    const result = await v0Service.generateComponent(validatedData);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    console.error('[V0] Generate component error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate component',
    });
  }
});

// ThaiTable-specific AI endpoints

// Generate menu description
router.post('/menu-description', authenticateToken, async (req, res) => {
  try {
    const validatedData = menuDescriptionSchema.parse(req.body);

    const description = await v0Service.generateMenuDescription(validatedData);

    res.json({
      success: true,
      data: {
        description,
        menuItem: validatedData,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    console.error('[V0] Menu description error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate menu description',
    });
  }
});

// Generate order summary
router.post('/order-summary', authenticateToken, async (req, res) => {
  try {
    const validatedData = orderSummarySchema.parse(req.body);

    const summary = await v0Service.generateOrderSummary(validatedData);

    res.json({
      success: true,
      data: {
        summary,
        order: validatedData,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    console.error('[V0] Order summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate order summary',
    });
  }
});

// Generate restaurant recommendations
router.post('/recommendations', authenticateToken, async (req, res) => {
  try {
    const { cuisine_preferences, dietary_restrictions, budget_range, location } = req.body;

    const recommendations = await v0Service.generateRestaurantRecommendations({
      cuisine_preferences,
      dietary_restrictions,
      budget_range,
      location,
    });

    res.json({
      success: true,
      data: {
        recommendations,
        preferences: {
          cuisine_preferences,
          dietary_restrictions,
          budget_range,
          location,
        },
      },
    });
  } catch (error) {
    console.error('[V0] Recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations',
    });
  }
});

// Generate customer feedback response
router.post('/feedback-response', authenticateToken, async (req, res) => {
  try {
    const validatedData = feedbackResponseSchema.parse(req.body);

    const response = await v0Service.generateCustomerFeedbackResponse(validatedData);

    res.json({
      success: true,
      data: {
        response,
        feedback: validatedData,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    console.error('[V0] Feedback response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate feedback response',
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'V0 AI service is running',
    timestamp: new Date().toISOString(),
    enabled: v0Service['enabled'],
  });
});

export default router;
