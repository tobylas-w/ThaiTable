import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  height?: number;
  margin?: number;
  color?: {
    dark: string;
    light: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export interface TableQRCodeData {
  tableId: string;
  tableNumber: string;
  restaurantId: string;
  restaurantName: string;
  menuUrl: string;
}

export interface PaymentQRCodeData {
  amount: number;
  orderId: string;
  restaurantId: string;
  promptPayId?: string;
}

export class QRCodeService {
  private static instance: QRCodeService;
  private enabled: boolean;

  private constructor() {
    this.enabled = true; // QR codes can work without external API
  }

  public static getInstance(): QRCodeService {
    if (!QRCodeService.instance) {
      QRCodeService.instance = new QRCodeService();
    }
    return QRCodeService.instance;
  }

  public async generateQRCode(
    data: string,
    options: QRCodeOptions = {}
  ): Promise<string> {
    const defaultOptions: QRCodeOptions = {
      width: 256,
      height: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      const qrCodeDataURL = await QRCode.toDataURL(data, {
        width: finalOptions.width,
        margin: finalOptions.margin,
        color: finalOptions.color,
        errorCorrectionLevel: finalOptions.errorCorrectionLevel,
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('[QR Code] Generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  public async generateTableQRCode(
    tableData: TableQRCodeData,
    options: QRCodeOptions = {}
  ): Promise<string> {
    const qrData = {
      type: 'table_qr',
      tableId: tableData.tableId,
      tableNumber: tableData.tableNumber,
      restaurantId: tableData.restaurantId,
      restaurantName: tableData.restaurantName,
      menuUrl: tableData.menuUrl,
      timestamp: new Date().toISOString(),
    };

    const dataString = JSON.stringify(qrData);
    return this.generateQRCode(dataString, options);
  }

  public async generatePaymentQRCode(
    paymentData: PaymentQRCodeData,
    options: QRCodeOptions = {}
  ): Promise<string> {
    // Generate PromptPay QR code format
    const promptPayData = this.generatePromptPayQRData(paymentData);
    return this.generateQRCode(promptPayData, options);
  }

  public async generateMenuQRCode(
    menuUrl: string,
    restaurantName: string,
    options: QRCodeOptions = {}
  ): Promise<string> {
    const qrData = {
      type: 'menu_qr',
      url: menuUrl,
      restaurantName,
      timestamp: new Date().toISOString(),
    };

    const dataString = JSON.stringify(qrData);
    return this.generateQRCode(dataString, options);
  }

  public async generateOrderQRCode(
    orderId: string,
    orderUrl: string,
    options: QRCodeOptions = {}
  ): Promise<string> {
    const qrData = {
      type: 'order_qr',
      orderId,
      url: orderUrl,
      timestamp: new Date().toISOString(),
    };

    const dataString = JSON.stringify(qrData);
    return this.generateQRCode(dataString, options);
  }

  private generatePromptPayQRData(paymentData: PaymentQRCodeData): string {
    // Generate PromptPay QR code in EMV QR Code format
    // This is a simplified version - in production you'd use a proper PromptPay library

    const amount = paymentData.amount.toFixed(2);
    const promptPayId = paymentData.promptPayId || '0812345678'; // Default PromptPay ID

    // EMV QR Code format for PromptPay
    const qrData = [
      '00020101', // Payload Format Indicator
      '0212', // Point of Initiation Method
      '2662', // Merchant Account Information
      '0016A000000677010112', // Global Unique Identifier
      '0112' + promptPayId, // PromptPay ID
      '52045999', // Merchant Category Code
      '5303364', // Transaction Currency (THB)
      '54' + amount.length.toString().padStart(2, '0') + amount, // Transaction Amount
      '5802TH', // Country Code
      '6304', // CRC
    ].join('');

    return qrData;
  }

  public async generateQRCodeSVG(
    data: string,
    options: QRCodeOptions = {}
  ): Promise<string> {
    const defaultOptions: QRCodeOptions = {
      width: 256,
      height: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      const qrCodeSVG = await QRCode.toString(data, {
        type: 'svg',
        width: finalOptions.width,
        margin: finalOptions.margin,
        color: finalOptions.color,
        errorCorrectionLevel: finalOptions.errorCorrectionLevel,
      });

      return qrCodeSVG;
    } catch (error) {
      console.error('[QR Code] SVG generation error:', error);
      throw new Error('Failed to generate QR code SVG');
    }
  }

  public async generateQRCodeBuffer(
    data: string,
    options: QRCodeOptions = {}
  ): Promise<Buffer> {
    const defaultOptions: QRCodeOptions = {
      width: 256,
      height: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      const qrCodeBuffer = await QRCode.toBuffer(data, {
        width: finalOptions.width,
        margin: finalOptions.margin,
        color: finalOptions.color,
        errorCorrectionLevel: finalOptions.errorCorrectionLevel,
      });

      return qrCodeBuffer;
    } catch (error) {
      console.error('[QR Code] Buffer generation error:', error);
      throw new Error('Failed to generate QR code buffer');
    }
  }

  public async generateTableQRCodeWithLogo(
    tableData: TableQRCodeData,
    logoBuffer: Buffer,
    options: QRCodeOptions = {}
  ): Promise<string> {
    // This would integrate with a service that can add logos to QR codes
    // For now, we'll generate a regular QR code
    return this.generateTableQRCode(tableData, options);
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // Utility method to validate QR code data
  public validateQRCodeData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      return parsed.type && parsed.timestamp;
    } catch {
      return false;
    }
  }

  // Utility method to extract QR code data
  public extractQRCodeData(data: string): any {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
}

export const qrCodeService = QRCodeService.getInstance();
