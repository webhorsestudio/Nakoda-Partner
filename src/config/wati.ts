export const WATI_CONFIG = {
  // WATI API Configuration
  BASE_URL: 'https://live-mt-server.wati.io/409125/api/v1',
  TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZDdmYzNhZS0zYzE3LTQ5YTktODhhZi1lOTkxNGE4ZDVlOTEiLCJ1bmlxdWVfbmFtZSI6InJvbWljYS5qYWluQG5ha29kYWRjcy5jb20iLCJuYW1laWQiOiJyb21pY2EuamFpbkBuYWtvZGFkY3MuY29tIiwiZW1haWwiOiJyb21pY2EuamFpbkBuYWtvZGFkY3MuY29tIiwiYXV0aF90aW1lIjoiMDIvMjQvMjAyNSAwNzozMjozNCIsInRlbmFudF9pZCI6IjQwOTEyNSIsImRiX25hbWUiOiJtdC1wcm9kLVRlbmFudHMiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBRE1JTklTVFJBVE9SIiwiZXhwIjoyNTM0MDIzMDA4MDAsImlzcyI6IkNsYXJlX0FJIiwiYXVkIjoiQ2xhcmVfQUkifQ.j_W5yALZR-qgmUSlrP93gwo0nY8TmWPcqZ3SmuZQSzU',
  
  // Template Names
  TEMPLATES: {
    PIPELINE_MESSAGE: 'pipelinecodnew2',
    FINAL_CONFIRMATION: 'finalconfirmation2025',
    PARTNER_MESSAGE: 'partnermessage'
  },
  
  // Broadcast Names
  BROADCASTS: {
    PIPELINE: 'PipelineCODonline',
    FINAL: 'Nakoda Urban Services'
  },
  
  // API Endpoints
  ENDPOINTS: {
    SEND_TEMPLATE: '/sendTemplateMessage'
  }
};

export interface WATITemplateMessage {
  template_name: string;
  parameters: Array<{
    name: string;
    value: string;
  }>;
  broadcast_name: string;
}

export interface OrderData {
  customerName: string;
  customerPhone: string;
  orderId: string;
  orderAmount: number;
  address: string;
  serviceDetails: string;
  fees: string;
  serviceDate: string;
  timeSlot: string;
  pendingPayment?: number;
  otp?: string;
}

export interface PartnerOrderData {
  customerName: string;
  partnerPhone: string;
  orderId: string;
  orderAmount: number;
  address: string;
  serviceDetails: string;
  fees: string;
  serviceDate: string;
  timeSlot: string;
  pendingPayment: number;
  otp: string;
  responsiblePerson: string;
}
