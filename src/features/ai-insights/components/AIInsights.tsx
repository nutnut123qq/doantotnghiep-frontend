import { Tab } from '@headlessui/react'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from '@heroicons/react/24/outline'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export const AIInsights = () => {
  const insights = [
    {
      id: '1',
      type: 'buy',
      symbol: 'VHM',
      title: 'Strong Buy Signal Detected',
      description: 'Technical indicators show strong upward momentum with RSI at 45 and MACD crossover.',
      confidence: 85,
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      type: 'hold',
      symbol: 'VIC',
      title: 'Maintain Current Position',
      description: 'Stock showing stable performance. Market sentiment remains positive.',
      confidence: 72,
      timestamp: '5 hours ago',
    },
    {
      id: '3',
      type: 'sell',
      symbol: 'VRE',
      title: 'Consider Taking Profits',
      description: 'Stock has reached resistance level. Overbought conditions detected.',
      confidence: 78,
      timestamp: '1 day ago',
    },
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'buy': return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' }
      case 'sell': return { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' }
      case 'hold': return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' }
      default: return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' }
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'buy': return <ArrowTrendingUpIcon className="h-6 w-6" />
      case 'sell': return <ArrowTrendingDownIcon className="h-6 w-6" />
      case 'hold': return <MinusIcon className="h-6 w-6" />
      default: return <ArrowTrendingUpIcon className="h-6 w-6" />
    }
  }

  const categories = {
    'All Insights': insights,
    'Buy Signals': insights.filter(i => i.type === 'buy'),
    'Sell Signals': insights.filter(i => i.type === 'sell'),
    'Hold Recommendations': insights.filter(i => i.type === 'hold'),
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            AI Insights
          </h1>
          <p className="text-slate-600">AI-powered market analysis and trading recommendations</p>
        </div>

        {/* AI Status Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-3xl">🤖</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">AI Analysis Engine</h3>
                <p className="text-blue-100">Last updated: 5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Active</span>
            </div>
          </div>
        </div>

        {/* Insights with Tabs */}
        <Tab.Group>
          <Tab.List className="flex space-x-2 rounded-xl bg-white p-2 shadow-lg border border-slate-200 mb-6">
            {Object.keys(categories).map((category) => (
              <Tab
                key={category}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all',
                    'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60',
                    selected
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-blue-600'
                  )
                }
              >
                {category}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            {Object.values(categories).map((categoryInsights, idx) => (
              <Tab.Panel key={idx} className="space-y-6">
                {categoryInsights.map((insight) => {
                  const colors = getTypeColor(insight.type)
                  return (
                    <div key={insight.id} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center ${colors.text}`}>
                              {getTypeIcon(insight.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} uppercase`}>
                                  {insight.type}
                                </span>
                                <span className="text-lg font-bold text-slate-900">{insight.symbol}</span>
                              </div>
                              <h3 className="text-xl font-semibold text-slate-900 mb-2">{insight.title}</h3>
                              <p className="text-slate-600">{insight.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-slate-500 mb-2">{insight.timestamp}</div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-slate-600">Confidence:</span>
                              <span className={`text-lg font-bold ${colors.text}`}>{insight.confidence}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Confidence Bar */}
                        <div className="mb-4">
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className={`${colors.bg.replace('100', '500')} h-2 rounded-full transition-all duration-500`}
                              style={{ '--confidence-width': `${insight.confidence}%`, width: `var(--confidence-width)` } as React.CSSProperties}
                            ></div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-3">
                          <button className={`px-4 py-2 ${colors.bg.replace('100', '600')} text-white rounded-lg font-medium hover:shadow-lg transition-all`}>
                            View Details
                          </button>
                          <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>

        {/* Market Sentiment */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Market Sentiment</h3>
            <div className="text-center">
              <div className="text-5xl mb-2">😊</div>
              <p className="text-2xl font-bold text-emerald-600">Bullish</p>
              <p className="text-sm text-slate-600 mt-2">65% positive signals</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Risk Level</h3>
            <div className="text-center">
              <div className="text-5xl mb-2">⚠️</div>
              <p className="text-2xl font-bold text-amber-600">Moderate</p>
              <p className="text-sm text-slate-600 mt-2">Volatility index: 45</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Opportunities</h3>
            <div className="text-center">
              <div className="text-5xl mb-2">🎯</div>
              <p className="text-2xl font-bold text-blue-600">12 Found</p>
              <p className="text-sm text-slate-600 mt-2">Based on your criteria</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

