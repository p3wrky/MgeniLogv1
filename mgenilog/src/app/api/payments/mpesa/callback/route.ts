import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json()
    console.log('M-pesa callback received:', callbackData)

    const { Body } = callbackData
    const { stkCallback } = Body

    if (!stkCallback) {
      return NextResponse.json({ error: 'Invalid callback data' }, { status: 400 })
    }

    const { CheckoutRequestID, ResultCode, ResultDesc } = stkCallback

    // Find payment by checkout request ID
    const payment = await prisma.payment.findFirst({
      where: {
        paymentReference: CheckoutRequestID
      }
    })

    if (!payment) {
      console.error('Payment not found for CheckoutRequestID:', CheckoutRequestID)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Update payment status based on result code
    const isSuccessful = ResultCode === 0
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: isSuccessful ? 'completed' : 'failed',
        paymentDate: isSuccessful ? new Date() : null
      }
    })

    if (isSuccessful) {
      // Activate or update subscription
      const organization = await prisma.organization.findUnique({
        where: { id: payment.organizationId },
        include: { subscription: true }
      })

      if (organization) {
        // Determine plan details based on amount
        let planType = 'basic'
        let siteLimit = 1
        let userLimit = 3
        let visitorLimit = 1000

        if (payment.amount >= 12000) {
          planType = 'professional'
          siteLimit = 3
          userLimit = 10
          visitorLimit = 5000
        } else if (payment.amount >= 25000) {
          planType = 'enterprise'
          siteLimit = 10
          userLimit = 100
          visitorLimit = 15000
        }

        if (organization.subscription) {
          // Update existing subscription
          await prisma.subscription.update({
            where: { organizationId: organization.id },
            data: {
              planType,
              siteLimit,
              userLimit,
              visitorLimit,
              isActive: true,
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            }
          })
        } else {
          // Create new subscription
          await prisma.subscription.create({
            data: {
              organizationId: organization.id,
              planType,
              siteLimit,
              userLimit,
              visitorLimit,
              billingCycle: 'monthly',
              amount: payment.amount,
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            }
          })
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Callback processed' })

  } catch (error) {
    console.error('M-pesa callback error:', error)
    return NextResponse.json(
      { error: 'Failed to process callback' },
      { status: 500 }
    )
  }
}