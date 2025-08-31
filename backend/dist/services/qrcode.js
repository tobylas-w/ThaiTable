import QRCode from 'qrcode';
export class QRCodeService {
    constructor() {
        this.enabled = true; // QR codes can work without external API
    }
    static getInstance() {
        if (!QRCodeService.instance) {
            QRCodeService.instance = new QRCodeService();
        }
        return QRCodeService.instance;
    }
    async generateQRCode(data, options = {}) {
        const defaultOptions = {
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
        }
        catch (error) {
            console.error('[QR Code] Generation error:', error);
            throw new Error('Failed to generate QR code');
        }
    }
    async generateTableQRCode(tableData, options = {}) {
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
    async generatePaymentQRCode(paymentData, options = {}) {
        // Generate PromptPay QR code format
        const promptPayData = this.generatePromptPayQRData(paymentData);
        return this.generateQRCode(promptPayData, options);
    }
    async generateMenuQRCode(menuUrl, restaurantName, options = {}) {
        const qrData = {
            type: 'menu_qr',
            url: menuUrl,
            restaurantName,
            timestamp: new Date().toISOString(),
        };
        const dataString = JSON.stringify(qrData);
        return this.generateQRCode(dataString, options);
    }
    async generateOrderQRCode(orderId, orderUrl, options = {}) {
        const qrData = {
            type: 'order_qr',
            orderId,
            url: orderUrl,
            timestamp: new Date().toISOString(),
        };
        const dataString = JSON.stringify(qrData);
        return this.generateQRCode(dataString, options);
    }
    generatePromptPayQRData(paymentData) {
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
    async generateQRCodeSVG(data, options = {}) {
        const defaultOptions = {
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
        }
        catch (error) {
            console.error('[QR Code] SVG generation error:', error);
            throw new Error('Failed to generate QR code SVG');
        }
    }
    async generateQRCodeBuffer(data, options = {}) {
        const defaultOptions = {
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
        }
        catch (error) {
            console.error('[QR Code] Buffer generation error:', error);
            throw new Error('Failed to generate QR code buffer');
        }
    }
    async generateTableQRCodeWithLogo(tableData, logoBuffer, options = {}) {
        // This would integrate with a service that can add logos to QR codes
        // For now, we'll generate a regular QR code
        return this.generateTableQRCode(tableData, options);
    }
    isEnabled() {
        return this.enabled;
    }
    // Utility method to validate QR code data
    validateQRCodeData(data) {
        try {
            const parsed = JSON.parse(data);
            return parsed.type && parsed.timestamp;
        }
        catch {
            return false;
        }
    }
    // Utility method to extract QR code data
    extractQRCodeData(data) {
        try {
            return JSON.parse(data);
        }
        catch {
            return null;
        }
    }
}
export const qrCodeService = QRCodeService.getInstance();
