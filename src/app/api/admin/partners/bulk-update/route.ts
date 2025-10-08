import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken } from '@/lib/auth';
import * as XLSX from 'xlsx';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface ExcelPartnerData {
  id?: number;
  vendor_id: string;
  vendor_company: string;
  phone_no: string;
  city: string;
  services: string;
  vendor_status: string;
}

interface UpdateResult {
  success: boolean;
  message: string;
  updated: number;
  created: number;
  duplicatesRemoved: number;
  errors: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.error },
        { status: 401 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json({ error: 'Only Excel files (.xlsx, .xls) are allowed' }, { status: 400 });
    }

    // Read and parse Excel file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Validate Excel structure
    const requiredColumns = ['vendor_id', 'vendor_compnay', 'phone_no', 'city', 'services', 'vendor_status'];
    const actualColumns = Object.keys(jsonData[0] || {});
    
    console.log('Excel columns found:', actualColumns);
    console.log('Required columns:', requiredColumns);
    
    const missingColumns = requiredColumns.filter(col => !actualColumns.includes(col));
    if (missingColumns.length > 0) {
      return NextResponse.json({ 
        error: `Missing required columns: ${missingColumns.join(', ')}. Found columns: ${actualColumns.join(', ')}` 
      }, { status: 400 });
    }

interface ExcelRowData {
  [key: string]: string | number | undefined;
}

    // Process the data
    const excelData: ExcelPartnerData[] = (jsonData as ExcelRowData[]).map((row: ExcelRowData) => ({
      vendor_id: String(row.vendor_id || '').trim(),
      vendor_company: String(row.vendor_compnay || '').trim(),
      phone_no: String(row.phone_no || '').trim(),
      city: String(row.city || '').trim(),
      services: String(row.services || '').trim(),
      vendor_status: String(row.vendor_status || 'active').trim()
    })).filter(row => row.vendor_id); // Filter out rows without vendor_id

    if (excelData.length === 0) {
      return NextResponse.json({ error: 'No valid data found in Excel file' }, { status: 400 });
    }

    // Start transaction-like processing
    const result: UpdateResult = {
      success: true,
      message: 'Partners updated successfully',
      updated: 0,
      created: 0,
      duplicatesRemoved: 0,
      errors: []
    };

    // Process each partner
    for (const excelPartner of excelData) {
      try {
        // Check if partner exists by vendor_id
        const { data: existingPartnerByVendorId, error: vendorIdFetchError } = await supabase
          .from('partners')
          .select('id, vendor_id, name, mobile, city, service_type, status')
          .eq('vendor_id', excelPartner.vendor_id)
          .is('deleted_at', null)
          .single();

        if (vendorIdFetchError && vendorIdFetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
          result.errors.push(`Error fetching partner by vendor_id ${excelPartner.vendor_id}: ${vendorIdFetchError.message}`);
          continue;
        }

        // Prepare partner data
        const partnerData = {
          name: excelPartner.vendor_company,
          mobile: excelPartner.phone_no,
          city: excelPartner.city,
          service_type: excelPartner.services,
          status: excelPartner.vendor_status.toLowerCase() === 'active' ? 'active' : 'inactive',
          vendor_id: excelPartner.vendor_id,
          updated_at: new Date().toISOString()
        };

        if (existingPartnerByVendorId) {
          // Partner exists by vendor_id - update all data
          const { error: updateError } = await supabase
            .from('partners')
            .update(partnerData)
            .eq('id', existingPartnerByVendorId.id);

          if (updateError) {
            result.errors.push(`Error updating partner ${excelPartner.vendor_id}: ${updateError.message}`);
          } else {
            result.updated++;
          }
        } else {
          // Partner doesn't exist - create new partner with all data
          const { error: createError } = await supabase
            .from('partners')
            .insert({
              ...partnerData,
              created_at: new Date().toISOString()
            });

          if (createError) {
            result.errors.push(`Error creating partner ${excelPartner.vendor_id}: ${createError.message}`);
          } else {
            result.created++;
          }
        }
      } catch (error) {
        result.errors.push(`Unexpected error processing partner ${excelPartner.vendor_id}: ${error}`);
      }
    }

    // Set success status
    result.success = result.errors.length === 0;
    if (result.errors.length > 0) {
      result.message = `Processed with ${result.errors.length} errors`;
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error processing Excel file:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
