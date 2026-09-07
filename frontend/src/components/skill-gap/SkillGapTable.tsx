import React, { useState } from 'react';
import { SkillGapItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Lock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SkillGapTableProps {
  skills: SkillGapItem[];
  onSelectSkill: (skillId: number) => void;
  selectedSkillId?: number | null;
  momentumMap?: Record<string, { current: number; previous: number; delta: number; trend_display: string }>;
}

export const SkillGapTable: React.FC<SkillGapTableProps> = ({
  skills,
  onSelectSkill,
  selectedSkillId,
  momentumMap
}) => {
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [sortField, setSortField] = useState<'gap' | 'current' | 'name' | 'priority'>('gap');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const navigate = useNavigate();

  // Filter skills
  const filteredSkills = skills.filter((item) => {
    const matchesCategory =
      filter === 'All' ||
      (filter === 'Critical Gap' && item.status === 'Critical Gap') ||
      (filter === 'Needs Attention' && item.status === 'Needs Attention') ||
      (filter === 'Developing' && item.status === 'Developing') ||
      (filter === 'Strong' && item.status === 'Strong');

    const matchesSearch =
      item.skill_name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Sort skills
  const sortedSkills = [...filteredSkills].sort((a, b) => {
    let diff = 0;
    if (sortField === 'gap') diff = b.gap - a.gap;
    else if (sortField === 'current') diff = b.current_proficiency - a.current_proficiency;
    else if (sortField === 'name') diff = a.skill_name.localeCompare(b.skill_name);
    else if (sortField === 'priority') {
      const priorityOrder: { [p: string]: number } = {
        Critical: 4,
        High: 3,
        Medium: 2,
        Low: 1
      };
      diff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    }
    return sortAsc ? -diff : diff;
  });

  const toggleSort = (field: 'gap' | 'current' | 'name' | 'priority') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Filter skills by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          {['All', 'Critical Gap', 'Needs Attention', 'Developing', 'Strong'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all whitespace-nowrap ${
                filter === status
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <th
                onClick={() => toggleSort('name')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
              >
                <div className="flex items-center space-x-1">
                  <span>Skill</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('current')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
              >
                <div className="flex items-center space-x-1">
                  <span>Current</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-4 font-semibold">Required</th>
              <th
                onClick={() => toggleSort('gap')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
              >
                <div className="flex items-center space-x-1">
                  <span>Gap</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('priority')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
              >
                <div className="flex items-center space-x-1">
                  <span>Priority</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedSkills.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                  No skills matching the selected criteria.
                </td>
              </tr>
            ) : (
              sortedSkills.map((item) => {
                const isSelected = selectedSkillId === item.skill_id;

                return (
                  <tr
                    key={item.skill_id}
                    onClick={() => onSelectSkill(item.skill_id)}
                    className={`transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-emerald-950/20 hover:bg-emerald-950/30'
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Skill Name & Evidence */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-xs group-hover:text-emerald-300 transition-colors">
                            {item.skill_name}
                          </span>
                          <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                            {item.category}
                          </span>
                        </div>
                        {item.evidence && (
                          <div className="flex items-center space-x-1 text-[10px] text-slate-400 truncate max-w-xs">
                            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate">{item.evidence}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Current Proficiency with Mini Meter & Momentum */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between font-mono font-bold text-slate-200">
                          <div className="flex items-center space-x-1.5">
                            <span>{item.current_proficiency}%</span>
                            {momentumMap && momentumMap[item.skill_name] && (
                              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20">
                                {momentumMap[item.skill_name].trend_display}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-normal">
                            ({Math.round(item.confidence * 100)}% conf)
                          </span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.status === 'Strong'
                                ? 'bg-emerald-500'
                                : item.status === 'Critical Gap'
                                ? 'bg-rose-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${item.current_proficiency}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Required Target */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-300">
                      {item.required_proficiency}%
                    </td>

                    {/* Gap */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          item.gap === 0
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : item.gap >= 40
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {item.gap > 0 ? `-${item.gap}%` : '0%'}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-semibold ${
                          item.priority === 'Critical'
                            ? 'text-rose-400'
                            : item.priority === 'High'
                            ? 'text-amber-400'
                            : item.priority === 'Medium'
                            ? 'text-blue-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSkill(item.skill_id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/recommendations?skill_id=${item.skill_id}`);
                          }}
                          className="p-1 rounded-lg hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-400 transition-colors"
                          title="View Learning Resources"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
        <span>
          Showing {sortedSkills.length} of {skills.length} skills in career benchmark
        </span>
        <span>Click any row to open full skill diagnostics drawer</span>
      </div>
    </div>
  );
};
