/**
 * Payment Mode Extraction Utility
 * Extracts payment mode from order title
 */

export type PaymentMode = 'COD' | 'online';

/**
 * Extract payment mode from order title
 * @param title - The order title containing mode information
 * @returns PaymentMode or null if not found
 */
export function extractPaymentMode(title: string | null | undefined): PaymentMode | null {
  if (!title) {
    console.log('🔍 Payment mode extraction: No title provided');
    return null;
  }

  const titleLower = title.toLowerCase();
  
  console.log('🔍 Payment mode extraction:', {
    originalTitle: title,
    lowerCaseTitle: titleLower,
    searchPatterns: {
      'mode : cod': titleLower.includes('mode : cod'),
      'mode: cod': titleLower.includes('mode: cod'),
      'mode : online': titleLower.includes('mode : online'),
      'mode: online': titleLower.includes('mode: online')
    }
  });
  
  // Check for COD mode (more flexible matching)
  if (titleLower.includes('mode : cod') || titleLower.includes('mode: cod') || titleLower.includes('cod')) {
    console.log('✅ Payment mode detected: COD');
    return 'COD';
  }
  
  // Check for online mode (more flexible matching)
  if (titleLower.includes('mode : online') || titleLower.includes('mode: online') || titleLower.includes('online')) {
    console.log('✅ Payment mode detected: online');
    return 'online';
  }
  
  console.log('❌ Payment mode not detected, defaulting to online');
  return null;
}

/**
 * Calculate balance amount based on payment mode
 * @param totalAmount - Total order amount
 * @param advanceAmount - Advance amount paid
 * @param paymentMode - Payment mode (COD or online)
 * @returns Balance amount to be paid
 */
export function calculateBalanceAmount(
  totalAmount: number, 
  advanceAmount: number, 
  paymentMode: PaymentMode | null,
  vendorAmount?: string | null
): number {
  console.log('💰 Balance calculation:', {
    totalAmount,
    advanceAmount,
    paymentMode,
    vendorAmount,
    calculation: 'Vendor Amount (No calculation needed)'
  });

  // For both COD and Online modes, use Vendor Amount directly
  if (vendorAmount) {
    const vendorAmountValue = parseFloat(vendorAmount.split('|')[0] || vendorAmount);
    console.log(`✅ Both COD and Online modes: Balance = Vendor Amount = ₹${vendorAmountValue}`);
    return vendorAmountValue;
  } else {
    // Fallback: If vendor amount is not available, use total amount
    console.log(`⚠️ Vendor amount not available, using total amount: ₹${totalAmount}`);
    return totalAmount;
  }
}
