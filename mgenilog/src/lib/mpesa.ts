import axios from 'axios'

export interface MpesaConfig {
  consumerKey: string
  consumerSecret: string
  environment: 'sandbox' | 'production'
  passkey: string
  shortcode: string
}

export class MpesaService {
  private config: MpesaConfig
  private baseUrl: string

  constructor(config: MpesaConfig) {
    this.config = config
    this.baseUrl = config.environment === 'sandbox' 
      ? 'https://sandbox.safaricom.co.ke'
      : 'https://api.safaricom.co.ke'
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64')
    
    try {
      const response = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          Authorization: `Basic ${auth}`
        }
      })
      
      return response.data.access_token
    } catch (error) {
      console.error('Failed to get M-pesa access token:', error)
      throw new Error('Failed to authenticate with M-pesa')
    }
  }

  async initiateSTKPush(phoneNumber: string, amount: number, accountReference: string, transactionDesc: string) {
    const accessToken = await this.getAccessToken()
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3)
    const password = Buffer.from(`${this.config.shortcode}${this.config.passkey}${timestamp}`).toString('base64')

    const requestBody = {
      BusinessShortCode: this.config.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: this.config.shortcode,
      PhoneNumber: phoneNumber,
      CallBackURL: process.env.NEXTAUTH_URL + '/api/payments/mpesa/callback',
      AccountReference: accountReference,
      TransactionDesc: transactionDesc
    }

    try {
      const response = await axios.post(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, requestBody, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      return response.data
    } catch (error) {
      console.error('STK Push failed:', error)
      throw new Error('Failed to initiate M-pesa payment')
    }
  }

  async querySTKStatus(checkoutRequestId: string) {
    const accessToken = await this.getAccessToken()
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3)
    const password = Buffer.from(`${this.config.shortcode}${this.config.passkey}${timestamp}`).toString('base64')

    const requestBody = {
      BusinessShortCode: this.config.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    }

    try {
      const response = await axios.post(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, requestBody, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      return response.data
    } catch (error) {
      console.error('STK Query failed:', error)
      throw new Error('Failed to query M-pesa payment status')
    }
  }
}

// Initialize M-pesa service
export const mpesaService = new MpesaService({
  consumerKey: process.env.MPESA_CONSUMER_KEY!,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
  environment: (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
  passkey: process.env.MPESA_PASSKEY!,
  shortcode: process.env.MPESA_SHORTCODE!
})