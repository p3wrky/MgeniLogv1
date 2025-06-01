import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export interface UserPayload {
  id: string
  email: string
  organizationId: string
  role: string
  siteId?: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, process.env.NEXTAUTH_SECRET!, { expiresIn: '7d' })
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, process.env.NEXTAUTH_SECRET!) as UserPayload
  } catch (error) {
    return null
  }
}

export function maskPhoneNumber(phone: string): string {
  if (phone.length <= 4) return phone
  return phone.slice(0, 2) + '*'.repeat(phone.length - 6) + phone.slice(-4)
}

export function maskIdNumber(idNumber: string): string {
  if (idNumber.length <= 4) return idNumber
  return '*'.repeat(idNumber.length - 4) + idNumber.slice(-4)
}