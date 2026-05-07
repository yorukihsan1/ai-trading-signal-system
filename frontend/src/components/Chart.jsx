import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Label
} from 'recharts';

const ChartComponent = ({ chartData, peaks, troughs, patternPoints, patternName, entry, target, stop }) => {
  // Veriyi Recharts formatına sok
  const processedData = useMemo(() => {
    if (!chartData || !Array.isArray(chartData)) return [];
    
    return chartData.map((item, index) => {
      const keys = Object.keys(item);
      const closeKey = keys.find(k => k.toLowerCase() === 'close' || k.toLowerCase() === 'price');
      const dateKey = keys.find(k => k.toLowerCase() === 'date' || k.toLowerCase() === 'datetime' || k.toLowerCase() === 'tarih');

      const rawClose = item[closeKey];
      const closeVal = isNaN(rawClose) || rawClose === null ? null : parseFloat(rawClose);
      
      const isPeak = peaks?.includes(index);
      const isTrough = troughs?.includes(index);
      const isPattern = patternPoints?.includes(index);
      
      return {
        ...item,
        name: item[dateKey] || index,
        indexValue: index,
        Close: closeVal,
        Peak: isPeak ? closeVal : null,
        Trough: isTrough ? closeVal : null,
        Pattern: isPattern ? closeVal : null,
      };
    });
  }, [chartData, peaks, troughs, patternPoints]);

  if (!processedData || processedData.length === 0) {
    return <div style={{ color: 'white', textAlign: 'center', paddingTop: '20px' }}>Veri yok.</div>;
  }

  // Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}>
          <p style={{ margin: '0 0 5px 0', color: '#94a3b8', fontSize: '0.85rem' }}>{label}</p>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Fiyat: {dataPoint.Close < 1 ? dataPoint.Close.toFixed(4) : dataPoint.Close.toFixed(2)}</p>
          
          {dataPoint.Peak && <p style={{ margin: '0', color: '#10b981', fontSize: '0.85rem' }}>• Tepe</p>}
          {dataPoint.Trough && <p style={{ margin: '0', color: '#f43f5e', fontSize: '0.85rem' }}>• Dip</p>}
          {dataPoint.Pattern && <p style={{ margin: '0', color: '#818cf8', fontSize: '0.85rem', fontWeight: 'bold' }}>• Formasyon ({patternName})</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={processedData}
        margin={{ top: 20, right: 60, bottom: 20, left: 20 }}
      >
        <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" vertical={false} />
        
        <XAxis 
          dataKey="name" 
          stroke="#64748b" 
          tick={{ fill: '#64748b' }} 
          minTickGap={30}
        />
        
        <YAxis 
          domain={['auto', 'auto']} 
          stroke="#64748b" 
          tick={{ fill: '#64748b' }}
          tickFormatter={(value) => value.toLocaleString()}
        />
        
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />

        {/* Tahmin Seviyeleri */}
        {target && (
          <ReferenceLine y={target} stroke="#10b981" strokeDasharray="5 5" strokeWidth={2}>
            <Label value="HEDEF" position="right" fill="#10b981" fontSize={10} fontWeight="bold" />
          </ReferenceLine>
        )}
        {entry && (
          <ReferenceLine y={entry} stroke="#38bdf8" strokeDasharray="3 3">
            <Label value="GİRİŞ" position="right" fill="#38bdf8" fontSize={10} />
          </ReferenceLine>
        )}
        {stop && (
          <ReferenceLine y={stop} stroke="#f43f5e" strokeDasharray="5 5">
            <Label value="STOP" position="right" fill="#f43f5e" fontSize={10} fontWeight="bold" />
          </ReferenceLine>
        )}

        <Line 
          type="monotone" 
          dataKey="Close" 
          stroke="#38bdf8" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, fill: '#38bdf8', stroke: 'transparent' }}
          name="Fiyat"
        />

        <Scatter 
          name="Tepe" 
          dataKey="Peak" 
          fill="#10b981" 
          shape="triangle"
          line={null}
        />
        
        <Scatter 
          name="Dip" 
          dataKey="Trough" 
          fill="#f43f5e" 
          shape="star" 
          line={null}
        />

        {patternPoints && patternPoints.length > 0 && (
           <Scatter 
             name={`Formasyon (${patternName.toUpperCase()})`} 
             dataKey="Pattern" 
             fill="#818cf8" 
             shape="cross"
             line={{ stroke: '#818cf8', strokeWidth: 2, strokeDasharray: '5 5' }}
           />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default React.memo(ChartComponent);
