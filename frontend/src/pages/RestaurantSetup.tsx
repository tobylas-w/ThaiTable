import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, MapPin, Phone, Mail, Clock, CreditCard, Save } from 'lucide-react'

// Thai restaurant setup schema with validation
const restaurantSetupSchema = z.object({
  name_th: z.string().min(2, 'ชื่อร้านอาหารต้องมีอย่างน้อย 2 ตัวอักษร'),
  name_en: z.string().min(2, 'Restaurant name must be at least 2 characters'),
  address_th: z.string().min(10, 'ที่อยู่ต้องมีอย่างน้อย 10 ตัวอักษร'),
  address_en: z.string().min(10, 'Address must be at least 10 characters'),
  phone: z.string().regex(/^(\+66|0)[0-9]{8,9}$/, 'หมายเลขโทรศัพท์ไม่ถูกต้อง'),
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  tax_id: z.string().regex(/^[0-9]{13}$/, 'เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก'),
  business_hours: z.object({
    monday: z.object({
      open: z.string(),
      close: z.string(),
      closed: z.boolean()
    }),
    tuesday: z.object({
      open: z.string(),
      close: z.string(),
      closed: z.boolean()
    }),
    wednesday: z.object({
      open: z.string(),
      close: z.string(),
      closed: z.boolean()
    }),
    thursday: z.object({
      open: z.string(),
      close: z.string(),
      closed: z.boolean()
    }),
    friday: z.object({
      open: z.string(),
      close: z.string(),
      closed: z.boolean()
    }),
    saturday: z.object({
      open: z.string(),
      close: z.string(),
      closed: z.boolean()
    }),
    sunday: z.object({
      open: z.string(),
      close: z.string(),
      closed: z.boolean()
    })
  }),
  cuisine_type: z.string().min(1, 'กรุณาเลือกประเภทอาหาร'),
  seating_capacity: z.number().min(1, 'จำนวนที่นั่งต้องมากกว่า 0'),
  accepts_reservations: z.boolean(),
  has_delivery: z.boolean(),
  has_takeaway: z.boolean(),
  payment_methods: z.array(z.string()).min(1, 'กรุณาเลือกวิธีการชำระเงินอย่างน้อย 1 วิธี')
})

type RestaurantSetupForm = z.infer<typeof restaurantSetupSchema>

const RestaurantSetup = () => {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<RestaurantSetupForm>({
    resolver: zodResolver(restaurantSetupSchema),
    defaultValues: {
      business_hours: {
        monday: { open: '10:00', close: '22:00', closed: false },
        tuesday: { open: '10:00', close: '22:00', closed: false },
        wednesday: { open: '10:00', close: '22:00', closed: false },
        thursday: { open: '10:00', close: '22:00', closed: false },
        friday: { open: '10:00', close: '22:00', closed: false },
        saturday: { open: '10:00', close: '22:00', closed: false },
        sunday: { open: '10:00', close: '22:00', closed: false }
      },
      accepts_reservations: true,
      has_delivery: true,
      has_takeaway: true,
      payment_methods: ['cash', 'promptpay']
    }
  })

  const onSubmit = async (data: RestaurantSetupForm) => {
    setIsSubmitting(true)
    try {
      // TODO: Replace with actual API call
      console.log('Restaurant setup data:', data)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSubmitSuccess(true)
    } catch (error) {
      console.error('Error setting up restaurant:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const cuisineTypes = [
    { value: 'thai', label_th: 'อาหารไทย', label_en: 'Thai' },
    { value: 'chinese', label_th: 'อาหารจีน', label_en: 'Chinese' },
    { value: 'japanese', label_th: 'อาหารญี่ปุ่น', label_en: 'Japanese' },
    { value: 'korean', label_th: 'อาหารเกาหลี', label_en: 'Korean' },
    { value: 'western', label_th: 'อาหารตะวันตก', label_en: 'Western' },
    { value: 'indian', label_th: 'อาหารอินเดีย', label_en: 'Indian' },
    { value: 'italian', label_th: 'อาหารอิตาเลียน', label_en: 'Italian' },
    { value: 'seafood', label_th: 'อาหารทะเล', label_en: 'Seafood' },
    { value: 'bbq', label_th: 'บาร์บีคิว', label_en: 'BBQ' },
    { value: 'other', label_th: 'อื่นๆ', label_en: 'Other' }
  ]

  const paymentOptions = [
    { value: 'cash', label_th: 'เงินสด', label_en: 'Cash' },
    { value: 'promptpay', label_th: 'PromptPay', label_en: 'PromptPay' },
    { value: 'credit_card', label_th: 'บัตรเครดิต', label_en: 'Credit Card' },
    { value: 'debit_card', label_th: 'บัตรเดบิต', label_en: 'Debit Card' },
    { value: 'truemoney', label_th: 'TrueMoney', label_en: 'TrueMoney' },
    { value: 'linepay', label_th: 'LINE Pay', label_en: 'LINE Pay' }
  ]

  const daysOfWeek = [
    { key: 'monday', label_th: 'จันทร์', label_en: 'Monday' },
    { key: 'tuesday', label_th: 'อังคาร', label_en: 'Tuesday' },
    { key: 'wednesday', label_th: 'พุธ', label_en: 'Wednesday' },
    { key: 'thursday', label_th: 'พฤหัสบดี', label_en: 'Thursday' },
    { key: 'friday', label_th: 'ศุกร์', label_en: 'Friday' },
    { key: 'saturday', label_th: 'เสาร์', label_en: 'Saturday' },
    { key: 'sunday', label_th: 'อาทิตย์', label_en: 'Sunday' }
  ]

  if (submitSuccess) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-green-800">
                {t('restaurant.setup.success.title')}
              </h3>
              <p className="mt-1 text-sm text-green-700">
                {t('restaurant.setup.success.message')}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('restaurant.setup.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t('restaurant.setup.description')}
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Building2 className="h-5 w-5 text-yellow-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              {t('restaurant.setup.basic_info')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('restaurant.name_th')} *
              </label>
              <input
                type="text"
                {...register('name_th')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="ร้านอาหารไทยอร่อย"
              />
              {errors.name_th && (
                <p className="mt-1 text-sm text-red-600">{errors.name_th.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('restaurant.name_en')} *
              </label>
              <input
                type="text"
                {...register('name_en')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Delicious Thai Restaurant"
              />
              {errors.name_en && (
                <p className="mt-1 text-sm text-red-600">{errors.name_en.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('restaurant.cuisine_type')} *
              </label>
              <select
                {...register('cuisine_type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">{t('restaurant.select_cuisine')}</option>
                {cuisineTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label_th} / {type.label_en}
                  </option>
                ))}
              </select>
              {errors.cuisine_type && (
                <p className="mt-1 text-sm text-red-600">{errors.cuisine_type.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('restaurant.seating_capacity')} *
              </label>
              <input
                type="number"
                {...register('seating_capacity', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="50"
                min="1"
              />
              {errors.seating_capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.seating_capacity.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Phone className="h-5 w-5 text-yellow-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              {t('restaurant.setup.contact_info')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('restaurant.phone')} *
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="0812345678"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('restaurant.email')} *
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="restaurant@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('restaurant.tax_id')} *
              </label>
              <input
                type="text"
                {...register('tax_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="1234567890123"
                maxLength={13}
              />
              {errors.tax_id && (
                <p className="mt-1 text-sm text-red-600">{errors.tax_id.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <MapPin className="h-5 w-5 text-yellow-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              {t('restaurant.setup.address')}
            </h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('restaurant.address_th')} *
              </label>
              <textarea
                {...register('address_th')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110"
              />
              {errors.address_th && (
                <p className="mt-1 text-sm text-red-600">{errors.address_th.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('restaurant.address_en')} *
              </label>
              <textarea
                {...register('address_en')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="123 Sukhumvit Road, Khlong Toei, Khlong Toei, Bangkok 10110"
              />
              {errors.address_en && (
                <p className="mt-1 text-sm text-red-600">{errors.address_en.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Clock className="h-5 w-5 text-yellow-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              {t('restaurant.setup.business_hours')}
            </h2>
          </div>
          
          <div className="space-y-4">
            {daysOfWeek.map(day => (
              <div key={day.key} className="flex items-center space-x-4">
                <div className="w-24 text-sm font-medium text-gray-700">
                  {day.label_th} / {day.label_en}
                </div>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register(`business_hours.${day.key}.closed`)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">{t('restaurant.closed')}</span>
                </label>
                
                {!watch(`business_hours.${day.key}.closed`) && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      {...register(`business_hours.${day.key}.open`)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <span className="text-sm text-gray-500">-</span>
                    <input
                      type="time"
                      {...register(`business_hours.${day.key}.close`)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Services & Payment */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <CreditCard className="h-5 w-5 text-yellow-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              {t('restaurant.setup.services_payment')}
            </h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">
                {t('restaurant.setup.services')}
              </h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('accepts_reservations')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{t('restaurant.accepts_reservations')}</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('has_delivery')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{t('restaurant.has_delivery')}</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('has_takeaway')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{t('restaurant.has_takeaway')}</span>
                </label>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">
                {t('restaurant.setup.payment_methods')} *
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {paymentOptions.map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      value={option.value}
                      {...register('payment_methods')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      {option.label_th} / {option.label_en}
                    </span>
                  </label>
                ))}
              </div>
              {errors.payment_methods && (
                <p className="mt-1 text-sm text-red-600">{errors.payment_methods.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('common.saving')}...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t('restaurant.setup.save')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default RestaurantSetup
