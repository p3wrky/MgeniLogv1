import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { maskPhoneNumber, maskIdNumber } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    const organizationId = searchParams.get('organizationId')

    if (!siteId || !organizationId) {
      return NextResponse.json(
        { error: 'Site ID and Organization ID are required' },
        { status: 400 }
      )
    }

    // Get active visits (not checked out)
    const activeVisits = await prisma.visit.findMany({
      where: {
        siteId,
        status: 'checked_in'
      },
      include: {
        visitor: true,
        host: {
          include: {
            department: true
          }
        },
        site: true
      },
      orderBy: {
        checkInTime: 'desc'
      }
    })

    // Mask sensitive data
    const maskedVisits = activeVisits.map(visit => ({
      id: visit.id,
      checkInTime: visit.checkInTime,
      expectedCheckOutTime: visit.expectedCheckOutTime,
      purpose: visit.purpose,
      valuables: visit.valuables,
      status: visit.status,
      visitor: {
        id: visit.visitor.id,
        name: visit.visitor.name,
        phone: maskPhoneNumber(visit.visitor.phone),
        idNumber: visit.visitor.idNumber ? maskIdNumber(visit.visitor.idNumber) : null,
        gender: visit.visitor.gender
      },
      host: {
        id: visit.host.id,
        name: visit.host.name,
        department: visit.host.department ? {
          id: visit.host.department.id,
          name: visit.host.department.name
        } : null
      },
      site: {
        id: visit.site.id,
        name: visit.site.name
      }
    }))

    return NextResponse.json({
      success: true,
      visits: maskedVisits,
      count: maskedVisits.length
    })

  } catch (error) {
    console.error('Active visits error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch active visits' },
      { status: 500 }
    )
  }
}