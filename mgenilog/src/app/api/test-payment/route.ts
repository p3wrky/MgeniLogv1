import { NextRequest, NextResponse } from 'next/server'
import { mpesaService } from '@/lib/mpesa'
import { pesapalService } from '@/lib/pesapal'

export async function POST(request: NextRequest) {
  try {
    const { method, amount, phoneNumber } = await request.json()

    if (method === 'mpesa') {
      // Test M-pesa STK Push
      const result = await mpesaService.initiateSTKPush(
        phoneNumber,
        amount,
        `test-${Date.now()}`,
        `MgeniLog Test Payment - KES ${amount}`
      )

      return NextResponse.json({
        success: true,
        message: 'M-pesa test initiated',
        data: result
      })
    } else if (method === 'pesapal') {
      // Test Pesapal order submission
      const orderData = {
        id: `test-order-${Date.now()}`,
        currency: 'KES',
        amount: amount,
        description: `MgeniLog Test Payment - KES ${amount}`,
        callback_url: process.env.NEXTAUTH_URL + '/api/payments/pesapal/callback',
        notification_id: 'test-notification-id',
        billing_address: {
          email_address: 'test@mgenilog.com',
          phone_number: phoneNumber,
          country_code: 'KE',
          first_name: 'Test',
          last_name: 'User'
        }
      }

      const result = await pesapalService.submitOrder(orderData)

      return NextResponse.json({
        success: true,
        message: 'Pesapal test initiated',
        data: result
      })
    }

    return NextResponse.json(
      { error: 'Invalid payment method' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Test payment error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Test payment failed' },
      { status: 500 }
    )
  }
}