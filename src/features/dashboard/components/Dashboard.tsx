import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, BanknotesIcon, ChartBarIcon } from '@heroicons/react/24/outline'

export const Dashboard = () => {
  const chartData = [
    { date: 'Jan', value: 110000 },
    { date: 'Feb', value: 115000 },
    { date: 'Mar', value: 112000 },
    { date: 'Apr', value: 118000 },
    { date: 'May', value: 122000 },
    { date: 'Jun', value: 125430 },
  ]

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-slate-600">Welcome back! Here's your portfolio overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Portfolio Value */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Portfolio Value</h3>
              <BanknotesIcon className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">$125,430</p>
            <div className="flex items-center mt-2 text-sm text-emerald-600">
              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              <span>+12.5% this month</span>
            </div>
          </div>

          {/* Total Gain/Loss */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Total Gain/Loss</h3>
              <ArrowTrendingUpIcon className="h-8 w-8 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-emerald-600">+$15,430</p>
            <p className="text-sm text-slate-600 mt-2">+14.02% overall</p>
          </div>

          {/* Today's Change */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Today's Change</h3>
              <ArrowTrendingDownIcon className="h-8 w-8 text-rose-600" />
            </div>
            <p className="text-3xl font-bold text-rose-600">-$1,234</p>
            <div className="flex items-center mt-2 text-sm text-rose-600">
              <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
              <span>-0.98% today</span>
            </div>
          </div>

          {/* Active Positions */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Active Positions</h3>
              <ChartBarIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">24</p>
            <p className="text-sm text-slate-600 mt-2">Across 8 sectors</p>
          </div>
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Performance Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Portfolio Performance</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Performers</h3>
            <div className="space-y-4">
              {[
                { symbol: 'VIC', name: 'VIC Corporation', change: '+5.2%', color: 'emerald' },
                { symbol: 'VNM', name: 'VNM Corporation', change: '+3.8%', color: 'emerald' },
                { symbol: 'VCB', name: 'VCB Corporation', change: '-2.1%', color: 'rose' },
              ].map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-900">{stock.symbol}</p>
                    <p className="text-sm text-slate-600">{stock.name}</p>
                  </div>
                  <span className={`text-${stock.color}-600 font-semibold`}>{stock.change}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-3xl">🤖</span>
            <h3 className="text-xl font-semibold">AI Recommendations</h3>
          </div>
          <p className="text-blue-100 mb-4">
            Based on market analysis and your portfolio, our AI suggests considering these opportunities:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="font-semibold mb-1">Buy Signal: VHM</p>
              <p className="text-sm text-blue-100">Strong upward momentum detected</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="font-semibold mb-1">Hold: VIC</p>
              <p className="text-sm text-blue-100">Stable performance expected</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="font-semibold mb-1">Sell Alert: VRE</p>
              <p className="text-sm text-blue-100">Consider taking profits</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

