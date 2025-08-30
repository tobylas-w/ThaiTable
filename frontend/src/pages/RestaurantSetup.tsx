import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Clock, CreditCard, MapPin, Phone, Save } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

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
      console.log('Restaurant setup data:', data)
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSubmitSuccess(true)
    } catch (error) {
      console.error('Error setting up restaurant:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const businessHours = watch('business_hours')
  const days = [
    { key: 'monday', label: 'จันทร์' },
    { key: 'tuesday', label: 'อังคาร' },
    { key: 'wednesday', label: 'พุธ' },
    { key: 'thursday', label: 'พฤหัสบดี' },
    { key: 'friday', label: 'ศุกร์' },
    { key: 'saturday', label: 'เสาร์' },
    { key: 'sunday', label: 'อาทิตย์' }
  ]

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <Save className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('restaurant.setup.success.title')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('restaurant.setup.success.message')}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors"
          >
            ไปยังแดชบอร์ด
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <Building2 className="h-6 w-6 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('restaurant.setup.title')}
            </h1>
            <p className="text-gray-600">
              {t('restaurant.setup.description')}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                {t('restaurant.setup.basic_info')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('restaurant.name_th')}
                  </label>
                  <input
                    type="text"
                    {...register('name_th')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="ชื่อร้านอาหาร"
                  />
                  {errors.name_th && (
                    <p className="mt-1 text-sm text-red-600">{errors.name_th.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('restaurant.name_en')}
                  </label>
                  <input
                    type="text"
                    {...register('name_en')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Restaurant Name"
                  />
                  {errors.name_en && (
                    <p className="mt-1 text-sm text-red-600">{errors.name_en.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('restaurant.cuisine_type')}
                  </label>
                  <select
                    {...register('cuisine_type')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">{t('restaurant.select_cuisine')}</option>
                    <option value="thai">อาหารไทย</option>
                    <option value="chinese">อาหารจีน</option>
                    <option value="japanese">อาหารญี่ปุ่น</option>
                    <option value="korean">อาหารเกาหลี</option>
                    <option value="western">อาหารตะวันตก</option>
                    <option value="fusion">ฟิวชั่น</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                  {errors.cuisine_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.cuisine_type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('restaurant.seating_capacity')}
                  </label>
                  <input
                    type="number"
                    {...register('seating_capacity', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="จำนวนที่นั่ง"
                    min="1"
                  />
                  {errors.seating_capacity && (
                    <p className="mt-1 text-sm text-red-600">{errors.seating_capacity.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                {t('restaurant.setup.contact_info')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('restaurant.phone')}
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="081-234-5678"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('restaurant.email')}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('restaurant.tax_id')}
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
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                {t('restaurant.setup.address')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('restaurant.address_th')}
                  </label>
                  <textarea
                    {...register('address_th')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="ที่อยู่ร้านอาหาร (ภาษาไทย)"
                  />
                  {errors.address_th && (
                    <p className="mt-1 text-sm text-red-600">{errors.address_th.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('restaurant.address_en')}
                  </label>
                  <textarea
                    {...register('address_en')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Restaurant Address (English)"
                  />
                  {errors.address_en && (
                    <p className="mt-1 text-sm text-red-600">{errors.address_en.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                {t('restaurant.setup.business_hours')}
              </h2>
              <div className="space-y-4">
                {days.map((day) => (
                  <div key={day.key} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-20">
                      <label className="text-sm font-medium text-gray-700">{day.label}</label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={businessHours[day.key as keyof typeof businessHours]?.closed}
                        onChange={(e) => setValue(`business_hours.${day.key}.closed`, e.target.checked)}
                        className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                      />
                      <span className="text-sm text-gray-600">{t('restaurant.closed')}</span>
                    </div>

                    {!businessHours[day.key as keyof typeof businessHours]?.closed && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={businessHours[day.key as keyof typeof businessHours]?.open || ''}
                          onChange={(e) => setValue(`business_hours.${day.key}.open`, e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                        <span className="text-gray-500">ถึง</span>
                        <input
                          type="time"
                          value={businessHours[day.key as keyof typeof businessHours]?.close || ''}
                          onChange={(e) => setValue(`business_hours.${day.key}.close`, e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Services & Payment */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                {t('restaurant.setup.services_payment')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Services */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t('restaurant.setup.services')}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('accepts_reservations')}
                        className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">{t('restaurant.accepts_reservations')}</label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('has_delivery')}
                        className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">{t('restaurant.has_delivery')}</label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('has_takeaway')}
                        className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">{t('restaurant.has_takeaway')}</label>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t('restaurant.setup.payment_methods')}</h3>
                  <div className="space-y-3">
                    {[
                      { value: 'cash', label: 'เงินสด' },
                      { value: 'promptpay', label: 'PromptPay' },
                      { value: 'truemoney', label: 'TrueMoney' },
                      { value: 'scb_easy', label: 'SCB Easy' },
                      { value: 'credit_card', label: 'บัตรเครดิต' },
                      { value: 'line_pay', label: 'LINE Pay' },
                      { value: 'airpay', label: 'AirPay' }
                    ].map((method) => (
                      <div key={method.value} className="flex items-center">
                        <input
                          type="checkbox"
                          value={method.value}
                          {...register('payment_methods')}
                          className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                        />
                        <label className="ml-2 text-sm text-gray-700">{method.label}</label>
                      </div>
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
                className="bg-yellow-600 text-white px-6 py-3 rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('common.saving')}
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
      </div>
    </div>
  )
}

export default RestaurantSetup
