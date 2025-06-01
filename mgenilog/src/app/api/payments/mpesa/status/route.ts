import { NextRequest, NextResponse } from 'next/server'
import { mpesaService } from '@/lib/mpesa'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    // Get payment from database
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // If payment is already completed or failed, return status
    if (payment.status !== 'pending') {
      return NextResponse.json({
        status: payment.status,
        paymentDate: payment.paymentDate
      })
    }

    // Query M-pesa for status if still pending
    if (payment.paymentReference) {
      try {
        const stkStatus = await mpesaService.querySTKStatus(payment.paymentReference)
        
        // Update payment based on STK query result
        if (stkStatus.ResultCode === '0') {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'completed',
              paymentDate: new Date()
            }
          })
          return NextResponse.json({
            status: 'completed',
            paymentDate: new Date()
          })
        } else if (stkStatus.ResultCode !== '1032') { // 1032 means still pending
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'failed'
            }
          })
          return NextResponse.json({
            status: 'failed'
          })
        }
      } catch (error) {
        console.error('STK query error:', error)
      }
    }

    return NextResponse.json({
      status: 'pending'
    })

  } catch (error) {
    console.error('Payment status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    )
  }
}