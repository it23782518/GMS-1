import React from 'react';

const CostTable = ({ 
  groupCostsByYear, 
  getYearlyTotalForYear, 
  getMonthName, 
  showYearlyTotal 
}) => {
  return (
    <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
      {Object.entries(groupCostsByYear()).map(([year, yearCosts]) => (
        <div key={year} className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-gray-50 p-3 rounded-t-lg border border-gray-200 border-b-0">
            Year {year} - ${getYearlyTotalForYear(yearCosts).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <div className="overflow-x-auto rounded-b-lg border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <th className="p-4 font-semibold text-gray-700 border-b">Month</th>
                  <th className="p-4 font-semibold text-gray-700 border-b">Total Cost</th>
                  <th className="p-4 font-semibold text-gray-700 border-b">% of Year</th>
                </tr>
              </thead>
              <tbody>
                {yearCosts.map((cost, index) => {
                  const yearlyTotal = getYearlyTotalForYear(yearCosts);
                  const percentage = yearlyTotal > 0 ? (Number(cost.totalCost) / yearlyTotal) * 100 : 0;
                  
                  return (
                    <tr
                      key={cost.month || index}
                      className={`hover:bg-blue-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="p-4 border-b border-gray-100">
                        <span className="font-medium text-gray-800">{getMonthName(cost.month)}</span>
                      </td>
                      <td className="p-4 border-b border-gray-100">
                        <span className="font-bold text-gray-900">${Number(cost.totalCost).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}</span>
                      </td>
                      <td className="p-4 border-b border-gray-100">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[200px]">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {showYearlyTotal && (
                  <tr className="bg-gray-100 font-semibold">
                    <td className="p-4 border-t-2 border-gray-300">Yearly Total</td>
                    <td className="p-4 border-t-2 border-gray-300">
                      ${getYearlyTotalForYear(yearCosts).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-4 border-t-2 border-gray-300">100%</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CostTable;