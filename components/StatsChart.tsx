import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartDataPoint } from '../types';

interface StatsChartProps {
  data: ChartDataPoint[];
}

export const StatsChart: React.FC<StatsChartProps> = ({ data }) => {
  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#9ca3af', fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            contentStyle={{ 
                backgroundColor: 'rgba(20,20,20, 0.9)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '12px', 
                color: '#fff' 
            }}
            itemStyle={{ color: '#fff' }}
          />
          <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => {
                // Gradient effect logic via colors
                const percentage = entry.goal > 0 ? entry.completed / entry.goal : 0;
                let color = '#374151'; // dark gray default
                if (percentage > 0) color = '#2dd4bf'; // teal-400
                if (percentage >= 0.8) color = '#c084fc'; // purple-400
                
                return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};