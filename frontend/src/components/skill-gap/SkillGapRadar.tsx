import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { RadarDataPoint } from '../../types';

interface SkillGapRadarProps {
  data: RadarDataPoint[];
}

export const SkillGapRadar: React.FC<SkillGapRadarProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-500 text-xs">
        No skill data available for radar plot.
      </div>
    );
  }

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="p-3 rounded-xl bg-slate-900/95 border border-slate-700 shadow-xl text-xs space-y-1">
          <p className="font-bold text-white">{point.skill}</p>
          <div className="flex items-center space-x-2 text-emerald-400">
            <span>Current Proficiency:</span>
            <span className="font-mono font-bold">{point.current}%</span>
          </div>
          <div className="flex items-center space-x-2 text-blue-400">
            <span>Career Benchmark:</span>
            <span className="font-mono font-bold">{point.required}%</span>
          </div>
          <div className="text-rose-400 text-[11px] pt-1 border-t border-slate-800">
            Delta Gap: {Math.max(0, point.required - point.current)}%
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80 relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#1e293b" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: '#475569', fontSize: 9 }}
            axisLine={{ stroke: '#1e293b' }}
          />
          {/* Required Profile (Target Benchmark) */}
          <Radar
            name="Target Benchmark"
            dataKey="required"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.15}
            strokeWidth={2}
          />
          {/* Current Learner Profile */}
          <Radar
            name="Current Proficiency"
            dataKey="current"
            stroke="#22c55e"
            fill="#22c55e"
            fillOpacity={0.35}
            strokeWidth={2.5}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
