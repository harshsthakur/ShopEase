import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, FileText, Download, BarChart2, TrendingUp, HelpCircle } from 'lucide-react';

const SalesReports = ({ setPage }) => {
  const { getAuthHeader } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Aggregated Report Metrics
  const [report, setReport] = useState({
    totalRev: 0,
    orderCount: 0,
    avgVal: 0,
    topProduct: 'N/A',
    topCategory: 'N/A'
  });

  const [topProductsList, setTopProductsList] = useState([]);
  const [categorySummaries, setCategorySummaries] = useState([]);

  const compileReports = async () => {
    setLoading(true);
    try {
      const ordersRes = await fetch('/api/orders', { headers: getAuthHeader() });
      const orderList = ordersRes.ok ? await ordersRes.json() : [];
      setOrders(orderList);

      const productsRes = await fetch('/api/products');
      const productList = productsRes.ok ? await productsRes.json() : [];
      setProducts(productList);

      // Calculations
      const totalRev = orderList.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
      const orderCount = orderList.length;
      const avgVal = orderCount > 0 ? totalRev / orderCount : 0;

      // 1. Calculate sales count and revenue per product
      const productStats = {};
      orderList.forEach(o => {
        o.orderItems?.forEach(item => {
          const pId = item.product;
          if (!productStats[pId]) {
            productStats[pId] = {
              name: item.name,
              qtySold: 0,
              revGenerated: 0
            };
          }
          productStats[pId].qtySold += Number(item.qty || 0);
          productStats[pId].revGenerated += Number((item.qty || 0) * (item.price || 0));
        });
      });

      // Sort products by qty sold to find top product
      const productStatItems = Object.keys(productStats).map(pId => ({
        _id: pId,
        ...productStats[pId]
      })).sort((a, b) => b.qtySold - a.qtySold);

      setTopProductsList(productStatItems.slice(0, 5)); // top 5 products

      const topProduct = productStatItems.length > 0 ? productStatItems[0].name : 'N/A';

      // 2. Calculate sales count and revenue per category
      const categoryStats = {};
      orderList.forEach(o => {
        o.orderItems?.forEach(item => {
          // Find category slug in products catalog or fallback
          const catalogProd = productList.find(p => p._id === item.product);
          const cat = catalogProd ? catalogProd.category : 'electronics'; // fallback

          if (!categoryStats[cat]) {
            categoryStats[cat] = {
              name: cat.toUpperCase(),
              ordersCount: 0,
              revGenerated: 0
            };
          }
          categoryStats[cat].ordersCount += 1;
          categoryStats[cat].revGenerated += Number((item.qty || 0) * (item.price || 0));
        });
      });

      const categoryStatItems = Object.keys(categoryStats).map(catKey => ({
        slug: catKey,
        ...categoryStats[catKey]
      })).sort((a, b) => b.revGenerated - a.revGenerated);

      setCategorySummaries(categoryStatItems);

      const topCategory = categoryStatItems.length > 0 ? categoryStatItems[0].name : 'N/A';

      setReport({
        totalRev,
        orderCount,
        avgVal,
        topProduct,
        topCategory
      });

    } catch (err) {
      console.error('Error compiling sales reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    compileReports();
  }, []);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 print:bg-white print:p-0">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sales & Revenue Reports</h1>
          <p className="text-sm text-slate-500">Examine invoice earnings, popular items, and classification revenue.</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setPage('admin-dashboard')}
            className="btn-secondary py-2 px-4 text-xs font-semibold flex items-center space-x-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
          
          <button
            onClick={handlePrintReport}
            className="btn-primary py-2 px-4 text-xs font-semibold flex items-center space-x-1.5"
          >
            <Download className="h-4 w-4" />
            <span>Export / Print</span>
          </button>
        </div>
      </div>

      {/* PRINT-ONLY HEADER */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-8">
        <h1 className="text-3xl font-bold text-slate-900">ShopEase E-Commerce System Report</h1>
        <p className="text-xs text-slate-500 mt-1">Generated on: {new Date().toLocaleString()} - Confidential Internal Access</p>
      </div>

      {/* Grid of Key Analytical Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Earnings</span>
          <span className="text-xl font-extrabold text-slate-900 block">${report.totalRev?.toFixed(2)}</span>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Invoices</span>
          <span className="text-xl font-extrabold text-slate-900 block">{report.orderCount} orders</span>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Order Value</span>
          <span className="text-xl font-extrabold text-slate-900 block">${report.avgVal?.toFixed(2)}</span>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Top Performing Category</span>
          <span className="text-xl font-extrabold text-brand-600 block truncate">{report.topCategory}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 print:hidden">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Top Selling Products List */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center">
              <TrendingUp className="h-4.5 w-4.5 mr-1.5 text-brand-600" />
              Top Selling Products
            </h3>
            
            <div className="responsive-table-container">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="table-header">Product Title</th>
                    <th className="table-header">Units Sold</th>
                    <th className="table-header">Gross Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                  {topProductsList.map((tp, idx) => (
                    <tr key={tp._id}>
                      <td className="table-cell font-bold text-slate-800">
                        <span className="text-slate-400 font-semibold mr-1.5">#{idx+1}</span>
                        {tp.name}
                      </td>
                      <td className="table-cell">{tp.qtySold} units</td>
                      <td className="table-cell font-bold text-slate-900">₹{tp.revGenerated?.toFixed(2)}</td>
                    </tr>
                  ))}
                  {topProductsList.length === 0 && (
                    <tr>
                      <td colSpan="3" className="table-cell text-center text-slate-400 font-semibold py-8">No transaction data yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Categories sales breakdown */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center">
              <BarChart2 className="h-4.5 w-4.5 mr-1.5 text-brand-600" />
              Revenue By Category
            </h3>
            
            <div className="responsive-table-container">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="table-header">Category Name</th>
                    <th className="table-header">Invoice Count</th>
                    <th className="table-header">Revenue Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                  {categorySummaries.map((cat) => (
                    <tr key={cat.slug}>
                      <td className="table-cell font-bold text-slate-800 uppercase tracking-wider">{cat.slug}</td>
                      <td className="table-cell">{cat.ordersCount} line items</td>
                      <td className="table-cell font-bold text-slate-900">${cat.revGenerated?.toFixed(2)}</td>
                    </tr>
                  ))}
                  {categorySummaries.length === 0 && (
                    <tr>
                      <td colSpan="3" className="table-cell text-center text-slate-400 font-semibold py-8">No category analytics yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default SalesReports;
