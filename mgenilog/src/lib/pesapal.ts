import axios from 'axios'
import crypto from 'crypto'

export interface PesapalConfig {
  consumerKey: string
  consumerSecret: string
  environment: 'sandbox' | 'production'
  ipnUrl: string
}

export class PesapalService {
  private config: PesapalConfig
  private baseUrl: string

  constructor(config: PesapalConfig) {
    this.config = config
    this.baseUrl = config.environment === 'sandbox' 
      ? 'https://cybqa.pesapal.com/pesapalv3'
      : 'https://pay.pesapal.com/v3'
  }

  private async getAccessToken(): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/Auth/RequestToken`, {
        consumer_key: this.config.consumerKey,
        consumer_secret: this.config.consumerSecret
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      
      return response.data.token
    } catch (error) {
      console.error('Failed to get Pesapal access token:', error)
      throw new Error('Failed to authenticate with Pesapal')
    }
  }

  async registerIPN(url: string, ipnType: string = 'GET'): Promise<string> {
    const accessToken = await this.getAccessToken()

    try {
      const response = await axios.post(`${this.baseUrl}/api/URLSetup/RegisterIPN`, {
        url: url,
        ipn_notification_type: ipnType
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      return response.data.ipn_id
    } catch (error) {
      console.error('Failed to register IPN:', error)
      throw new Error('Failed to register IPN with Pesapal')
    }
  }

  async submitOrder(orderData: {
    id: string
    currency: string
    amount: number
    description: string
    callback_url: string
    notification_id: string
    billing_address: {
      email_address: string
      phone_number?: string
      country_code?: string
      first_name?: string
      middle_name?: string
      last_name?: string
      line_1?: string
      line_2?: string
      city?: string
      state?: string
      postal_code?: string
      zip_code?: string
    }
  }) {
    const accessToken = await this.getAccessToken()

    try {
      const response = await axios.post(`${this.baseUrl}/api/Transactions/SubmitOrderRequest`, orderData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      return response.data
    } catch (error) {
      console.error('Failed to submit order to Pesapal:', error)
      throw new Error('Failed to submit order to Pesapal')
    }
  }

  async getTransactionStatus(orderTrackingId: string) {
    const accessToken = await this.getAccessToken()

    try {
      const response = await axios.get(`${this.baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      })

      return response.data
    } catch (error) {
      console.error('Failed to get transaction status:', error)
      throw new Error('Failed to get transaction status from Pesapal')
    }
  }
}

// Initialize Pesapal service
export const pesapalService = new PesapalService({
  consumerKey: process.env.PESAPAL_CONSUMER_KEY!,
  consumerSecret: process.env.PESAPAL_CONSUMER_SECRET!,
  environment: (process.env.PESAPAL_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
  ipnUrl: process.env.PESAPAL_IPN_URL!
})