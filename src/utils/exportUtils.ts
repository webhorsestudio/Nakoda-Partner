import { ReportData, SummaryStats, ChartData } from '@/types/reports';

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Export to CSV
export const exportToCSV = (
  reportData: ReportData,
  summaryStats: SummaryStats,
  chartData: ChartData
): void => {
  // Create CSV content
  let csvContent = 'Order Reports Export\n\n';
  
  // Add summary statistics
  csvContent += 'Summary Statistics\n';
  csvContent += 'Total Orders,Total Revenue,Average Order Value,Orders This Month,Revenue This Month,Completion Rate,New Orders Today,Pending Orders\n';
  csvContent += `${summaryStats.totalOrders},${formatCurrency(summaryStats.totalRevenue)},${formatCurrency(summaryStats.averageOrderValue)},${summaryStats.ordersThisMonth},${formatCurrency(summaryStats.revenueThisMonth)},${summaryStats.completionRate}%,${summaryStats.newOrdersToday},${summaryStats.pendingOrders}\n\n`;
  
  // Add orders by status
  csvContent += 'Orders by Status\n';
  csvContent += 'Status,Count,Percentage\n';
  chartData.ordersByStatus.forEach(item => {
    csvContent += `${item.status},${item.count},${item.percentage}%\n`;
  });
  csvContent += '\n';
  
  // Add orders by city
  csvContent += 'Orders by City\n';
  csvContent += 'City,Orders,Revenue\n';
  chartData.ordersByCity.forEach(item => {
    csvContent += `${item.city},${item.orders},${formatCurrency(item.revenue)}\n`;
  });
  csvContent += '\n';
  
  // Add orders by partner
  csvContent += 'Orders by Partner\n';
  csvContent += 'Partner,Orders,Revenue\n';
  chartData.ordersByPartner.forEach(item => {
    csvContent += `${item.partner},${item.orders},${formatCurrency(item.revenue)}\n`;
  });
  csvContent += '\n';
  
  // Add revenue trend
  csvContent += 'Revenue Trend\n';
  csvContent += 'Date,Revenue,Orders\n';
  chartData.revenueTrend.forEach(item => {
    csvContent += `${formatDate(item.date)},${formatCurrency(item.revenue)},${item.orders}\n`;
  });
  csvContent += '\n';
  
  // Add detailed order data
  csvContent += 'Detailed Order Data\n';
  csvContent += 'Order Number,Customer Name,City,Partner,Status,Amount,Order Date,Completion Date,Time to Complete (days)\n';
  reportData.items.forEach(item => {
    csvContent += `${item.orderNumber},${item.customerName},${item.city},${item.partner},${item.status},${formatCurrency(item.amount)},${formatDate(item.orderDate)},${item.completionDate ? formatDate(item.completionDate) : ''},${item.timeToComplete || ''}\n`;
  });
  
  // Create and download CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `order-reports-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export to PDF (using jsPDF)
export const exportToPDF = async (
  reportData: ReportData,
  summaryStats: SummaryStats,
  chartData: ChartData
): Promise<void> => {
  try {
    // Dynamically import jsPDF to avoid SSR issues
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    // Set title
    doc.setFontSize(20);
    doc.text('Order Reports & Analytics', 20, 20);
    
    // Add summary statistics
    doc.setFontSize(14);
    doc.text('Summary Statistics', 20, 40);
    doc.setFontSize(10);
    doc.text(`Total Orders: ${summaryStats.totalOrders}`, 20, 55);
    doc.text(`Total Revenue: ${formatCurrency(summaryStats.totalRevenue)}`, 20, 65);
    doc.text(`Average Order Value: ${formatCurrency(summaryStats.averageOrderValue)}`, 20, 75);
    doc.text(`Orders This Month: ${summaryStats.ordersThisMonth}`, 20, 85);
    doc.text(`Revenue This Month: ${formatCurrency(summaryStats.revenueThisMonth)}`, 20, 95);
    doc.text(`Completion Rate: ${summaryStats.completionRate}%`, 20, 105);
    doc.text(`New Orders Today: ${summaryStats.newOrdersToday}`, 20, 115);
    doc.text(`Pending Orders: ${summaryStats.pendingOrders}`, 20, 125);
    
    // Add orders by status
    doc.setFontSize(14);
    doc.text('Orders by Status', 20, 150);
    doc.setFontSize(10);
    chartData.ordersByStatus.forEach((item, index) => {
      doc.text(`${item.status}: ${item.count} (${item.percentage}%)`, 20, 165 + (index * 10));
    });
    
    // Add detailed order data (first page only due to space constraints)
    doc.setFontSize(14);
    doc.text('Recent Orders', 20, 220);
    doc.setFontSize(8);
    doc.text('Order#', 20, 235);
    doc.text('Customer', 50, 235);
    doc.text('City', 90, 235);
    doc.text('Status', 120, 235);
    doc.text('Amount', 150, 235);
    doc.text('Date', 180, 235);
    
    // Add first few orders
    const ordersToShow = reportData.items.slice(0, 15); // Show first 15 orders
    ordersToShow.forEach((item, index) => {
      const y = 245 + (index * 8);
      if (y < 280) { // Check if we have space on this page
        doc.text(item.orderNumber, 20, y);
        doc.text(item.customerName.substring(0, 15), 50, y);
        doc.text(item.city.substring(0, 12), 90, y);
        doc.text(item.status, 120, y);
        doc.text(formatCurrency(item.amount), 150, y);
        doc.text(formatDate(item.orderDate), 180, y);
      }
    });
    
    // Save PDF
    doc.save(`order-reports-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

// Export to Excel (CSV format that opens in Excel)
export const exportToExcel = async (
  reportData: ReportData,
  summaryStats: SummaryStats,
  chartData: ChartData
): Promise<void> => {
  try {
    // Create comprehensive CSV content that can be opened in Excel
    let csvContent = 'Order Reports Export - Excel Compatible\n\n';
    
    // Summary Statistics
    csvContent += 'Summary Statistics\n';
    csvContent += 'Metric,Value\n';
    csvContent += `Total Orders,${summaryStats.totalOrders}\n`;
    csvContent += `Total Revenue,${formatCurrency(summaryStats.totalRevenue)}\n`;
    csvContent += `Average Order Value,${formatCurrency(summaryStats.averageOrderValue)}\n`;
    csvContent += `Orders This Month,${summaryStats.ordersThisMonth}\n`;
    csvContent += `Revenue This Month,${formatCurrency(summaryStats.revenueThisMonth)}\n`;
    csvContent += `Completion Rate,${summaryStats.completionRate}%\n`;
    csvContent += `New Orders Today,${summaryStats.newOrdersToday}\n`;
    csvContent += `Pending Orders,${summaryStats.pendingOrders}\n\n`;
    
    // Orders by Status
    csvContent += 'Orders by Status\n';
    csvContent += 'Status,Count,Percentage\n';
    chartData.ordersByStatus.forEach(item => {
      csvContent += `${item.status},${item.count},${item.percentage}%\n`;
    });
    csvContent += '\n';
    
    // Orders by City
    csvContent += 'Orders by City\n';
    csvContent += 'City,Orders,Revenue\n';
    chartData.ordersByCity.forEach(item => {
      csvContent += `${item.city},${item.orders},${formatCurrency(item.revenue)}\n`;
    });
    csvContent += '\n';
    
    // Orders by Partner
    csvContent += 'Orders by Partner\n';
    csvContent += 'Partner,Orders,Revenue\n';
    chartData.ordersByPartner.forEach(item => {
      csvContent += `${item.partner},${item.orders},${formatCurrency(item.revenue)}\n`;
    });
    csvContent += '\n';
    
    // Revenue Trend
    csvContent += 'Revenue Trend\n';
    csvContent += 'Date,Revenue,Orders\n';
    chartData.revenueTrend.forEach(item => {
      csvContent += `${formatDate(item.date)},${formatCurrency(item.revenue)},${item.orders}\n`;
    });
    csvContent += '\n';
    
    // Detailed Order Data
    csvContent += 'Detailed Order Data\n';
    csvContent += 'Order Number,Customer Name,City,Partner,Status,Amount,Order Date,Completion Date,Time to Complete (days)\n';
    reportData.items.forEach(item => {
      csvContent += `${item.orderNumber},${item.customerName},${item.city},${item.partner},${item.status},${formatCurrency(item.amount)},${formatDate(item.orderDate)},${item.completionDate ? formatDate(item.completionDate) : ''},${item.timeToComplete || ''}\n`;
    });
    
    // Create and download CSV file with .xlsx extension so it opens in Excel
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `order-reports-${new Date().toISOString().split('T')[0]}.xlsx`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  } catch (error) {
    console.error('Error generating Excel-compatible CSV file:', error);
    throw new Error('Failed to generate Excel file');
  }
};