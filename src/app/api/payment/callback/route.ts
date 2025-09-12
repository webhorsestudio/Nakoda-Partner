// Payment Callback API Route
import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/services/paymentService';
import { CallbackData } from '@/types/payment';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse callback data from query parameters
    const callbackData: CallbackData = {
      statusCode: searchParams.get('statusCode') || '',
      statusMessage: searchParams.get('statusMessage') || '',
      merchantTxnId: searchParams.get('merchantTxnId') || '',
      txnReferenceId: searchParams.get('txnReferenceId') || '',
      amount: parseFloat(searchParams.get('amount') || '0'),
      currency: searchParams.get('currency') || 'INR',
      handlingFee: parseFloat(searchParams.get('handlingFee') || '0'),
      taxAmount: parseFloat(searchParams.get('taxAmount') || '0'),
      mode: searchParams.get('mode') || '',
      subMode: searchParams.get('subMode') || '',
      issuerCode: searchParams.get('issuerCode') || '',
      issuerName: searchParams.get('issuerName') || '',
      signature: searchParams.get('signature') || '',
      mndtRefId: searchParams.get('mndtRefId') || '',
      mndtUmn: searchParams.get('mndtUmn') || '',
      errorCode: searchParams.get('errorCode') || '',
      errorDescription: searchParams.get('errorDescription') || '',
      paymentDueDate: searchParams.get('paymentDueDate') || '',
      transactionStartDate: searchParams.get('transactionStartDate') || '',
      transactionEndDate: searchParams.get('transactionEndDate') || '',
      rrn: searchParams.get('rrn') || '',
      subMerchantPayInfo: searchParams.get('subMerchantPayInfo') || '',
      merchantOrderId: searchParams.get('merchantOrderId') || '',
      authCode: searchParams.get('authCode') || '',
      payerVpa: searchParams.get('payerVpa') || '',
      accountType: searchParams.get('accountType') || '',
      maskedCardNo: searchParams.get('maskedCardNo') || '',
    };

    return await processCallback(callbackData);
  } catch (error) {
    console.error('GET Callback API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'CALLBACK_ERROR',
        message: 'Error processing callback' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Parse callback data
    const callbackData: CallbackData = {
      statusCode: body.statusCode,
      statusMessage: body.statusMessage,
      merchantTxnId: body.merchantTxnId,
      txnReferenceId: body.txnReferenceId,
      amount: body.amount,
      currency: body.currency,
      handlingFee: body.handlingFee,
      taxAmount: body.taxAmount,
      mode: body.mode,
      subMode: body.subMode,
      issuerCode: body.issuerCode,
      issuerName: body.issuerName,
      signature: body.signature,
      mndtRefId: body.mndtRefId,
      mndtUmn: body.mndtUmn,
      errorCode: body.errorCode,
      errorDescription: body.errorDescription,
      paymentDueDate: body.paymentDueDate,
      transactionStartDate: body.transactionStartDate,
      transactionEndDate: body.transactionEndDate,
      rrn: body.rrn,
      subMerchantPayInfo: body.subMerchantPayInfo,
      merchantOrderId: body.merchantOrderId,
      authCode: body.authCode,
      payerVpa: body.payerVpa,
      accountType: body.accountType,
      maskedCardNo: body.maskedCardNo,
    };

    return await processCallback(callbackData);
  } catch (error) {
    console.error('POST Callback API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'CALLBACK_ERROR',
        message: 'Error processing callback' 
      },
      { status: 500 }
    );
  }
}

async function processCallback(callbackData: CallbackData) {
  try {
    console.log('=== PAYMENT CALLBACK DEBUG ===');
    console.log('Callback data received:', JSON.stringify(callbackData, null, 2));
    console.log('==============================');

    // Validate callback data first
    if (!callbackData.merchantTxnId || !callbackData.statusCode) {
      console.log('Invalid callback data - missing required fields');
      return NextResponse.json({
        success: false,
        message: 'Invalid callback data'
      }, { status: 400 });
    }

    // Only process successful payments
    if (callbackData.statusCode !== 'SPG-0000' && callbackData.statusCode !== '00' && callbackData.statusCode !== 'SUCCESS') {
      console.log('Payment failed or cancelled:', callbackData.statusMessage);
      return NextResponse.json({
        success: true,
        message: 'Payment failed or cancelled - no action taken'
      });
    }

    // Additional validation - check if this is a real payment callback
    if (!callbackData.amount || callbackData.amount <= 0) {
      console.log('Invalid amount in callback - ignoring');
      return NextResponse.json({
        success: true,
        message: 'Invalid amount - no action taken'
      });
    }

    // Check if we have payment method details
    if (!callbackData.mode && !callbackData.subMode) {
      console.log('No payment method details - ignoring callback');
      return NextResponse.json({
        success: true,
        message: 'No payment method details - no action taken'
      });
    }

    // Check if this is a real payment callback (not just form loading)
    if (!callbackData.txnReferenceId && !callbackData.authCode) {
      console.log('No transaction reference or auth code - ignoring callback');
      return NextResponse.json({
        success: true,
        message: 'No transaction reference - no action taken'
      });
    }

    // Process callback
    const result = await paymentService.processCallback(callbackData);

    // Extract partner ID from UDF1 (partner_id:123) or from merchantTxnId pattern
    let partnerId: number | null = null;
    
    // Try to extract from UDF1 first
    const udf1Match = callbackData.merchantTxnId?.match(/partner_id:(\d+)/);
    if (udf1Match) {
      partnerId = parseInt(udf1Match[1]);
    } else {
      // Try to extract from merchantTxnId pattern (TXN_timestamp_random)
      // Look for partner ID in the transaction metadata or use a default approach
      console.log('Could not extract partner ID from UDF1, checking transaction metadata');
      
      // Try to find partner by merchantTxnId in database
      try {
        const { data: transaction, error: txnError } = await supabase
          .from('wallet_transactions')
          .select('partner_id')
          .eq('reference_id', callbackData.merchantTxnId)
          .single();
          
        if (!txnError && transaction) {
          partnerId = transaction.partner_id;
          console.log('Found partner ID from transaction record:', partnerId);
        }
      } catch (error) {
        console.error('Error looking up partner ID from transaction:', error);
      }
    }

    if (partnerId && result.success && result.amount && result.amount > 0) {
      // Update wallet balance and create transaction record
      try {
        // Get current wallet balance
        const { data: partner, error: partnerError } = await supabase
          .from('partners')
          .select('wallet_balance, available_balance')
          .eq('id', partnerId)
          .single();

        if (partnerError) {
          console.error('Error fetching partner wallet:', partnerError);
        } else {
          // Calculate new balance
          const currentBalance = partner.wallet_balance || 0;
          const newBalance = currentBalance + result.amount!;

          // Update partner wallet balance
          const { error: updateError } = await supabase
            .from('partners')
            .update({
              wallet_balance: newBalance,
              available_balance: newBalance,
              last_transaction_at: new Date().toISOString()
            })
            .eq('id', partnerId);

          if (updateError) {
            console.error('Error updating partner wallet:', updateError);
          }

          // Create wallet transaction record
          const { error: transactionError } = await supabase
            .from('wallet_transactions')
            .insert({
              partner_id: partnerId,
              transaction_type: 'credit',
              amount: result.amount!,
              description: `Wallet top-up via payment gateway - ${callbackData.mode} ${callbackData.subMode}`,
              status: 'completed',
              reference_id: result.referenceId,
              metadata: {
                payment_mode: callbackData.mode,
                payment_sub_mode: callbackData.subMode,
                issuer_code: callbackData.issuerCode,
                issuer_name: callbackData.issuerName,
                auth_code: callbackData.authCode,
                rrn: callbackData.rrn,
                handling_fee: callbackData.handlingFee,
                tax_amount: callbackData.taxAmount,
                payer_vpa: callbackData.payerVpa,
                account_type: callbackData.accountType,
                masked_card_no: callbackData.maskedCardNo,
                merchant_txn_id: callbackData.merchantTxnId,
                txn_reference_id: callbackData.txnReferenceId,
                callback_received_at: new Date().toISOString()
              }
            });

          if (transactionError) {
            console.error('Error creating wallet transaction:', transactionError);
          }
        }
      } catch (error) {
        console.error('Error processing wallet update:', error);
      }
    }

    // Return success response to Axis PG
    return NextResponse.json({
      success: true,
      message: 'Callback processed successfully'
    });

  } catch (error) {
    console.error('Callback processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'CALLBACK_ERROR',
        message: 'Error processing callback' 
      },
      { status: 500 }
    );
  }
}
