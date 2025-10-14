// Error Monitoring and Alerting System
import { environmentConfig } from '@/config/environment';

export interface ErrorAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'critical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  details: Record<string, unknown>;
  timestamp: string;
  source: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  timeWindow: number; // in minutes
  enabled: boolean;
  notificationChannels: string[];
}

export class ErrorMonitor {
  private static alerts: ErrorAlert[] = [];
  private static alertRules: AlertRule[] = [
    {
      id: 'high_error_rate',
      name: 'High Error Rate',
      condition: 'error_rate > threshold',
      threshold: 5, // 5% error rate
      timeWindow: 15, // 15 minutes
      enabled: true,
      notificationChannels: ['email', 'slack']
    },
    {
      id: 'payment_failures',
      name: 'Payment Failures',
      condition: 'payment_failures > threshold',
      threshold: 10, // 10 failures
      timeWindow: 30, // 30 minutes
      enabled: true,
      notificationChannels: ['email', 'slack', 'sms']
    },
    {
      id: 'webhook_failures',
      name: 'Webhook Failures',
      condition: 'webhook_failures > threshold',
      threshold: 5, // 5 failures
      timeWindow: 10, // 10 minutes
      enabled: true,
      notificationChannels: ['email', 'slack']
    },
    {
      id: 'database_errors',
      name: 'Database Errors',
      condition: 'database_errors > threshold',
      threshold: 3, // 3 errors
      timeWindow: 5, // 5 minutes
      enabled: true,
      notificationChannels: ['email', 'slack', 'sms']
    }
  ];

  /**
   * Log an error event
   */
  static logError(
    error: Error | string,
    context: Record<string, unknown> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    source: string = 'unknown'
  ): void {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    const alert: ErrorAlert = {
      id: this.generateAlertId(),
      type: 'error',
      severity,
      title: `Error in ${source}`,
      message: errorMessage,
      details: {
        ...context,
        stack: errorStack,
        timestamp: new Date().toISOString(),
        environment: environmentConfig.isProduction ? 'production' : 'development'
      },
      timestamp: new Date().toISOString(),
      source,
      resolved: false
    };

    this.alerts.push(alert);
    this.checkAlertRules(alert);
    this.logToConsole(alert);
  }

  /**
   * Log a warning event
   */
  static logWarning(
    message: string,
    context: Record<string, unknown> = {},
    source: string = 'unknown'
  ): void {
    const alert: ErrorAlert = {
      id: this.generateAlertId(),
      type: 'warning',
      severity: 'medium',
      title: `Warning in ${source}`,
      message,
      details: {
        ...context,
        timestamp: new Date().toISOString(),
        environment: environmentConfig.isProduction ? 'production' : 'development'
      },
      timestamp: new Date().toISOString(),
      source,
      resolved: false
    };

    this.alerts.push(alert);
    this.checkAlertRules(alert);
    this.logToConsole(alert);
  }

  /**
   * Log a critical event
   */
  static logCritical(
    message: string,
    context: Record<string, unknown> = {},
    source: string = 'unknown'
  ): void {
    const alert: ErrorAlert = {
      id: this.generateAlertId(),
      type: 'critical',
      severity: 'critical',
      title: `CRITICAL: ${source}`,
      message,
      details: {
        ...context,
        timestamp: new Date().toISOString(),
        environment: environmentConfig.isProduction ? 'production' : 'development'
      },
      timestamp: new Date().toISOString(),
      source,
      resolved: false
    };

    this.alerts.push(alert);
    this.checkAlertRules(alert);
    this.logToConsole(alert);
    this.sendImmediateNotification(alert);
  }

  /**
   * Log payment-related errors
   */
  static logPaymentError(
    error: Error | string,
    paymentId?: string,
    partnerId?: string,
    amount?: number
  ): void {
    this.logError(error, {
      paymentId,
      partnerId,
      amount,
      category: 'payment'
    }, 'high', 'payment_system');
  }

  /**
   * Log webhook-related errors
   */
  static logWebhookError(
    error: Error | string,
    webhookEvent?: string,
    signature?: string
  ): void {
    this.logError(error, {
      webhookEvent,
      signature: signature ? signature.substring(0, 10) + '...' : undefined,
      category: 'webhook'
    }, 'high', 'webhook_system');
  }

  /**
   * Log database-related errors
   */
  static logDatabaseError(
    error: Error | string,
    operation?: string,
    table?: string
  ): void {
    this.logError(error, {
      operation,
      table,
      category: 'database'
    }, 'critical', 'database_system');
  }

  /**
   * Check alert rules and trigger notifications
   */
  private static checkAlertRules(alert: ErrorAlert): void {
    if (!environmentConfig.isProduction) {
      return; // Skip alert rules in development
    }

    const now = new Date();
    const timeWindowMs = 15 * 60 * 1000; // 15 minutes default

    // Check for high error rate
    const recentErrors = this.alerts.filter(a => 
      a.type === 'error' && 
      new Date(a.timestamp) > new Date(now.getTime() - timeWindowMs)
    );

    if (recentErrors.length > 10) { // More than 10 errors in 15 minutes
      this.triggerAlert('high_error_rate', {
        errorCount: recentErrors.length,
        timeWindow: '15 minutes',
        recentErrors: recentErrors.slice(-5) // Last 5 errors
      });
    }

    // Check for payment failures
    const recentPaymentErrors = this.alerts.filter(a => 
      a.source === 'payment_system' && 
      new Date(a.timestamp) > new Date(now.getTime() - 30 * 60 * 1000) // 30 minutes
    );

    if (recentPaymentErrors.length > 5) {
      this.triggerAlert('payment_failures', {
        failureCount: recentPaymentErrors.length,
        timeWindow: '30 minutes',
        recentFailures: recentPaymentErrors.slice(-3)
      });
    }

    // Check for webhook failures
    const recentWebhookErrors = this.alerts.filter(a => 
      a.source === 'webhook_system' && 
      new Date(a.timestamp) > new Date(now.getTime() - 10 * 60 * 1000) // 10 minutes
    );

    if (recentWebhookErrors.length > 3) {
      this.triggerAlert('webhook_failures', {
        failureCount: recentWebhookErrors.length,
        timeWindow: '10 minutes',
        recentFailures: recentWebhookErrors.slice(-3)
      });
    }
  }

  /**
   * Trigger an alert notification
   */
  private static triggerAlert(ruleId: string, context: Record<string, unknown>): void {
    const rule = this.alertRules.find(r => r.id === ruleId);
    if (!rule || !rule.enabled) {
      return;
    }

    const alert: ErrorAlert = {
      id: this.generateAlertId(),
      type: 'critical',
      severity: 'high',
      title: `Alert: ${rule.name}`,
      message: `Alert rule "${rule.name}" triggered`,
      details: {
        ruleId,
        context,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      source: 'alert_system',
      resolved: false
    };

    this.alerts.push(alert);
    this.sendNotification(alert, rule.notificationChannels);
  }

  /**
   * Send notification through various channels
   */
  private static async sendNotification(
    alert: ErrorAlert, 
    channels: string[]
  ): Promise<void> {
    for (const channel of channels) {
      try {
        switch (channel) {
          case 'email':
            await this.sendEmailNotification(alert);
            break;
          case 'slack':
            await this.sendSlackNotification(alert);
            break;
          case 'sms':
            await this.sendSMSNotification(alert);
            break;
        }
      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error);
      }
    }
  }

  /**
   * Send immediate notification for critical alerts
   */
  private static async sendImmediateNotification(alert: ErrorAlert): Promise<void> {
    // Send to all channels immediately for critical alerts
    await this.sendNotification(alert, ['email', 'slack', 'sms']);
  }

  /**
   * Send email notification
   */
  private static async sendEmailNotification(alert: ErrorAlert): Promise<void> {
    // In a real implementation, you would integrate with an email service
    console.log(`📧 EMAIL ALERT: ${alert.title} - ${alert.message}`);
    
    // Example integration with SendGrid, AWS SES, etc.
    // await emailService.send({
    //   to: process.env.ALERT_EMAIL,
    //   subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
    //   body: this.formatEmailBody(alert)
    // });
    
    // Suppress unused parameter warning
    void alert;
  }

  /**
   * Send Slack notification
   */
  private static async sendSlackNotification(alert: ErrorAlert): Promise<void> {
    // In a real implementation, you would integrate with Slack API
    console.log(`💬 SLACK ALERT: ${alert.title} - ${alert.message}`);
    
    // Example integration with Slack
    // await slackService.sendMessage({
    //   channel: process.env.SLACK_ALERT_CHANNEL,
    //   text: `🚨 *${alert.title}*\n${alert.message}`,
    //   attachments: [{
    //     color: this.getSeverityColor(alert.severity),
    //     fields: [{
    //       title: 'Details',
    //       value: JSON.stringify(alert.details, null, 2),
    //       short: false
    //     }]
    //   }]
    // });
  }

  /**
   * Send SMS notification
   */
  private static async sendSMSNotification(alert: ErrorAlert): Promise<void> {
    // In a real implementation, you would integrate with SMS service
    console.log(`📱 SMS ALERT: ${alert.title} - ${alert.message}`);
    
    // Example integration with Twilio, AWS SNS, etc.
    // await smsService.send({
    //   to: process.env.ALERT_PHONE,
    //   message: `[${alert.severity.toUpperCase()}] ${alert.title}: ${alert.message}`
    // });
  }

  /**
   * Get severity color for notifications
   */
  private static getSeverityColor(severity: string): string {
    const colors = {
      low: '#36a64f',    // Green
      medium: '#ff9500', // Orange
      high: '#ff0000',   // Red
      critical: '#8b0000' // Dark Red
    };
    return colors[severity as keyof typeof colors] || '#808080';
  }

  /**
   * Format email body
   */
  private static formatEmailBody(alert: ErrorAlert): string {
    return `
      <h2>${alert.title}</h2>
      <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
      <p><strong>Message:</strong> ${alert.message}</p>
      <p><strong>Source:</strong> ${alert.source}</p>
      <p><strong>Timestamp:</strong> ${alert.timestamp}</p>
      <h3>Details:</h3>
      <pre>${JSON.stringify(alert.details, null, 2)}</pre>
    `;
  }

  /**
   * Log to console with appropriate level
   */
  private static logToConsole(alert: ErrorAlert): void {
    const timestamp = new Date(alert.timestamp).toISOString();
    const logMessage = `[${timestamp}] ${alert.severity.toUpperCase()} - ${alert.title}: ${alert.message}`;

    switch (alert.severity) {
      case 'critical':
        console.error(`🚨 ${logMessage}`);
        break;
      case 'high':
        console.error(`❌ ${logMessage}`);
        break;
      case 'medium':
        console.warn(`⚠️ ${logMessage}`);
        break;
      case 'low':
        console.info(`ℹ️ ${logMessage}`);
        break;
    }
  }

  /**
   * Generate unique alert ID
   */
  private static generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get recent alerts
   */
  static getRecentAlerts(hours: number = 24): ErrorAlert[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.alerts.filter(alert => new Date(alert.timestamp) > cutoff);
  }

  /**
   * Get unresolved alerts
   */
  static getUnresolvedAlerts(): ErrorAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Resolve an alert
   */
  static resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  /**
   * Get alert statistics
   */
  static getAlertStatistics(): Record<string, unknown> {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const last24HoursAlerts = this.alerts.filter(a => new Date(a.timestamp) > last24Hours);
    const last7DaysAlerts = this.alerts.filter(a => new Date(a.timestamp) > last7Days);

    return {
      total: this.alerts.length,
      unresolved: this.getUnresolvedAlerts().length,
      last24Hours: {
        total: last24HoursAlerts.length,
        bySeverity: this.groupBySeverity(last24HoursAlerts),
        byType: this.groupByType(last24HoursAlerts)
      },
      last7Days: {
        total: last7DaysAlerts.length,
        bySeverity: this.groupBySeverity(last7DaysAlerts),
        byType: this.groupByType(last7DaysAlerts)
      }
    };
  }

  /**
   * Group alerts by severity
   */
  private static groupBySeverity(alerts: ErrorAlert[]): Record<string, number> {
    return alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Group alerts by type
   */
  private static groupByType(alerts: ErrorAlert[]): Record<string, number> {
    return alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

// Global error handler
export const globalErrorHandler = (error: Error, context?: Record<string, unknown>) => {
  ErrorMonitor.logError(error, context, 'high', 'global_handler');
};

// Unhandled promise rejection handler
export const unhandledRejectionHandler = (reason: unknown, promise: Promise<unknown>) => {
  ErrorMonitor.logCritical(
    `Unhandled Promise Rejection: ${reason}`,
    { promise: promise.toString() },
    'global_handler'
  );
};

// API endpoint for error monitoring
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'stats';
    const hours = parseInt(url.searchParams.get('hours') || '24');

    switch (action) {
      case 'stats':
        const stats = ErrorMonitor.getAlertStatistics();
        return Response.json({ success: true, data: stats });

      case 'recent':
        const recentAlerts = ErrorMonitor.getRecentAlerts(hours);
        return Response.json({ success: true, data: recentAlerts });

      case 'unresolved':
        const unresolvedAlerts = ErrorMonitor.getUnresolvedAlerts();
        return Response.json({ success: true, data: unresolvedAlerts });

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Error monitoring API error:', error);
    return Response.json({
      error: 'Failed to process request',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
