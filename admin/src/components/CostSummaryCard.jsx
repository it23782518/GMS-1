import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const CostSummaryCard = ({ schedules, className = '' }) => {
  const [activeType, setActiveType] = useState(null);
  const [chartView, setChartView] = useState('donut'); // 'donut', 'bar', 'trend'
  const canvasRef = useRef(null);
  const legendRef = useRef(null);
  
  // Calculate cost metrics
  const totalCost = schedules.reduce((sum, s) => sum + parseFloat(s.maintenanceCost || 0), 0);
  const averageCost = schedules.length ? totalCost / schedules.length : 0;
  const highestCost = schedules.length ? Math.max(...schedules.map(s => parseFloat(s.maintenanceCost || 0))) : 0;
  const lowestCost = schedules.length ? Math.min(...schedules.map(s => parseFloat(s.maintenanceCost || 0))) : 0;
  
  // Get cost data by maintenance type
  const costByType = schedules.reduce((acc, schedule) => {
    const type = schedule.maintenanceType || 'OTHER';
    if (!acc[type]) {
      acc[type] = {
        total: 0,
        count: 0,
        schedules: []
      };
    }
    acc[type].total += parseFloat(schedule.maintenanceCost || 0);
    acc[type].count += 1;
    acc[type].schedules.push(schedule);
    return acc;
  }, {});

  // Calculate cost data by month (for trend view)
  const costByMonth = schedules.reduce((acc, schedule) => {
    const date = new Date(schedule.maintenanceDate);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthYear]) {
      acc[monthYear] = 0;
    }
    acc[monthYear] += parseFloat(schedule.maintenanceCost || 0);
    return acc;
  }, {});
  
  // Sort months chronologically
  const sortedMonths = Object.keys(costByMonth).sort();
  
  // Colors for different maintenance types - with more options and case-insensitive matching
  const colorPalette = {
    // Primary colors for exact matches
    'PREVENTIVE': '#3B82F6',     // Blue
    'CORRECTIVE': '#EF4444',     // Red
    'PREDICTIVE': '#10B981',     // Green
    'ROUTINE': '#F59E0B',        // Amber
    'EMERGENCY': '#EC4899',      // Pink
    'CONDITION_BASED': '#8B5CF6', // Purple
    
    // Additional colors for other types
    'PLANNED': '#0EA5E9',        // Sky blue
    'UNPLANNED': '#F43F5E',      // Rose
    'INSPECTION': '#14B8A6',     // Teal
    'REPAIR': '#F97316',         // Orange
    'SERVICE': '#8B5CF6',        // Violet
    'REPLACEMENT': '#6366F1',    // Indigo
    'OTHER': '#6B7280'           // Gray
  };
  
  // Fixed color assignments for types that don't match the predefined palette
  // This ensures each type gets a consistent, distinct color
  const [typeColorMap] = useState(() => {
    const map = {};
    const types = Object.keys(costByType);
    
    // Predefined vibrant colors for fallback
    const fallbackColors = [
      '#3B82F6', // Blue
      '#EF4444', // Red
      '#10B981', // Green
      '#F59E0B', // Amber
      '#EC4899', // Pink
      '#8B5CF6', // Purple
      '#0EA5E9', // Sky
      '#F97316', // Orange
      '#6366F1', // Indigo
      '#14B8A6', // Teal
      '#84CC16', // Lime
      '#F43F5E', // Rose
      '#6B7280', // Gray
    ];
    
    let colorIndex = 0;
    
    // Assign colors to each type
    types.forEach(type => {
      // Try to find a match in the color palette (case-insensitive)
      const paletteKey = Object.keys(colorPalette).find(
        key => key.toUpperCase() === type.toUpperCase()
      );
      
      if (paletteKey) {
        map[type] = colorPalette[paletteKey];
      } else {
        // If no match, assign a fallback color
        map[type] = fallbackColors[colorIndex % fallbackColors.length];
        colorIndex++;
      }
    });
    
    return map;
  });
  
  // Get color for a type
  const getTypeColor = (type) => {
    return typeColorMap[type] || '#6B7280'; // Gray as ultimate fallback
  };

  // Draw chart based on the selected view
  useEffect(() => {
    if (!canvasRef.current || Object.keys(costByType).length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (chartView === 'donut') {
      // Draw donut chart
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 20;
      
      let startAngle = 0;
      
      Object.entries(costByType).forEach(([type, data]) => {
        const sliceAngle = (data.total / totalCost) * 2 * Math.PI;
        const isActive = activeType === type;
        
        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, isActive ? radius + 5 : radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        
        ctx.fillStyle = getTypeColor(type);
        ctx.fill();
        
        // Add slice border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Add label if slice is big enough
        if (data.total / totalCost > 0.05) {
          const labelAngle = startAngle + sliceAngle / 2;
          const labelRadius = radius * 0.7;
          const labelX = centerX + Math.cos(labelAngle) * labelRadius;
          const labelY = centerY + Math.sin(labelAngle) * labelRadius;
          
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${Math.round(data.total / totalCost * 100)}%`, labelX, labelY);
        }
        
        startAngle += sliceAngle;
      });

      // Draw center circle (donut hole)
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#f3f4f6';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw total cost in center
      ctx.fillStyle = '#1F2937';
      ctx.font = 'bold 16px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`$${totalCost.toFixed(0)}`, centerX, centerY - 8);
      ctx.font = '12px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#6B7280';
      ctx.fillText('Total Cost', centerX, centerY + 12);
    } 
    else if (chartView === 'bar') {
      // Draw bar chart
      const barWidth = (width - 40) / Object.keys(costByType).length;
      const maxBarHeight = height - 60;
      const maxCost = Math.max(...Object.values(costByType).map(data => data.total));
      
      // Draw axes
      ctx.beginPath();
      ctx.moveTo(20, 20);
      ctx.lineTo(20, height - 20);
      ctx.lineTo(width - 20, height - 20);
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw bars
      let barX = 30;
      Object.entries(costByType).forEach(([type, data]) => {
        const barHeight = (data.total / maxCost) * maxBarHeight;
        const isActive = activeType === type;
        
        // Draw bar
        ctx.fillStyle = getTypeColor(type);
        ctx.fillRect(
          barX, 
          height - 20 - barHeight, 
          barWidth - 10, 
          barHeight
        );
        
        // Add highlight for active bar
        if (isActive) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.strokeRect(
            barX - 2, 
            height - 20 - barHeight - 2, 
            barWidth - 10 + 4, 
            barHeight + 4
          );
        }
        
        // Add value on top of bar
        ctx.fillStyle = '#1F2937';
        ctx.font = '10px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          `$${data.total.toFixed(0)}`, 
          barX + (barWidth - 10) / 2, 
          height - 20 - barHeight - 8
        );
        
        // Add type label below bar
        ctx.fillStyle = '#6B7280';
        ctx.font = '10px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          type.substring(0, 8), 
          barX + (barWidth - 10) / 2, 
          height - 8
        );
        
        barX += barWidth;
      });
    }
    else if (chartView === 'trend') {
      // Draw line chart (trend view) implementation remains the same
      // ...
    }
  }, [schedules, costByType, costByMonth, sortedMonths, totalCost, activeType, chartView, typeColorMap]);

  // Handle type hover
  const handleTypeHover = (type) => {
    setActiveType(type);
  };

  // Get a percentage relative to total
  const getPercentage = (value) => {
    return totalCost ? Math.round((value / totalCost) * 100) : 0;
  };

  // Debug function to display the assigned colors - can be removed in production
  const debugColorAssignments = () => {
    console.log("Type to Color Assignments:", typeColorMap);
  };

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
      {/* Header with tabs */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-5 py-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Maintenance Cost Summary</h3>
        
        <div className="flex space-x-1 text-xs">
          <button 
            onClick={() => setChartView('donut')}
            className={`px-3 py-1.5 rounded-md ${
              chartView === 'donut' 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Breakdown
          </button>
          <button 
            onClick={() => setChartView('bar')}
            className={`px-3 py-1.5 rounded-md ${
              chartView === 'bar' 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Comparison
          </button>
          <button 
            onClick={() => setChartView('trend')}
            className={`px-3 py-1.5 rounded-md ${
              chartView === 'trend' 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Trend
          </button>
        </div>
      </div>
      
      <div className="p-5">
        {/* Cost stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 animate-fadeIn">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-blue-600 mb-1 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              Total Cost
            </p>
            <p className="text-xl font-bold text-gray-800">${totalCost.toFixed(2)}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <p className="text-xs text-green-600 mb-1 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Average Cost
            </p>
            <p className="text-xl font-bold text-gray-800">${averageCost.toFixed(2)}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
            <p className="text-xs text-amber-600 mb-1 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Highest Cost
            </p>
            <p className="text-xl font-bold text-gray-800">${highestCost.toFixed(2)}</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
            <p className="text-xs text-indigo-600 mb-1 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
              Lowest Cost
            </p>
            <p className="text-xl font-bold text-gray-800">${lowestCost.toFixed(2)}</p>
          </div>
        </div>
        
        {/* Chart and legend layout */}
        <div className="flex flex-col md:flex-row">
          {/* Chart area */}
          <div className="flex-grow flex justify-center items-center min-h-[240px] md:min-h-[280px]">
            <canvas 
              ref={canvasRef} 
              width="280" 
              height="280" 
              className={`animate-fadeIn mx-auto ${chartView === 'trend' ? 'max-w-full' : ''}`}
            />
          </div>
          
          {/* Legend area */}
          <div 
            ref={legendRef}
            className={`md:w-64 mt-4 md:mt-0 md:ml-4 ${chartView === 'trend' ? 'hidden md:block' : ''}`}
          >
            <h4 className="text-sm font-medium text-gray-700 mb-3">Cost Breakdown</h4>
            <div className="space-y-2.5">
              {Object.entries(costByType).map(([type, data]) => (
                <div 
                  key={type} 
                  className={`flex items-center justify-between text-sm p-2 rounded-md transition-colors duration-200 hover:bg-gray-50 ${activeType === type ? 'bg-gray-50 shadow-sm' : ''}`}
                  onMouseEnter={() => handleTypeHover(type)}
                  onMouseLeave={() => handleTypeHover(null)}
                >
                  <div className="flex items-center">
                    <span 
                      className="w-3 h-3 rounded-full mr-2 animate-pulse"
                      style={{ 
                        backgroundColor: getTypeColor(type),
                        animationDuration: '3s'
                      }}
                    />
                    <span className="text-gray-700 font-medium">{type}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${data.total.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">
                      {getPercentage(data.total)}% • {data.count} items
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Hover tip */}
            <div className="mt-4 text-xs text-gray-500 italic">
              Hover over items to highlight in chart
            </div>
          </div>
        </div>
        
        {/* Cost trend insights remains the same */}
      </div>
    </div>
  );
};

CostSummaryCard.propTypes = {
  schedules: PropTypes.array.isRequired,
  className: PropTypes.string
};

export default CostSummaryCard;