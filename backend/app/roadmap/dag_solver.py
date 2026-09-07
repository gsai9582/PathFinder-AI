from typing import List, Dict, Set, Tuple, Any
import networkx as nx
from app.models.models import Skill, Prerequisite, LearnerSkill, CareerSkill

class PrerequisiteDAGSolver:
    """
    Constructs a Directed Acyclic Graph (DAG) for career skills and determines
    prerequisite satisfaction, topological ordering, and phase groupings.
    """

    def __init__(self, career_skills: List[CareerSkill], prerequisites: List[Prerequisite]):
        self.career_skills = career_skills
        self.prerequisites = prerequisites
        self.graph = nx.DiGraph()
        self._build_graph()

    def _build_graph(self):
        # Add all career skills as nodes
        for cs in self.career_skills:
            self.graph.add_node(cs.skill_id, skill=cs.skill, required_proficiency=cs.required_proficiency)

        # Add prerequisite edges: u -> v means u must be learned before v
        for p in self.prerequisites:
            if p.prerequisite_skill_id in self.graph and p.skill_id in self.graph:
                self.graph.add_edge(p.prerequisite_skill_id, p.skill_id, min_proficiency=p.min_proficiency_required)

        # Ensure no cycles (break any accidental cycle safely)
        if not nx.is_directed_acyclic_graph(self.graph):
            cycles = list(nx.simple_cycles(self.graph))
            for cycle in cycles:
                if len(cycle) >= 2:
                    self.graph.remove_edge(cycle[-1], cycle[0])

    def check_prerequisites_met(self, learner_skills_map: Dict[int, LearnerSkill]) -> Dict[int, bool]:
        """
        Returns a map {skill_id: bool} indicating if all prerequisite skills
        satisfy minimum proficiency requirements.
        """
        prereqs_met_map = {}
        for skill_id in self.graph.nodes:
            predecessors = list(self.graph.predecessors(skill_id))
            if not predecessors:
                prereqs_met_map[skill_id] = True
                continue

            all_met = True
            for pred_id in predecessors:
                edge_data = self.graph.get_edge_data(pred_id, skill_id)
                min_req = edge_data.get("min_proficiency", 50.0) if edge_data else 50.0
                learner_skill = learner_skills_map.get(pred_id)
                cur_prof = learner_skill.current_proficiency if learner_skill else 0.0
                if cur_prof < min_req:
                    all_met = False
                    break
            prereqs_met_map[skill_id] = all_met

        return prereqs_met_map

    def get_skill_prerequisites_details(self, skill_id: int, learner_skills_map: Dict[int, LearnerSkill]) -> List[Dict[str, Any]]:
        """
        Returns rich details for all direct prerequisites of a given skill.
        """
        if skill_id not in self.graph:
            return []
        
        predecessors = list(self.graph.predecessors(skill_id))
        details = []
        for pred_id in predecessors:
            edge_data = self.graph.get_edge_data(pred_id, skill_id) or {}
            min_req = edge_data.get("min_proficiency", 50.0)
            pred_skill = self.graph.nodes[pred_id].get("skill")
            ls = learner_skills_map.get(pred_id)
            cur_prof = ls.current_proficiency if ls else 0.0
            is_met = cur_prof >= min_req
            
            details.append({
                "skill_id": pred_id,
                "skill_name": pred_skill.name if pred_skill else f"Skill #{pred_id}",
                "required_proficiency": min_req,
                "current_proficiency": cur_prof,
                "is_met": is_met
            })
        return details

    def generate_topological_phases(self, learner_skills_map: Dict[int, LearnerSkill]) -> List[Dict[str, Any]]:
        """
        Groups skills into topological learning phases based on DAG depth and difficulty.
        """
        skill_depths = {}
        
        for node in nx.topological_sort(self.graph):
            preds = list(self.graph.predecessors(node))
            if not preds:
                skill_depths[node] = 1
            else:
                skill_depths[node] = max(skill_depths[p] for p in preds) + 1

        # Group skill IDs by depth tier
        depth_groups: Dict[int, List[int]] = {}
        for skill_id, depth in skill_depths.items():
            depth_groups.setdefault(depth, []).append(skill_id)

        phase_titles = {
            1: "Phase 1: Foundation & Core Prerequisites",
            2: "Phase 2: Statistics & Data Engineering",
            3: "Phase 3: Classical Machine Learning",
            4: "Phase 4: Deep Learning & Neural Architectures",
            5: "Phase 5: Domain Specialization",
            6: "Phase 6: MLOps & Production Pipelines",
            7: "Phase 7: Capstone & Industry Portfolio"
        }

        prereqs_met_map = self.check_prerequisites_met(learner_skills_map)

        phases = []
        sorted_tiers = sorted(depth_groups.keys())
        for idx, tier in enumerate(sorted_tiers, start=1):
            tier_skill_ids = depth_groups[tier]
            title = phase_titles.get(idx, f"Phase {idx}: Advanced Mastery Track")
            
            # Phase status determination
            all_completed = True
            any_available = False
            for sid in tier_skill_ids:
                ls = learner_skills_map.get(sid)
                cs = next((c for c in self.career_skills if c.skill_id == sid), None)
                req_prof = cs.required_proficiency if cs else 75.0
                cur_prof = ls.current_proficiency if ls else 0.0
                
                if cur_prof < req_prof:
                    all_completed = False
                if prereqs_met_map.get(sid, False):
                    any_available = True

            if all_completed:
                phase_status = "Completed"
            elif any_available and idx == 1:
                phase_status = "In Progress"
            elif any_available:
                phase_status = "Available"
            else:
                phase_status = "Locked"

            phases.append({
                "phase_number": idx,
                "title": title,
                "skill_ids": tier_skill_ids,
                "status": phase_status,
                "estimated_hours": len(tier_skill_ids) * 12.0
            })

        return phases

    def get_dependency_graph_data(
        self,
        learner_skills_map: Dict[int, LearnerSkill],
        skill_gap_items_map: Dict[int, Any]
    ) -> Dict[str, Any]:
        """
        Builds DAG nodes and edges with tiers, proficiency stats, and satisfaction flags.
        """
        skill_depths = {}
        for node in nx.topological_sort(self.graph):
            preds = list(self.graph.predecessors(node))
            if not preds:
                skill_depths[node] = 1
            else:
                skill_depths[node] = max(skill_depths[p] for p in preds) + 1

        nodes = []
        for node in self.graph.nodes:
            skill = self.graph.nodes[node].get("skill")
            if not skill:
                continue
            item = skill_gap_items_map.get(node)
            tier = skill_depths.get(node, 1)
            cur_prof = item.current_proficiency if item else 0.0
            req_prof = item.required_proficiency if item else 75.0
            gap = item.gap if item else req_prof
            status = item.status if item else "Needs Attention"
            prereqs_met = item.prerequisites_met if item else True

            nodes.append({
                "id": skill.id,
                "name": skill.name,
                "category": skill.category,
                "tier": tier,
                "current_proficiency": round(cur_prof, 1),
                "required_proficiency": round(req_prof, 1),
                "gap": round(gap, 1),
                "status": status,
                "prerequisites_met": prereqs_met
            })

        # Sort nodes by tier then name
        nodes.sort(key=lambda x: (x["tier"], x["name"]))

        edges = []
        for u, v in self.graph.edges:
            source_skill = self.graph.nodes[u].get("skill")
            target_skill = self.graph.nodes[v].get("skill")
            if not source_skill or not target_skill:
                continue
            edge_data = self.graph.get_edge_data(u, v) or {}
            min_req = edge_data.get("min_proficiency", 60.0)
            ls = learner_skills_map.get(u)
            is_sat = (ls.current_proficiency >= min_req) if ls else False

            edges.append({
                "source_id": u,
                "source_name": source_skill.name,
                "target_id": v,
                "target_name": target_skill.name,
                "min_proficiency_required": min_req,
                "is_satisfied": is_sat
            })

        return {"nodes": nodes, "edges": edges}

