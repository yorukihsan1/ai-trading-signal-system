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
  ResponsiveContainer
} from 'recharts';

const ChartComponent = ({ chartData, peaks, troughs, patternPoints, patternName }) => {
  // Veriyi Recharts'in anlayabileceği şekle getiriyoruz
  const processedData = useMemo(() => {
    if (!chartData || !Array.isArray(chartData)) return [];
    
    return chartData.map((item, index) => {
      // Güvenlik amacıyla Close değerinin varlığını kontrol edelim
      const closeVal = isNaN(item.Close) || item.Close === null ? null : parseFloat(item.Close);
      
      const isPeak = peaks?.includes(index);
      const isTrough = troughs?.includes(index);
      const isPattern = patternPoints?.includes(index);
      
      return {
        ...item,
        name: item.index || item.Date || item.Datetime || index, // x-axis için
        indexValue: index,
        Close: closeVal,
        Peak: isPeak ? closeVal : null,
        Trough: isTrough ? closeVal : null,
        Pattern: isPattern ? closeVal : null,
      };
    });
  }, [chartData, peaks, troughs, patternPoints]);

  if (!processedData || processedData.length === 0) {
    return <div style={{ color: 'white', textAlign: 'center', paddingTop: '20px' }}>Grafik verisi bulunamadı.</div>;
  }

  // Özel Tooltip (Glassmorphism)
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
          <p style={{ margin: '0 0 5px 0', color: '#94a3b8', fontSize: '0.85rem' }}>Tarih: {label}</p>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Fiyat: {dataPoint.Close < 1 ? dataPoint.Close.toFixed(4) : dataPoint.Close.toFixed(2)}</p>
          
          {dataPoint.Peak && <p style={{ margin: '0', color: '#10b981', fontSize: '0.85rem' }}>• Tepe Noktası</p>}
          {dataPoint.Trough && <p style={{ margin: '0', color: '#f43f5e', fontSize: '0.85rem' }}>• Dip Noktası</p>}
          {dataPoint.Pattern && <p style={{ margin: '0', color: '#818cf8', fontSize: '0.85rem', fontWeight: 'bold' }}>• Formasyon Node ({patternName})</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={processedData}
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" vertical={false} />
        
        {/* X Ekseni (Çok kalabalık olmamasına dikkat edelim) */}
        <XAxis 
          dataKey="name" 
          stroke="#64748b" 
          tick={{ fill: '#64748b' }} 
          minTickGap={30}
        />
        
        {/* Y Ekseni */}
        <YAxis 
          domain={['auto', 'auto']} 
          stroke="#64748b" 
          tick={{ fill: '#64748b' }}
          tickFormatter={(value) => value.toLocaleString()}
        />
        
        <Tooltip content={<CustomTooltip />} />
        
        <Legend wrapperStyle={{ paddingTop: '20px' }} />

        {/* Ana Çizgi Grafiği */}
        <Line 
          type="monotone" 
          dataKey="Close" 
          stroke="#38bdf8" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, fill: '#38bdf8', stroke: 'transparent' }}
          name="Fiyat"
        />

        {/* Tepe Noktaları (Triangle Up) */}
        <Scatter 
          name="Tepe Noktaları" 
          dataKey="Peak" 
          fill="#10b981" 
          shape="triangle"
          line={null}
        />
        
        {/* Dip Noktaları (Triangle Down - shape formatter ile özel çizilebilir ama star kullanabiliriz built-in) */}
        <Scatter 
          name="Dip Noktaları" 
          dataKey="Trough" 
          fill="#f43f5e" 
          shape="star" 
          line={null}
        />

        {/* Formasyon Noktaları (Cross) */}
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

export default ChartComponent;
