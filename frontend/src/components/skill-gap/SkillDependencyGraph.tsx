import React, { useState } from 'react';
import { DependencyGraphData, DependencyGraphNode } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  CheckCircle2,
  Lock,
  Sparkles,
  GitBranch,
  ChevronRight
} from 'lucide-react';

interface SkillDependencyGraphProps {
  graph: DependencyGraphData;
  onSelectSkill: (skillId: number) => void;
  selectedSkillId?: number | null;
}

export const SkillDependencyGraph: React.FC<SkillDependencyGraphProps> = ({
  graph,
  onSelectSkill,
  selectedSkillId
}) => {
  const [activeTier, setActiveTier] = useState<number | 'all'>('all');
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);

  if (!graph || !graph.nodes || graph.nodes.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl glass-panel border border-slate-800 text-slate-500 text-xs">
        No prerequisite dependency hierarchy defined for this career path.
      </div>
    );
  }

  // Group nodes by tier
  const tierMap: { [tier: number]: DependencyGraphNode[] } = {};
  graph.nodes.forEach((node) => {
    const t = node.tier || 1;
    if (!tierMap[t]) tierMap[t] = [];
    tierMap[t].push(node);
  });

  const sortedTiers = Object.keys(tierMap)
    .map(Number)
    .sort((a, b) => a - b);

  const tierNames: { [tier: number]: { title: string; desc: string } } = {
    1: { title: 'Foundations & Core Syntax', desc: 'Prerequisite bedrock for all computation' },
    2: { title: 'Mathematical & Data Structures', desc: 'Applied analysis, statistics & cleaning' },
    3: { title: 'Core Modeling & Algorithms', desc: 'Supervised/unsupervised architecture' },
    4: { title: 'Advanced Neural Systems', desc: 'Deep networks, embeddings & vision' },
    5: { title: 'Production Engineering & MLOps', desc: 'Serving, deployment & monitoring' },
    6: { title: 'Capstone & System Review', desc: 'End-to-end multi-agent orchestration' }
  };

  return (
    <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <GitBranch className="w-3.5 h-3.5" />
            <span>Directed Acyclic Graph (DAG) Prerequisite Flow</span>
          </div>
          <h3 className="text-base font-bold text-white mt-1">
            Skill Dependency & Unlocking Hierarchy
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl">
            Prerequisites enforce strict topological sequencing. Skills remain locked or down-weighted until parent foundational benchmarks are cleared.
          </p>
        </div>

        {/* Tier Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveTier('all')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              activeTier === 'all'
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Tiers
          </button>
          {sortedTiers.map((tier) => (
            <button
              key={tier}
              onClick={() => setActiveTier(tier)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all whitespace-nowrap ${
                activeTier === tier
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Tier {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Visual DAG Tiers Container */}
      <div className="space-y-6">
        {sortedTiers
          .filter((t) => activeTier === 'all' || activeTier === t)
          .map((tier, idx) => {
            const nodes = tierMap[tier];
            const meta = tierNames[tier] || {
              title: `Tier ${tier}: Advanced Mastery`,
              desc: 'Specialized competencies'
            };

            return (
              <div
                key={tier}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3 relative overflow-hidden"
              >
                {/* Tier Label */}
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-mono font-bold flex items-center justify-center border border-emerald-500/30">
                      {tier}
                    </span>
                    <span className="text-xs font-bold text-slate-200">{meta.title}</span>
                    <span className="text-[11px] text-slate-500 hidden md:inline">— {meta.desc}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {nodes.length} {nodes.length === 1 ? 'skill' : 'skills'}
                  </span>
                </div>

                {/* Nodes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {nodes.map((node) => {
                    const isSelected = selectedSkillId === node.id;
                    const isHovered = hoveredNodeId === node.id;

                    // Outgoing edges from this node
                    const unlocks = graph.edges.filter((e) => e.source_id === node.id);

                    return (
                      <div
                        key={node.id}
                        onClick={() => onSelectSkill(node.id)}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left space-y-2.5 ${
                          isSelected
                            ? 'bg-emerald-950/30 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
                            : isHovered
                            ? 'bg-slate-900 border-slate-600 shadow-md'
                            : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700'
                        }`}
                      >
                        {/* Title & Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 uppercase">
                              {node.category}
                            </span>
                            <h4 className="text-sm font-bold text-white leading-tight">
                              {node.name}
                            </h4>
                          </div>
                          <StatusBadge status={node.status} size="sm" />
                        </div>

                        {/* Proficiency Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>
                              Current: <strong className="text-white">{node.current_proficiency}%</strong>
                            </span>
                            <span>
                              Req: <strong className="text-slate-300">{node.required_proficiency}%</strong>
                            </span>
                          </div>
                          <div className="relative w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="absolute top-0 bottom-0 bg-blue-500/30 rounded-full"
                              style={{ width: `${node.required_proficiency}%` }}
                            />
                            <div
                              className={`absolute top-0 bottom-0 rounded-full transition-all duration-300 ${
                                node.status === 'Strong'
                                  ? 'bg-emerald-500'
                                  : node.status === 'Critical Gap'
                                  ? 'bg-rose-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${node.current_proficiency}%` }}
                            />
                          </div>
                        </div>

                        {/* DAG Metadata Footer */}
                        <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800/60 text-slate-400">
                          <div className="flex items-center space-x-1">
                            {node.prerequisites_met ? (
                              <span className="text-emerald-400 flex items-center space-x-0.5">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Prereqs Ready</span>
                              </span>
                            ) : (
                              <span className="text-amber-400 flex items-center space-x-0.5">
                                <Lock className="w-3 h-3" />
                                <span>Prereqs Incomplete</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-1 text-slate-500 font-mono">
                            {unlocks.length > 0 && (
                              <span className="text-blue-400">
                                Unlocks {unlocks.length}
                              </span>
                            )}
                            <ChevronRight className="w-3 h-3 text-slate-600" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Downward Tier Arrow Indicator */}
                {idx < sortedTiers.length - 1 && activeTier === 'all' && (
                  <div className="flex items-center justify-center pt-2">
                    <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                      <span className="w-8 h-px bg-slate-800" />
                      <span className="flex items-center space-x-1 text-emerald-400/80">
                        <span>Unlocks Next Tier</span>
                        <ChevronRight className="w-3 h-3 rotate-90" />
                      </span>
                      <span className="w-8 h-px bg-slate-800" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Legend & Summary Info */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <span className="font-bold text-slate-300">Status Legend:</span>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Strong (Benchmark Met)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Needs Attention</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Critical Gap</span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Click any skill card to open full diagnostic breakdown and curated resources</span>
        </div>
      </div>
    </div>
  );
};
