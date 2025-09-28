// Acefone API Helper Functions - AWS Signature V4 Implementation
// Based on Acefone documentation: https://docs.acefone.in/reference/introduction-to-apis

import { ACEFONE_CONFIG } from '@/config/acefone';
import crypto from 'crypto';

export interface AcefoneCallRequest {
  agent_number: string;
  destination_number: string;
  caller_id: string;
  async: string;
  custom_identifier: string;
  get_call_id: string;
}

export interface AcefoneCallResponse {
  success: boolean;
  call_id?: string;
  message?: string;
  error?: string;
}

/**
 * Generate AWS Signature Version 4 for Acefone API
 * Based on the error message indicating AWS-style authentication is required
 */
function generateAWS4Signature(
  method: string,
  uri: string,
  queryString: string,
  headers: Record<string, string>,
  payload: string,
  accessKey: string,
  secretKey: string,
  region: string = 'us-east-1',
  service: string = 'execute-api'
): string {
  const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
  const date = timestamp.substr(0, 8);
  
  // Create canonical request
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map(key => `${key.toLowerCase()}:${headers[key]}`)
    .join('\n');
  
  const signedHeaders = Object.keys(headers)
    .sort()
    .map(key => key.toLowerCase())
    .join(';');
  
  const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');
  
  const canonicalRequest = [
    method,
    uri,
    queryString,
    canonicalHeaders,
    '',
    signedHeaders,
    payloadHash
  ].join('\n');
  
  // Create string to sign
  const credentialScope = `${date}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    timestamp,
    credentialScope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex')
  ].join('\n');
  
  // Calculate signature
  const signingKey = getSigningKey(secretKey, date, region, service);
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
  
  return `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

function getSigningKey(secretKey: string, date: string, region: string, service: string): Buffer {
  const kDate = crypto.createHmac('sha256', `AWS4${secretKey}`).update(date).digest();
  const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
  const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
  return kSigning;
}

/**
 * Call Acefone API using AWS Signature V4 authentication
 * Based on the error message indicating AWS-style authentication is required
 */
export async function callAcefone(request: AcefoneCallRequest): Promise<AcefoneCallResponse> {
  try {
    console.log('📞 Calling Acefone API:', request);
    
    // Check if we have API token (this will be used as access key)
    if (!ACEFONE_CONFIG.API_TOKEN) {
      console.error('❌ No API token configured');
      return {
        success: false,
        error: 'No API token configured. Please add ACEFONE_API_TOKEN to your environment variables.'
      };
    }

    // For AWS Signature V4, we need both access key and secret key
    // The API token is the access key, and we need a secret key
    const accessKey = ACEFONE_CONFIG.API_TOKEN;
    const secretKey = ACEFONE_CONFIG.SECRET_KEY;

    console.log('🔐 Using AWS Signature V4 authentication...');

    // Prepare request payload
    const payload = JSON.stringify(request);
    const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Amz-Date': timestamp,
      'Host': 'api.acefone.in'
    };
    
    // Generate AWS Signature
    const authorization = generateAWS4Signature(
      'POST',
      '/v1/voice/click_to_call',
      '',
      headers,
      payload,
      accessKey,
      secretKey
    );
    
    // Add authorization header
    headers['Authorization'] = authorization;
    
    console.log('📞 Making request to Acefone with AWS Signature V4...');
    
    const response = await fetch('https://api.acefone.in/v1/voice/click_to_call', {
      method: 'POST',
      headers,
      body: payload
    });

    const result = await response.json();
    console.log('📞 Acefone API response:', result);

    if (response.ok) {
      return {
        success: true,
        call_id: result.call_id || result.callId,
        message: result.message || 'Call initiated successfully'
      };
    } else {
      return {
        success: false,
        error: result.message || result.error || 'Failed to initiate call'
      };
    }

  } catch (error) {
    console.error('❌ Acefone API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Format phone number for India
 */
export function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If it's 10 digits, add 91 (without +)
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  
  // If it already has country code, return as is
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return cleaned;
  }
  
  // If it already has +91, remove the +
  if (phone.startsWith('+91')) {
    return phone.substring(1);
  }
  
  // Default: add 91 (without +)
  return `91${cleaned}`;
}