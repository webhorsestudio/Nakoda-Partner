'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { sendPaymentResultToFlutter } from '@/utils/webViewUtils';

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get payment details from URL parameters
        const razorpayPaymentId = searchParams.get('razorpay_payment_id');
        const razorpayOrderId = searchParams.get('razorpay_order_id');
        const razorpaySignature = searchParams.get('razorpay_signature');
        const partnerId = searchParams.get('partner_id');
        const amount = searchParams.get('amount');

        console.log('🔄 Payment callback received:', {
          razorpayPaymentId,
          razorpayOrderId,
          partnerId,
          amount
        });

        if (!razorpayPaymentId || !razorpayOrderId || !partnerId || !amount) {
          console.error('❌ Missing required parameters in callback');
          toast.error('Payment callback failed: Missing required parameters');
          
          // Notify Flutter of failure
          if (typeof window !== 'undefined' && (window as unknown as { flutter_inappwebview?: unknown }).flutter_inappwebview) {
            sendPaymentResultToFlutter({
              success: false,
              error: 'Missing required parameters',
            });
          }
          
          // Redirect to wallet page
          setTimeout(() => {
            router.push('/partner/wallet');
          }, 2000);
          return;
        }

        // Verify payment on server
        console.log('🔄 Verifying payment on server...');
        const verifyResponse = await fetch('/api/razorpay/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          },
          body: JSON.stringify({
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature || 'webview_verification',
            partnerId: partnerId,
            amount: parseFloat(amount),
          }),
        });

        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          console.log('✅ Payment verified successfully:', verifyData);

          // Show success toast
          toast.success('Payment successful! Your wallet has been updated.', {
            duration: 4000,
            position: 'top-right',
          });

          // Send success result to Flutter
          if (typeof window !== 'undefined' && (window as unknown as { flutter_inappwebview?: unknown }).flutter_inappwebview) {
            sendPaymentResultToFlutter({
              success: true,
              paymentId: razorpayPaymentId,
              orderId: razorpayOrderId,
              amount: parseFloat(amount),
            });
            
            console.log('✅ Payment result sent to Flutter');
          }

          // Redirect to wallet page after short delay
          setTimeout(() => {
            router.push('/partner/wallet');
          }, 2000);
        } else {
          const errorData = await verifyResponse.json();
          console.error('❌ Payment verification failed:', errorData);

          toast.error(`Payment verification failed: ${errorData.message || 'Unknown error'}`, {
            duration: 5000,
            position: 'top-right',
          });

          // Send failure result to Flutter
          if (typeof window !== 'undefined' && (window as unknown as { flutter_inappwebview?: unknown }).flutter_inappwebview) {
            sendPaymentResultToFlutter({
              success: false,
              error: errorData.message || 'Payment verification failed',
            });
          }

          // Redirect to wallet page
          setTimeout(() => {
            router.push('/partner/wallet');
          }, 2000);
        }
      } catch (error) {
        console.error('❌ Error processing payment callback:', error);
        
        toast.error('Payment processing failed. Please try again.', {
          duration: 5000,
          position: 'top-right',
        });

        // Send failure result to Flutter
        if (typeof window !== 'undefined' && (window as unknown as { flutter_inappwebview?: unknown }).flutter_inappwebview) {
          sendPaymentResultToFlutter({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }

        // Redirect to wallet page
        setTimeout(() => {
          router.push('/partner/wallet');
        }, 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Processing Payment...
        </h2>
        <p className="text-gray-600">
          Please wait while we verify your payment.
        </p>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading...
          </h2>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}

