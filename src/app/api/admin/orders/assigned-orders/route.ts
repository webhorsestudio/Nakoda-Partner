import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Admin-only authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.error },
        { status: 401 }
      );
    }

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100 records
    const search = searchParams.get('search') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    console.log(`🔍 Fetching all partners with assigned order counts - Page: ${page}, Limit: ${limit}, Search: ${search}`);

    // Fetch ALL partners (including those with 0 assigned orders)
    let query = supabaseAdmin
      .from('partners')
      .select(`
        id,
        name,
        mobile,
        email,
        service_type,
        status,
        rating,
        total_orders,
        total_revenue,
        city,
        verification_status,
        joined_date,
        last_active,
        documents_verified,
        notes
      `, { count: 'exact' });

    // Apply search filter if specified
    if (search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      query = query.or(`name.ilike.${searchTerm},mobile.ilike.${searchTerm},email.ilike.${searchTerm},service_type.ilike.${searchTerm},city.ilike.${searchTerm}`);
    }

    const { data: partners, error: partnersError, count } = await query;

    if (partnersError) {
      console.error('Error fetching partners:', partnersError);
      return NextResponse.json(
        { error: 'Failed to fetch partners', details: partnersError.message },
        { status: 500 }
      );
    }

    console.log(`✅ Found ${partners?.length || 0} partners (Total: ${count})`);

    // Get assigned order counts for ALL partners (including those with 0 assigned orders)
    const partnerIds = partners?.map(partner => partner.id) || [];
    const assignedOrderCounts: Record<number, number> = {};
    const assignedOrderDetails: Record<number, Array<{status: string; amount: number; serviceDate: string; createdAt: string}>> = {};

    // Initialize all partners with 0 assigned orders
    partnerIds.forEach(partnerId => {
      assignedOrderCounts[partnerId] = 0;
      assignedOrderDetails[partnerId] = [];
    });

    if (partnerIds.length > 0) {
      // Build order query with date filters for ALL partners
      let orderQuery = supabaseAdmin
        .from('orders')
        .select('partner_id, status, amount, service_date, created_at')
        .in('partner_id', partnerIds)
        .not('partner_id', 'is', null);

      // Apply date filters if specified
      if (dateFrom) {
        orderQuery = orderQuery.gte('service_date', `${dateFrom}T00:00:00.000Z`);
      }
      if (dateTo) {
        orderQuery = orderQuery.lte('service_date', `${dateTo}T23:59:59.999Z`);
      }

      const { data: orders, error: ordersError } = await orderQuery;

      if (ordersError) {
        console.error('Error fetching assigned orders:', ordersError);
        // Continue without order details (partners will show 0 assigned orders)
      } else {
        // Count orders per partner
        orders?.forEach(order => {
          const partnerId = order.partner_id;
          if (partnerId) {
            assignedOrderCounts[partnerId] = (assignedOrderCounts[partnerId] || 0) + 1;
            
            // Store order details for each partner
            if (!assignedOrderDetails[partnerId]) {
              assignedOrderDetails[partnerId] = [];
            }
            assignedOrderDetails[partnerId].push({
              status: order.status,
              amount: parseFloat(order.amount?.toString() || '0'),
              serviceDate: order.service_date,
              createdAt: order.created_at
            });
          }
        });
      }
    }

    // Transform partners with assigned order information
    const transformedPartners = partners?.map(partner => {
      const assignedCount = assignedOrderCounts[partner.id] || 0;
      const assignedOrders = assignedOrderDetails[partner.id] || [];
      
      // Calculate total assigned amount
      const totalAssignedAmount = assignedOrders.reduce((sum, order) => sum + order.amount, 0);
      
      // Calculate status breakdown
      const statusBreakdown = assignedOrders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        id: partner.id,
        name: partner.name,
        mobile: partner.mobile,
        email: partner.email,
        serviceType: partner.service_type,
        status: partner.status,
        rating: partner.rating || 0,
        totalOrders: partner.total_orders || 0,
        totalRevenue: partner.total_revenue || 0,
        city: partner.city,
        verificationStatus: partner.verification_status,
        joinedDate: partner.joined_date,
        lastActive: partner.last_active,
        documentsVerified: partner.documents_verified,
        notes: partner.notes,
        
        // Assigned orders information
        assignedOrdersCount: assignedCount,
        totalAssignedAmount: totalAssignedAmount,
        statusBreakdown: statusBreakdown,
        assignedOrders: assignedOrders
      };
    }) || [];

    // Sort partners by assigned order count (descending) - partners with most assigned orders first
    transformedPartners.sort((a, b) => b.assignedOrdersCount - a.assignedOrdersCount);

    // Apply pagination to sorted results
    const startIndex = offset;
    const endIndex = offset + limit;
    const paginatedPartners = transformedPartners.slice(startIndex, endIndex);

    // Calculate pagination info based on total partners
    const totalPages = Math.ceil(transformedPartners.length / limit);

    return NextResponse.json({
      success: true,
      partners: paginatedPartners,
      stats: {
        total: transformedPartners.length,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        totalAssignedOrders: Object.values(assignedOrderCounts).reduce((sum, count) => sum + count, 0)
      },
      filters: {
        search,
        dateFrom,
        dateTo
      }
    });

  } catch (error) {
    console.error('Partners with assigned orders API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
