import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { maskPhoneNumber, maskIdNumber } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    const organizationId = searchParams.get('organizationId')

    if (!phone || !organizationId) {
      return NextResponse.json(
        { error: 'Phone number and organization ID are required' },
        { status: 400 }
      )
    }

    // Search for visitor by phone number
    const visitor = await prisma.visitor.findFirst({
      where: {
        organizationId,
        phone
      },
      include: {
        visits: {
          include: {
            host: true,
            site: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5 // Last 5 visits
        }
      }
    })

    if (!visitor) {
      return NextResponse.json({
        found: false,
        message: 'No visitor found with this phone number'
      })
    }

    // Mask sensitive data
    const maskedVisitor = {
      ...visitor,
      phone: maskPhoneNumber(visitor.phone),
      idNumber: visitor.idNumber ? maskIdNumber(visitor.idNumber) : null,
      visits: visitor.visits.map(visit => ({
        ...visit,
        site: {
          id: visit.site.id,
          name: visit.site.name
        },
        host: {
          id: visit.host.id,
          name: visit.host.name
        }
      }))
    }

    return NextResponse.json({
      found: true,
      visitor: maskedVisitor
    })

  } catch (error) {
    console.error('Visitor search error:', error)
    return NextResponse.json(
      { error: 'Failed to search visitor' },
      { status: 500 }
    )
  }
}