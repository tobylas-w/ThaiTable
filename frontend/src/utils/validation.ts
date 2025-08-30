import { z } from 'zod'

// Thai-specific validation patterns
const THAI_PHONE_REGEX = /^(\+66|66|0)[0-9]{8,9}$/
const THAI_TAX_ID_REGEX = /^[0-9]{13}$/
const THAI_POSTAL_CODE_REGEX = /^[1-9][0-9]{4}$/
const THAI_CURRENCY_REGEX = /^[0-9,]+(\.[0-9]{2})?$/

// Enhanced validation schemas for Thai market
export const thaiValidationSchemas = {
  // Phone number validation (Thai format)
  phone: z
    .string()
    .min(1, 'กรุณากรอกหมายเลขโทรศัพท์')
    .regex(THAI_PHONE_REGEX, 'หมายเลขโทรศัพท์ไม่ถูกต้อง (ตัวอย่าง: 0812345678, +66812345678)')
    .transform((val) => {
      // Normalize phone number to +66 format
      if (val.startsWith('0')) {
        return '+66' + val.slice(1)
      }
      if (val.startsWith('66')) {
        return '+' + val
      }
      return val
    }),

  // Thai Tax ID validation
  taxId: z
    .string()
    .min(1, 'กรุณากรอกเลขประจำตัวผู้เสียภาษี')
    .regex(THAI_TAX_ID_REGEX, 'เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก')
    .refine((val) => {
      // Thai Tax ID checksum validation
      if (val.length !== 13) return false
      
      const digits = val.split('').map(Number)
      const weights = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]
      
      let sum = 0
      for (let i = 0; i < 12; i++) {
        sum += digits[i] * weights[i]
      }
      
      const checkDigit = (11 - (sum % 11)) % 10
      return checkDigit === digits[12]
    }, 'เลขประจำตัวผู้เสียภาษีไม่ถูกต้อง'),

  // Thai postal code validation
  postalCode: z
    .string()
    .min(1, 'กรุณากรอกรหัสไปรษณีย์')
    .regex(THAI_POSTAL_CODE_REGEX, 'รหัสไปรษณีย์ต้องมี 5 หลักและขึ้นต้นด้วย 1-9'),

  // Thai currency validation
  currency: z
    .string()
    .min(1, 'กรุณากรอกจำนวนเงิน')
    .regex(THAI_CURRENCY_REGEX, 'รูปแบบจำนวนเงินไม่ถูกต้อง')
    .transform((val) => {
      // Remove commas and convert to number
      return parseFloat(val.replace(/,/g, ''))
    })
    .refine((val) => val > 0, 'จำนวนเงินต้องมากกว่า 0'),

  // Thai business hours validation
  businessHours: z.object({
    open: z.string().min(1, 'กรุณาเลือกเวลาเปิด'),
    close: z.string().min(1, 'กรุณาเลือกเวลาปิด'),
    closed: z.boolean().default(false)
  }).refine((data) => {
    if (data.closed) return true
    if (!data.open || !data.close) return false
    
    const openTime = new Date(`2000-01-01T${data.open}`)
    const closeTime = new Date(`2000-01-01T${data.close}`)
    
    return openTime < closeTime
  }, 'เวลาเปิดต้องน้อยกว่าเวลาปิด'),

  // Thai restaurant name validation
  restaurantName: z
    .string()
    .min(2, 'ชื่อร้านต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(100, 'ชื่อร้านต้องไม่เกิน 100 ตัวอักษร')
    .regex(/^[a-zA-Z0-9\u0E00-\u0E7F\s\-\.]+$/, 'ชื่อร้านสามารถใช้ตัวอักษรไทย อังกฤษ ตัวเลข และเครื่องหมาย - . เท่านั้น'),

  // Thai menu item name validation
  menuItemName: z.object({
    name_th: z
      .string()
      .min(2, 'ชื่อเมนูภาษาไทยต้องมีอย่างน้อย 2 ตัวอักษร')
      .max(100, 'ชื่อเมนูภาษาไทยต้องไม่เกิน 100 ตัวอักษร')
      .regex(/^[\u0E00-\u0E7F\s\-\.]+$/, 'ชื่อเมนูภาษาไทยสามารถใช้ตัวอักษรไทยและเครื่องหมาย - . เท่านั้น'),
    name_en: z
      .string()
      .min(2, 'ชื่อเมนูภาษาอังกฤษต้องมีอย่างน้อย 2 ตัวอักษร')
      .max(100, 'ชื่อเมนูภาษาอังกฤษต้องไม่เกิน 100 ตัวอักษร')
      .regex(/^[a-zA-Z\s\-\.]+$/, 'ชื่อเมนูภาษาอังกฤษสามารถใช้ตัวอักษรภาษาอังกฤษและเครื่องหมาย - . เท่านั้น')
  }),

  // Thai address validation
  address: z.object({
    street: z.string().min(5, 'ที่อยู่ต้องมีอย่างน้อย 5 ตัวอักษร').max(200, 'ที่อยู่ต้องไม่เกิน 200 ตัวอักษร'),
    district: z.string().min(1, 'กรุณาเลือกเขต/อำเภอ'),
    province: z.string().min(1, 'กรุณาเลือกจังหวัด'),
    postal_code: z.string().regex(THAI_POSTAL_CODE_REGEX, 'รหัสไปรษณีย์ไม่ถูกต้อง')
  }),

  // Thai order validation
  order: z.object({
    customer_name: z.string().min(2, 'ชื่อลูกค้าต้องมีอย่างน้อย 2 ตัวอักษร').max(100, 'ชื่อลูกค้าต้องไม่เกิน 100 ตัวอักษร'),
    customer_phone: z.string().regex(THAI_PHONE_REGEX, 'หมายเลขโทรศัพท์ไม่ถูกต้อง'),
    items: z.array(z.object({
      menu_id: z.string().uuid('รหัสเมนูไม่ถูกต้อง'),
      quantity: z.number().min(1, 'จำนวนต้องมากกว่า 0').max(99, 'จำนวนต้องไม่เกิน 99'),
      special_instructions: z.string().max(200, 'คำแนะนำพิเศษต้องไม่เกิน 200 ตัวอักษร').optional()
    })).min(1, 'ต้องเลือกเมนูอย่างน้อย 1 รายการ'),
    payment_method: z.enum(['CASH', 'PROMPTPAY', 'CREDIT_CARD', 'TRANSFER', 'AIRPAY'], {
      errorMap: () => ({ message: 'กรุณาเลือกวิธีการชำระเงิน' })
    })
  })
}

// Utility functions for validation
export const validationUtils = {
  // Format Thai phone number for display
  formatThaiPhone: (phone: string): string => {
    if (!phone) return ''
    
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '')
    
    if (digits.startsWith('66')) {
      return '+66 ' + digits.slice(2).replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')
    }
    
    if (digits.startsWith('0')) {
      return digits.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')
    }
    
    return phone
  },

  // Format Thai currency for display
  formatThaiCurrency: (amount: number): string => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2
    }).format(amount)
  },

  // Parse Thai currency from string
  parseThaiCurrency: (value: string): number => {
    if (!value) return 0
    
    // Remove currency symbol, commas, and spaces
    const cleanValue = value.replace(/[^\d.,]/g, '').replace(',', '')
    return parseFloat(cleanValue) || 0
  },

  // Validate Thai Tax ID checksum
  validateThaiTaxId: (taxId: string): boolean => {
    if (!taxId || taxId.length !== 13) return false
    
    const digits = taxId.split('').map(Number)
    const weights = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]
    
    let sum = 0
    for (let i = 0; i < 12; i++) {
      sum += digits[i] * weights[i]
    }
    
    const checkDigit = (11 - (sum % 11)) % 10
    return checkDigit === digits[12]
  },

  // Validate Thai phone number
  validateThaiPhone: (phone: string): boolean => {
    return THAI_PHONE_REGEX.test(phone)
  },

  // Validate Thai postal code
  validateThaiPostalCode: (postalCode: string): boolean => {
    return THAI_POSTAL_CODE_REGEX.test(postalCode)
  },

  // Get validation error message in Thai
  getThaiErrorMessage: (error: z.ZodError): string => {
    const firstError = error.errors[0]
    if (firstError) {
      return firstError.message
    }
    return 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่'
  },

  // Sanitize Thai text input
  sanitizeThaiText: (text: string): string => {
    return text
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\u0E00-\u0E7F\s\-\.]/g, '') // Keep only Thai characters, spaces, hyphens, and dots
  },

  // Sanitize English text input
  sanitizeEnglishText: (text: string): string => {
    return text
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^a-zA-Z\s\-\.]/g, '') // Keep only English letters, spaces, hyphens, and dots
  }
}

// Custom Zod error messages for Thai market
export const thaiZodMessages = {
  required: 'กรุณากรอกข้อมูลนี้',
  invalid: 'ข้อมูลไม่ถูกต้อง',
  min: (min: number) => `ต้องมีอย่างน้อย ${min} ตัวอักษร`,
  max: (max: number) => `ต้องไม่เกิน ${max} ตัวอักษร`,
  email: 'รูปแบบอีเมลไม่ถูกต้อง',
  url: 'รูปแบบ URL ไม่ถูกต้อง',
  uuid: 'รหัสไม่ถูกต้อง',
  enum: 'กรุณาเลือกตัวเลือกที่ถูกต้อง',
  number: 'กรุณากรอกตัวเลข',
  integer: 'กรุณากรอกจำนวนเต็ม',
  positive: 'ต้องเป็นจำนวนบวก',
  nonnegative: 'ต้องเป็นจำนวนที่ไม่ติดลบ',
  date: 'รูปแบบวันที่ไม่ถูกต้อง',
  time: 'รูปแบบเวลาไม่ถูกต้อง'
}

// Enhanced Zod configuration for Thai market
export const configureZodForThai = () => {
  z.setErrorMap((error, ctx) => {
    const message = thaiZodMessages[error.code as keyof typeof thaiZodMessages]
    if (message) {
      return { message: typeof message === 'function' ? message(error.minimum || error.maximum || 0) : message }
    }
    return { message: error.message || 'ข้อมูลไม่ถูกต้อง' }
  })
}

// Initialize Thai Zod configuration
configureZodForThai()

// Export commonly used validation schemas
export const commonSchemas = {
  id: z.string().uuid('รหัสไม่ถูกต้อง'),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
  name: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร').max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร'),
  description: z.string().max(500, 'คำอธิบายต้องไม่เกิน 500 ตัวอักษร').optional(),
  price: z.number().positive('ราคาต้องมากกว่า 0'),
  quantity: z.number().int().positive('จำนวนต้องเป็นจำนวนเต็มบวก'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'COMPLETED', 'CANCELLED']),
  date: z.string().datetime('รูปแบบวันที่ไม่ถูกต้อง'),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'รูปแบบเวลาไม่ถูกต้อง')
}
