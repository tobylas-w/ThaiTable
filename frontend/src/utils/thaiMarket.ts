/**
 * Thai Market Utilities
 * Provides utilities for Thai restaurant business operations
 */

/**
 * Format currency in Thai Baht
 * @param amount - Amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export const formatThaiCurrency = (
  amount: number,
  options: {
    minimumFractionDigits?: number
    maximumFractionDigits?: number
    showSymbol?: boolean
  } = {}
): string => {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    showSymbol = true
  } = options

  const formatter = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits,
    maximumFractionDigits,
  })

  const formatted = formatter.format(amount)

  // Return without symbol if requested
  if (!showSymbol) {
    return formatted.replace('฿', '').replace('THB', '').trim()
  }

  return formatted
}

/**
 * Parse Thai currency string to number
 * @param currencyString - Currency string to parse
 * @returns Parsed number
 */
export const parseThaiCurrency = (currencyString: string): number => {
  const cleaned = currencyString
    .replace(/[฿THB,\s]/g, '')
    .replace(/[^\d.-]/g, '')

  return parseFloat(cleaned) || 0
}

/**
 * Calculate VAT for Thai businesses (7%)
 * @param amount - Base amount
 * @param vatRate - VAT rate (default 7%)
 * @returns VAT amount
 */
export const calculateVAT = (amount: number, vatRate: number = 0.07): number => {
  return Math.round((amount * vatRate) * 100) / 100
}

/**
 * Calculate service charge for Thai restaurants (typically 10%)
 * @param amount - Base amount
 * @param serviceRate - Service charge rate (default 10%)
 * @returns Service charge amount
 */
export const calculateServiceCharge = (amount: number, serviceRate: number = 0.10): number => {
  return Math.round((amount * serviceRate) * 100) / 100
}

/**
 * Validate Thai Tax ID (13 digits with checksum)
 * @param taxId - Tax ID to validate
 * @returns True if valid
 */
export const validateThaiTaxId = (taxId: string): boolean => {
  // Remove any non-digit characters
  const cleaned = taxId.replace(/\D/g, '')

  // Must be exactly 13 digits
  if (cleaned.length !== 13) {
    return false
  }

  // Calculate checksum
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * (13 - i)
  }

  const remainder = sum % 11
  const checkDigit = remainder < 2 ? remainder : 11 - remainder

  return checkDigit === parseInt(cleaned[12])
}

/**
 * Format Thai Tax ID with dashes
 * @param taxId - Tax ID to format
 * @returns Formatted tax ID
 */
export const formatThaiTaxId = (taxId: string): string => {
  const cleaned = taxId.replace(/\D/g, '')

  if (cleaned.length !== 13) {
    return cleaned
  }

  return `${cleaned.substring(0, 1)}-${cleaned.substring(1, 5)}-${cleaned.substring(5, 10)}-${cleaned.substring(10, 12)}-${cleaned.substring(12)}`
}

/**
 * Validate Thai phone number
 * @param phone - Phone number to validate
 * @returns True if valid
 */
export const validateThaiPhone = (phone: string): boolean => {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '')

  // Thai mobile: 08x-xxx-xxxx or 09x-xxx-xxxx (10 digits)
  // Thai landline: 0x-xxx-xxxx (9 digits for Bangkok, varies for others)
  if (cleaned.length === 10) {
    // Mobile numbers
    return /^0[89]\d{8}$/.test(cleaned)
  } else if (cleaned.length === 9) {
    // Bangkok landline
    return /^02\d{7}$/.test(cleaned)
  }

  return false
}

/**
 * Format Thai phone number
 * @param phone - Phone number to format
 * @returns Formatted phone number
 */
export const formatThaiPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 10) {
    // Mobile format: 0xx-xxx-xxxx
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6)}`
  } else if (cleaned.length === 9) {
    // Bangkok landline: 0x-xxx-xxxx
    return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 5)}-${cleaned.substring(5)}`
  }

  return cleaned
}

/**
 * Get Thai business hours in 24-hour format
 * @returns Standard Thai restaurant hours
 */
export const getStandardBusinessHours = () => {
  return {
    monday: { open: '10:00', close: '22:00', closed: false },
    tuesday: { open: '10:00', close: '22:00', closed: false },
    wednesday: { open: '10:00', close: '22:00', closed: false },
    thursday: { open: '10:00', close: '22:00', closed: false },
    friday: { open: '10:00', close: '22:00', closed: false },
    saturday: { open: '10:00', close: '22:00', closed: false },
    sunday: { open: '10:00', close: '22:00', closed: false }
  }
}

/**
 * Thai payment methods commonly used
 */
export const THAI_PAYMENT_METHODS = {
  CASH: {
    name: 'เงินสด',
    nameEn: 'Cash',
    icon: '💵',
    fee: 0
  },
  PROMPTPAY: {
    name: 'พร้อมเพย์',
    nameEn: 'PromptPay',
    icon: '📱',
    fee: 0
  },
  TRUEMONEY: {
    name: 'ทรูมันนี่',
    nameEn: 'TrueMoney',
    icon: '💳',
    fee: 0.015 // 1.5%
  },
  SCB_EASY: {
    name: 'SCB Easy',
    nameEn: 'SCB Easy',
    icon: '🏦',
    fee: 0.01 // 1%
  },
  LINE_PAY: {
    name: 'LINE Pay',
    nameEn: 'LINE Pay',
    icon: '💚',
    fee: 0.02 // 2%
  },
  CREDIT_CARD: {
    name: 'บัตรเครดิต',
    nameEn: 'Credit Card',
    icon: '💳',
    fee: 0.025 // 2.5%
  },
  AIRPAY: {
    name: 'AirPay',
    nameEn: 'AirPay',
    icon: '📱',
    fee: 0.015 // 1.5%
  }
} as const

/**
 * Get payment method fee
 * @param method - Payment method
 * @param amount - Transaction amount
 * @returns Fee amount
 */
export const getPaymentMethodFee = (
  method: keyof typeof THAI_PAYMENT_METHODS,
  amount: number
): number => {
  const paymentMethod = THAI_PAYMENT_METHODS[method]
  if (!paymentMethod) return 0

  return Math.round((amount * paymentMethod.fee) * 100) / 100
}

/**
 * Convert Buddhist Era to Christian Era year
 * @param buddhistYear - Buddhist Era year
 * @returns Christian Era year
 */
export const buddhistToChristianYear = (buddhistYear: number): number => {
  return buddhistYear - 543
}

/**
 * Convert Christian Era to Buddhist Era year
 * @param christianYear - Christian Era year
 * @returns Buddhist Era year
 */
export const christianToBuddhistYear = (christianYear: number): number => {
  return christianYear + 543
}

/**
 * Format date in Thai format
 * @param date - Date to format
 * @param includeBuddhistYear - Include Buddhist year
 * @returns Formatted Thai date
 */
export const formatThaiDate = (
  date: Date,
  includeBuddhistYear: boolean = false
): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Bangkok'
  }

  let formatted = date.toLocaleDateString('th-TH', options)

  if (includeBuddhistYear) {
    const buddhistYear = christianToBuddhistYear(date.getFullYear())
    formatted = formatted.replace(date.getFullYear().toString(), buddhistYear.toString())
  }

  return formatted
}

/**
 * Get Thai spice level descriptions
 */
export const THAI_SPICE_LEVELS = {
  1: { name: 'ไม่เผ็ด', nameEn: 'Mild', emoji: '😊', color: 'green' },
  2: { name: 'เผ็ดน้อย', nameEn: 'Little Spicy', emoji: '🙂', color: 'yellow' },
  3: { name: 'เผ็ดปานกลาง', nameEn: 'Medium Spicy', emoji: '😋', color: 'orange' },
  4: { name: 'เผ็ด', nameEn: 'Spicy', emoji: '🥵', color: 'red' },
  5: { name: 'เผ็ดมาก', nameEn: 'Very Spicy', emoji: '🔥', color: 'red' }
} as const

/**
 * Thai cuisine categories
 */
export const THAI_CUISINE_CATEGORIES = {
  APPETIZER: { name: 'ของทานเล่น', nameEn: 'Appetizers' },
  SOUP: { name: 'ต้ม/แกง', nameEn: 'Soups & Curries' },
  SALAD: { name: 'ยำ/ส้ม', nameEn: 'Salads' },
  STIR_FRY: { name: 'ผัด', nameEn: 'Stir-fried' },
  FRIED: { name: 'ทอด', nameEn: 'Fried' },
  GRILLED: { name: 'ย่าง/เผา', nameEn: 'Grilled' },
  NOODLES: { name: 'ก๋วยเตี๋ยว/บะหมี่', nameEn: 'Noodles' },
  RICE: { name: 'ข้าว', nameEn: 'Rice Dishes' },
  DESSERT: { name: 'ของหวาน', nameEn: 'Desserts' },
  BEVERAGE: { name: 'เครื่องดื่ม', nameEn: 'Beverages' }
} as const

/**
 * Thai dietary restrictions/preferences
 */
export const THAI_DIETARY_OPTIONS = {
  VEGETARIAN: { name: 'มังสวิรัติ', nameEn: 'Vegetarian', icon: '🥬' },
  VEGAN: { name: 'วีแกน', nameEn: 'Vegan', icon: '🌱' },
  HALAL: { name: 'ฮาลาล', nameEn: 'Halal', icon: '☪️' },
  GLUTEN_FREE: { name: 'ไม่มีกลูเตน', nameEn: 'Gluten Free', icon: '🌾' },
  NO_PORK: { name: 'ไม่กินหมู', nameEn: 'No Pork', icon: '🚫' },
  NO_BEEF: { name: 'ไม่กินเนื้อ', nameEn: 'No Beef', icon: '🚫' },
  SEAFOOD_ALLERGY: { name: 'แพ้อาหารทะเล', nameEn: 'Seafood Allergy', icon: '🦐' }
} as const

/**
 * Validate Thai postal code
 * @param postalCode - Postal code to validate
 * @returns True if valid
 */
export const validateThaiPostalCode = (postalCode: string): boolean => {
  // Thai postal codes are 5 digits
  const cleaned = postalCode.replace(/\D/g, '')
  return /^\d{5}$/.test(cleaned)
}

/**
 * Format Thai postal code
 * @param postalCode - Postal code to format
 * @returns Formatted postal code
 */
export const formatThaiPostalCode = (postalCode: string): string => {
  const cleaned = postalCode.replace(/\D/g, '')
  return cleaned.substring(0, 5)
}
