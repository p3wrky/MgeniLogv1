import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const {
      organizationId,
      siteId,
      visitorData,
      hostId,
      purpose,
      valuables,
      expectedDuration,
      checkInBy
    } = await request.json()

    // Validate required fields
    if (!organizationId || !siteId || !visitorData || !hostId || !checkInBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      // Find or create visitor
      let visitor = await tx.visitor.findFirst({
        where: {
          organizationId,
          phone: visitorData.phone
        }
      })

      if (visitor) {
        // Update existing visitor
        visitor = await tx.visitor.update({
          where: { id: visitor.id },
          data: {
            name: visitorData.name,
            idNumber: visitorData.idNumber,
            gender: visitorData.gender,
            lastVisit: new Date(),
            visitCount: {
              increment: 1
            }
          }
        })
      } else {
        // Create new visitor
        visitor = await tx.visitor.create({
          data: {
            organizationId,
            name: visitorData.name,
            phone: visitorData.phone,
            idNumber: visitorData.idNumber,
            gender: visitorData.gender
          }
        })
      }

      // Get host details for department
      const host = await tx.host.findUnique({
        where: { id: hostId },
        include: { department: true }
      })

      if (!host) {
        throw new Error('Host not found')
      }

      // Calculate expected checkout time
      let expectedCheckOutTime = null
      if (expectedDuration) {
        expectedCheckOutTime = new Date(Date.now() + expectedDuration * 60 * 1000)
      }

      // Create visit record
      const visit = await tx.visit.create({
        data: {
          visitorId: visitor.id,
          siteId,
          hostId,
          departmentId: host.departmentId,
          purpose,
          valuables: valuables || [],
          expectedCheckOutTime,
          checkInBy
        },
        include: {
          visitor: true,
          host: {
            include: {
              department: true
            }
          },
          site: true
        }
      })

      return visit
    })

    return NextResponse.json({
      success: true,
      visit: result,
      message: 'Visitor checked in successfully'
    })

  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check in visitor' },
      { status: 500 }
    )
  }
}