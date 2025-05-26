import { useState, useEffect } from 'react';

// Define currency options
const currencyOptions = [
  { value: 'USD', label: 'USD - United States Dollar', symbol: '$' },
  { value: 'CAD', label: 'CAD - Canadian Dollar', symbol: 'C$' },
  { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
  { value: 'GBP', label: 'GBP - British Pound', symbol: '£' },
  { value: 'AED', label: 'AED - UAE Dirham', symbol: 'د.إ' }
];

const ColdEmailROICalculator = () => {
  // Campaign metrics state
  const [campaignMetrics, setCampaignMetrics] = useState({
    contactsReached: 10000,
    replyRate: 2, // percentage
    positiveReplyRate: 20, // percentage of replies
    bookingRate: 20, // percentage of positive replies
    showUpRate: 80, // percentage of bookings
    closingRate: 20, // percentage of show-ups
    customerLTV: 10000, // initial value, currency will be applied
    metricsTimeframe: 'monthly' // 'total' or 'monthly'
  });

  // Cost model state
  const [costModel, setCostModel] = useState({
    setupFee: 1500, // initial value
    retainerCost: 3000, // per month
    payPerCallFee: 0, // per call
    campaignDuration: 3, // months
    revenueShare: 0, // percentage
    useRevenueShare: false, // toggle for revenue share
  });

  // Selected currency state
  const [selectedCurrency, setSelectedCurrency] = useState(currencyOptions[0].value); // Default to USD

  // Calculated metrics state
  const [calculatedMetrics, setCalculatedMetrics] = useState({
    effectiveContacts: 30000,
    replies: 600,
    positiveReplies: 120,
    bookings: 24,
    showUps: 19,
    customers: 4,
    totalRevenue: 40000,
    totalCost: 10500,
    roi: 29500,
    roiPercentage: 280.95,
    revenueShareCost: 0
  });

  // Find current currency object for easy access to its properties
  const currentCurrency = currencyOptions.find(c => c.value === selectedCurrency) || currencyOptions[0];

  // Calculate results whenever inputs or currency change
  useEffect(() => {
    const timeMultiplier = campaignMetrics.metricsTimeframe === 'monthly' ? costModel.campaignDuration : 1;
    const effectiveContacts = campaignMetrics.metricsTimeframe === 'monthly'
      ? campaignMetrics.contactsReached * timeMultiplier
      : campaignMetrics.contactsReached;

    const replies = Math.round(effectiveContacts * (campaignMetrics.replyRate / 100));
    const positiveReplies = Math.round(replies * (campaignMetrics.positiveReplyRate / 100));
    const bookings = Math.round(positiveReplies * (campaignMetrics.bookingRate / 100));
    const showUps = Math.round(bookings * (campaignMetrics.showUpRate / 100));
    const customers = Math.round(showUps * (campaignMetrics.closingRate / 100));
    const totalRevenue = customers * campaignMetrics.customerLTV;

    let revenueShareCost = 0;
    if (costModel.useRevenueShare && costModel.revenueShare > 0) {
      revenueShareCost = totalRevenue * (costModel.revenueShare / 100);
    }

    const totalCost = costModel.setupFee +
      (costModel.retainerCost * costModel.campaignDuration) +
      (costModel.payPerCallFee * bookings) +
      revenueShareCost;

    const roi = totalRevenue - totalCost;
    const roiPercentage = totalCost > 0 ? (roi / totalCost) * 100 : 0;

    setCalculatedMetrics({
      effectiveContacts,
      replies,
      positiveReplies,
      bookings,
      showUps,
      customers,
      totalRevenue,
      totalCost,
      roi,
      roiPercentage,
      revenueShareCost
    });
  }, [campaignMetrics, costModel, selectedCurrency]); // Added selectedCurrency to dependencies

  // Handle input changes for campaign metrics
  const handleCampaignChange = (e) => {
    const { name, value } = e.target;
    setCampaignMetrics({
      ...campaignMetrics,
      [name]: parseFloat(value) || 0
    });
  };

  // Handle input changes for cost model
  const handleCostChange = (e) => {
    const { name, value } = e.target;
    setCostModel({
      ...costModel,
      [name]: parseFloat(value) || 0
    });
  };

  // Handle currency change
  const handleCurrencyChange = (e) => {
    setSelectedCurrency(e.target.value);
  };

  // Format as currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { // Using 'en-US' for base formatting, currency symbol controlled by 'currency'
      style: 'currency',
      currency: currentCurrency.value,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format as percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Format as multiplier
  const formatMultiplier = (value) => {
    const multiplier = (value / 100) + 1;
    return `${multiplier.toFixed(1)}x`;
  };

  return (
    <div className="flex flex-col p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6">Cold Email ROI Calculator</h1>

      {/* Currency Selector */}
      <div className="mb-6">
        <label htmlFor="currencySelector" className="block text-sm font-medium text-gray-700 mb-1">Select Currency</label>
        <select
          id="currencySelector"
          name="currencySelector"
          value={selectedCurrency}
          onChange={handleCurrencyChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          {currencyOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label} ({option.symbol})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Campaign Metrics</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Contacts Reached</label>
                <input
                  type="number"
                  name="contactsReached"
                  value={campaignMetrics.contactsReached === 0 ? '' : campaignMetrics.contactsReached}
                  onChange={handleCampaignChange}
                  placeholder="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Reply Rate (%)</label>
                <input
                  type="number"
                  name="replyRate"
                  value={campaignMetrics.replyRate === 0 ? '' : campaignMetrics.replyRate}
                  onChange={handleCampaignChange}
                  placeholder="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Positive Reply Rate (% of replies)</label>
                <input
                  type="number"
                  name="positiveReplyRate"
                  value={campaignMetrics.positiveReplyRate === 0 ? '' : campaignMetrics.positiveReplyRate}
                  onChange={handleCampaignChange}
                  placeholder="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Booking Rate (% of positive replies)</label>
                <input
                  type="number"
                  name="bookingRate"
                  value={campaignMetrics.bookingRate === 0 ? '' : campaignMetrics.bookingRate}
                  onChange={handleCampaignChange}
                  placeholder="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Show Up Rate (%)</label>
                <input
                  type="number"
                  name="showUpRate"
                  value={campaignMetrics.showUpRate === 0 ? '' : campaignMetrics.showUpRate}
                  onChange={handleCampaignChange}
                  placeholder="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Closing Rate (%)</label>
                <input
                  type="number"
                  name="closingRate"
                  value={campaignMetrics.closingRate === 0 ? '' : campaignMetrics.closingRate}
                  onChange={handleCampaignChange}
                  placeholder="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Customer LTV ({currentCurrency.symbol})</label>
                <input
                  type="number"
                  name="customerLTV"
                  value={campaignMetrics.customerLTV === 0 ? '' : campaignMetrics.customerLTV}
                  onChange={handleCampaignChange}
                  placeholder="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="pt-2 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Metrics Timeframe</label>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <input
                      id="metricsTotal"
                      type="radio"
                      name="metricsTimeframe"
                      value="total"
                      checked={campaignMetrics.metricsTimeframe === 'total'}
                      onChange={() => setCampaignMetrics({
                        ...campaignMetrics,
                        metricsTimeframe: 'total'
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="metricsTotal" className="ml-2 block text-sm font-medium text-gray-700">
                      Total Campaign
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="metricsMonthly"
                      type="radio"
                      name="metricsTimeframe"
                      value="monthly"
                      checked={campaignMetrics.metricsTimeframe === 'monthly'}
                      onChange={() => setCampaignMetrics({
                        ...campaignMetrics,
                        metricsTimeframe: 'monthly'
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="metricsMonthly" className="ml-2 block text-sm font-medium text-gray-700">
                      Monthly (x Campaign Duration)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-green-800">Cost Model</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Setup Fee ({currentCurrency.symbol})</label>
                <input
                  type="number"
                  name="setupFee"
                  value={costModel.setupFee === 0 ? '' : costModel.setupFee}
                  onChange={handleCostChange}
                  placeholder="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Monthly Retainer ({currentCurrency.symbol})</label>
                <input
                  type="number"
                  name="retainerCost"
                  value={costModel.retainerCost === 0 ? '' : costModel.retainerCost}
                  onChange={handleCostChange}
                  placeholder="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Pay Per Call Fee ({currentCurrency.symbol})</label>
                <input
                  type="number"
                  name="payPerCallFee"
                  value={costModel.payPerCallFee === 0 ? '' : costModel.payPerCallFee}
                  onChange={handleCostChange}
                  placeholder="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Campaign Duration (months)</label>
                <input
                  type="number"
                  name="campaignDuration"
                  value={costModel.campaignDuration === 0 ? '' : costModel.campaignDuration}
                  onChange={handleCostChange}
                  placeholder="1"
                  min="1"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center mb-2">
                  <input
                    id="useRevenueShare"
                    type="checkbox"
                    checked={costModel.useRevenueShare}
                    onChange={() => setCostModel({
                      ...costModel,
                      useRevenueShare: !costModel.useRevenueShare
                    })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="useRevenueShare" className="ml-2 block text-sm font-medium text-gray-700">
                    Use Revenue Share
                  </label>
                </div>

                {costModel.useRevenueShare && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Revenue Share (%)</label>
                    <input
                      type="number"
                      name="revenueShare"
                      value={costModel.revenueShare === 0 ? '' : costModel.revenueShare}
                      onChange={handleCostChange}
                      placeholder="0"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Funnel Metrics</h2>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium">Contacts Reached:</span>
                <span>{calculatedMetrics.effectiveContacts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium">Replies:</span>
                <span>{calculatedMetrics.replies.toLocaleString()} ({formatPercentage(campaignMetrics.replyRate)})</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium">Positive Replies:</span>
                <span>{calculatedMetrics.positiveReplies.toLocaleString()} ({formatPercentage(campaignMetrics.positiveReplyRate)} of replies)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium">Bookings:</span>
                <span>{calculatedMetrics.bookings.toLocaleString()} ({formatPercentage(campaignMetrics.bookingRate)} of positive replies)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium">Show Ups:</span>
                <span>{calculatedMetrics.showUps.toLocaleString()} ({formatPercentage(campaignMetrics.showUpRate)} of bookings)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium">Customers:</span>
                <span>{calculatedMetrics.customers.toLocaleString()} ({formatPercentage(campaignMetrics.closingRate)} of show ups)</span>
              </div>
              {campaignMetrics.metricsTimeframe === 'monthly' && (
                <div className="mt-2 pt-2 text-sm text-gray-600 border-t border-gray-200">
                  <p>* Funnel metrics reflect {costModel.campaignDuration} months of campaign activity.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-yellow-800">Financial Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium">Total Revenue:</span>
                <span className="text-green-600 font-semibold">{formatCurrency(calculatedMetrics.totalRevenue)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium">Setup Fee:</span>
                <span className="text-red-600">{formatCurrency(costModel.setupFee)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium">Retainer Costs:</span>
                <span className="text-red-600">{formatCurrency(costModel.retainerCost * costModel.campaignDuration)}</span>
              </div>
              {costModel.payPerCallFee > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Call Fees:</span>
                  <span className="text-red-600">{formatCurrency(costModel.payPerCallFee * calculatedMetrics.bookings)}</span>
                </div>
              )}
              {costModel.useRevenueShare && costModel.revenueShare > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Revenue Share ({costModel.revenueShare}%):</span>
                  <span className="text-red-600">{formatCurrency(calculatedMetrics.revenueShareCost)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-gray-200 font-semibold">
                <span className="font-medium">Total Cost:</span>
                <span className="text-red-600">{formatCurrency(calculatedMetrics.totalCost)}</span>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-purple-800">Net ROI:</h2>
              <span className={`text-2xl font-bold ${calculatedMetrics.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(calculatedMetrics.roi)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <h2 className="text-xl font-bold text-purple-800">ROI %:</h2>
              <span className={`text-2xl font-bold ${calculatedMetrics.roiPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(calculatedMetrics.roiPercentage)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <h2 className="text-xl font-bold text-purple-800">Return Multiple:</h2>
              <span className={`text-2xl font-bold ${calculatedMetrics.roiPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatMultiplier(calculatedMetrics.roiPercentage)}
              </span>
            </div>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-indigo-800">Additional Metrics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-white p-3 rounded shadow">
                <h3 className="text-sm font-medium text-gray-500">Cost Per Lead</h3>
                <p className="text-lg font-bold">
                  {calculatedMetrics.positiveReplies > 0
                    ? formatCurrency(calculatedMetrics.totalCost / calculatedMetrics.positiveReplies)
                    : formatCurrency(0)
                  }
                </p>
              </div>
              <div className="bg-white p-3 rounded shadow">
                <h3 className="text-sm font-medium text-gray-500">Cost Per Meeting</h3>
                <p className="text-lg font-bold">
                  {calculatedMetrics.bookings > 0
                    ? formatCurrency(calculatedMetrics.totalCost / calculatedMetrics.bookings)
                    : formatCurrency(0)
                  }
                </p>
              </div>
              <div className="bg-white p-3 rounded shadow">
                <h3 className="text-sm font-medium text-gray-500">Cost Per Customer</h3>
                <p className="text-lg font-bold">
                  {calculatedMetrics.customers > 0
                    ? formatCurrency(calculatedMetrics.totalCost / calculatedMetrics.customers)
                    : formatCurrency(0)
                  }
                </p>
              </div>
              <div className="bg-white p-3 rounded shadow">
                <h3 className="text-sm font-medium text-gray-500">Revenue Per Email</h3>
                <p className="text-lg font-bold">
                  {calculatedMetrics.effectiveContacts > 0
                    ? formatCurrency(calculatedMetrics.totalRevenue / calculatedMetrics.effectiveContacts)
                    : formatCurrency(0)
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColdEmailROICalculator;