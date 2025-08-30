import sgMail from '@sendgrid/mail';
import { integrationConfig } from '../config/integrations';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
}

export interface OrderConfirmationEmail {
  customerName: string;
  orderNumber: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  restaurantName: string;
  estimatedTime: string;
}

export interface WelcomeEmail {
  customerName: string;
  restaurantName: string;
  loginUrl: string;
}

export class EmailService {
  private static instance: EmailService;
  private enabled: boolean;

  private constructor() {
    this.enabled = integrationConfig.email.sendgrid.enabled;

    if (this.enabled) {
      sgMail.setApiKey(integrationConfig.email.sendgrid.apiKey!);
    }
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.enabled) {
      console.warn('[Email] Service not enabled, skipping email send');
      return false;
    }

    const msg = {
      to: options.to,
      from: options.from || integrationConfig.email.sendgrid.fromEmail,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    };

    try {
      await sgMail.send(msg);
      console.log(`[Email] Sent successfully to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
      return true;
    } catch (error) {
      console.error('[Email] Send error:', error);
      return false;
    }
  }

  public async sendOrderConfirmation(
    email: string,
    orderData: OrderConfirmationEmail
  ): Promise<boolean> {
    const itemsList = orderData.orderItems
      .map(item => `${item.quantity}x ${item.name} - ฿${item.price}`)
      .join('\n');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #e74c3c; margin: 0;">🍜 ${orderData.restaurantName}</h1>
        </div>

        <div style="padding: 20px;">
          <h2 style="color: #2c3e50;">Order Confirmation</h2>
          <p>Dear ${orderData.customerName},</p>
          <p>Thank you for your order! Here are your order details:</p>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Order #${orderData.orderNumber}</h3>
            <div style="margin: 15px 0;">
              ${orderData.orderItems.map(item =>
      `<div style="display: flex; justify-content: space-between; margin: 5px 0;">
                  <span>${item.quantity}x ${item.name}</span>
                  <span>฿${item.price}</span>
                </div>`
    ).join('')}
            </div>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 10px 0;">
            <div style="display: flex; justify-content: space-between; font-weight: bold;">
              <span>Total:</span>
              <span>฿${orderData.total}</span>
            </div>
          </div>

          <p><strong>Estimated preparation time:</strong> ${orderData.estimatedTime}</p>

          <p>We'll notify you when your order is ready. Thank you for choosing ${orderData.restaurantName}!</p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #7f8c8d;">
            <p>If you have any questions, please contact us.</p>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `Order Confirmation #${orderData.orderNumber} - ${orderData.restaurantName}`,
      html,
    });
  }

  public async sendWelcomeEmail(
    email: string,
    welcomeData: WelcomeEmail
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #e74c3c; margin: 0;">🍜 ${welcomeData.restaurantName}</h1>
        </div>

        <div style="padding: 20px;">
          <h2 style="color: #2c3e50;">Welcome to ThaiTable!</h2>
          <p>Dear ${welcomeData.customerName},</p>
          <p>Welcome to ${welcomeData.restaurantName}! We're excited to have you as part of our restaurant management system.</p>

          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Getting Started</h3>
            <p>You can now:</p>
            <ul>
              <li>Manage your menu items</li>
              <li>Track orders in real-time</li>
              <li>View sales analytics</li>
              <li>Manage your restaurant settings</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${welcomeData.loginUrl}"
               style="background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Access Your Dashboard
            </a>
          </div>

          <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #7f8c8d;">
            <p>Thank you for choosing ThaiTable!</p>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `Welcome to ${welcomeData.restaurantName} - ThaiTable`,
      html,
    });
  }

  public async sendPasswordReset(
    email: string,
    resetToken: string,
    restaurantName: string
  ): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #e74c3c; margin: 0;">🍜 ${restaurantName}</h1>
        </div>

        <div style="padding: 20px;">
          <h2 style="color: #2c3e50;">Password Reset Request</h2>
          <p>You requested a password reset for your ${restaurantName} account.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>

          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>This link will expire in 1 hour for security reasons.</p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #7f8c8d;">
            <p>For security, never share this email with anyone.</p>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `Password Reset - ${restaurantName}`,
      html,
    });
  }

  public async sendDailyReport(
    email: string,
    reportData: {
      restaurantName: string;
      date: string;
      totalOrders: number;
      totalRevenue: number;
      topItems: Array<{ name: string; quantity: number; revenue: number }>;
    }
  ): Promise<boolean> {
    const topItemsHtml = reportData.topItems
      .map(item => `
        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
          <span>${item.name}</span>
          <span>${item.quantity} orders - ฿${item.revenue}</span>
        </div>
      `)
      .join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #e74c3c; margin: 0;">🍜 ${reportData.restaurantName}</h1>
          <h2 style="color: #2c3e50; margin: 10px 0;">Daily Report - ${reportData.date}</h2>
        </div>

        <div style="padding: 20px;">
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Summary</h3>
            <div style="display: flex; justify-content: space-between; margin: 10px 0;">
              <span>Total Orders:</span>
              <span><strong>${reportData.totalOrders}</strong></span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 10px 0;">
              <span>Total Revenue:</span>
              <span><strong>฿${reportData.totalRevenue}</strong></span>
            </div>
          </div>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Top Selling Items</h3>
            ${topItemsHtml}
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #7f8c8d;">
            <p>This report was generated automatically by ThaiTable.</p>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `Daily Report - ${reportData.date} - ${reportData.restaurantName}`,
      html,
    });
  }

  public isEnabled(): boolean {
    return this.enabled;
  }
}

export const emailService = EmailService.getInstance();
