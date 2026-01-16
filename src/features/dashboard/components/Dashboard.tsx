import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, BanknotesIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NewsFeed } from './NewsFeed'
import { FinancialReports } from './FinancialReports'
import { TradingViewChart } from './TradingViewChart'
import { AIForecast } from './AIForecast'
import { staggerContainer, staggerItem } from '@/lib/animations'

export const Dashboard = () => {
  const chartData = [
    { date: 'Jan', value: 110000 },
    { date: 'Feb', value: 115000 },
    { date: 'Mar', value: 112000 },
    { date: 'Apr', value: 118000 },
    { date: 'May', value: 122000 },
    { date: 'Jun', value: 125430 },
  ]

  const stats = [
    {
      title: 'Portfolio Value',
      value: '$125,430',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: BanknotesIcon,
      iconColor: 'text-blue-600 dark:text-blue-400',
      description: 'this month',
    },
    {
      title: 'Total Gain/Loss',
      value: '+$15,430',
      change: '+14.02%',
      changeType: 'positive' as const,
      icon: ArrowTrendingUpIcon,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      description: 'overall',
    },
    {
      title: "Today's Change",
      value: '-$1,234',
      change: '-0.98%',
      changeType: 'negative' as const,
      icon: ArrowTrendingDownIcon,
      iconColor: 'text-rose-600 dark:text-rose-400',
      description: 'today',
    },
    {
      title: 'Active Positions',
      value: '24',
      change: null,
      changeType: null,
      icon: ChartBarIcon,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      description: 'Across 8 sectors',
    },
  ]

  const topPerformers = [
    { symbol: 'VIC', name: 'VIC Corporation', change: '+5.2%', isPositive: true },
    { symbol: 'VNM', name: 'VNM Corporation', change: '+3.8%', isPositive: true },
    { symbol: 'VCB', name: 'VCB Corporation', change: '-2.1%', isPositive: false },
  ]

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Welcome back! Here's your portfolio overview</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <motion.div key={stat.title} variants={staggerItem}>
                <Card className="hover:shadow-xl transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardDescription>{stat.title}</CardDescription>
                    <Icon className={`h-8 w-8 ${stat.iconColor}`} />
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-3xl mb-2">{stat.value}</CardTitle>
                    {stat.change && (
                      <div className={`flex items-center text-sm ${
                        stat.changeType === 'positive'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {stat.changeType === 'positive' ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                        )}
                        <span>{stat.change} {stat.description}</span>
                      </div>
                    )}
                    {!stat.change && (
                      <p className="text-sm text-muted-foreground">{stat.description}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Charts and News Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          color: 'hsl(var(--foreground))',
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
              </CardContent>
            </Card>
          </motion.div>

          {/* News Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <NewsFeed />
          </motion.div>
        </div>

        {/* TradingView Chart & AI Forecast */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <TradingViewChart symbol="VIC" height={500} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="lg:col-span-1"
          >
            <AIForecast symbol="VIC" />
          </motion.div>
        </div>

        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topPerformers.map((stock) => (
                  <motion.div
                    key={stock.symbol}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{stock.symbol}</p>
                      <p className="text-sm text-muted-foreground">{stock.name}</p>
                    </div>
                    <Badge variant={stock.isPositive ? 'success' : 'error'}>
                      {stock.change}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 text-white">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🤖</span>
                <CardTitle className="text-white">AI Recommendations</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-blue-100 mb-4">
                Based on market analysis and your portfolio, our AI suggests considering these opportunities:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Buy Signal: VHM', description: 'Strong upward momentum detected' },
                  { title: 'Hold: VIC', description: 'Stable performance expected' },
                  { title: 'Sell Alert: VRE', description: 'Consider taking profits' },
                ].map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
                  >
                    <p className="font-semibold mb-1">{rec.title}</p>
                    <p className="text-sm text-blue-100">{rec.description}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Financial Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <FinancialReports symbol="VIC" />
        </motion.div>
      </div>
    </div>
  )
}
