import { NextRequest, NextResponse } from 'next/server'
import { mpesaService } from '@/lib/mpesa'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, amount, organizationId, planType } = await request.json()

    // Validate input
    if (!phoneNumber || !amount || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Format phone number (remove + if present, ensure starts with 254)
    let formattedPhone = phoneNumber.replace(/\+/g, '')
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1)
    }
    if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        organizationId,
        amount: parseFloat(amount),
        currency: 'KES',
        paymentMethod: 'mpesa',
        status: 'pending'
      }
    })

    // Initiate STK Push
    const stkResponse = await mpesaService.initiateSTKPush(
      formattedPhone,
      parseFloat(amount),
      payment.id,
      `MgeniLog ${planType || 'Subscription'} Payment`
    )

    // Update payment with checkout request ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymentReference: stkResponse.CheckoutRequestID
      }
    })

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      checkoutRequestId: stkResponse.CheckoutRequestID,
      message: 'STK Push sent. Please check your phone to complete payment.'
    })

  } catch (error) {
    console.error('M-pesa initiation error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate M-pesa payment' },
      { status: 500 }
    )
  }
}