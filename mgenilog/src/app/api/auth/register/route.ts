import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { organizationName, email, password, firstName, lastName, phone, industry } = await request.json()

    // Validate input
    if (!organizationName || !email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if organization email already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { email }
    })

    if (existingOrg) {
      return NextResponse.json(
        { error: 'Organization with this email already exists' },
        { status: 400 }
      )
    }

    // Check if user email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create organization and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          email,
          phone,
          industry
        }
      })

      // Create admin user
      const user = await tx.user.create({
        data: {
          organizationId: organization.id,
          email,
          passwordHash,
          firstName,
          lastName,
          role: 'org_admin'
        }
      })

      // Create default site
      const site = await tx.site.create({
        data: {
          organizationId: organization.id,
          name: 'Main Office',
          address: ''
        }
      })

      // Create default check-in form for the site
      await tx.checkInForm.create({
        data: {
          siteId: site.id
        }
      })

      return { organization, user, site }
    })

    return NextResponse.json({
      success: true,
      organizationId: result.organization.id,
      userId: result.user.id,
      siteId: result.site.id,
      message: 'Organization registered successfully'
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register organization' },
      { status: 500 }
    )
  }
}