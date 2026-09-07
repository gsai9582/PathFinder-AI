# 06 — Skill-Gap Algorithm & Taxonomy Mapping

## Competency Gap Formulation

For each skill $i$ associated with target career $C$:

$$\text{Gap}_i = \max(0, \text{RequiredProficiency}_{C, i} - \text{CurrentProficiency}_i)$$

$$\text{GapPercentage}_i = \left( \frac{\text{Gap}_i}{\text{RequiredProficiency}_{C, i}} \right) \times 100$$

## Priority Tier Classification

PathFinder categorizes each skill into actionable priority tiers based on the proficiency ratio:

$$\text{Ratio}_i = \frac{\text{CurrentProficiency}_i}{\text{RequiredProficiency}_{C, i}}$$

| Priority Tier | Condition | Action Taken by PathFinder |
| :--- | :--- | :--- |
| **Strong** | $\text{Current} \ge 0.9 \times \text{Required}$ | Mark as satisfied; bypass introductory modules |
| **Developing** | $\text{Gap} < 20\%$ | Schedule refinement practice & milestone assessments |
| **Needs Attention** | $20\% \le \text{Gap} < 40\%$ | Schedule core phase modules |
| **Critical Gap** | $\text{Gap} \ge 40\%$ | Flag as top priority; prioritize in early roadmap phases |

## Overall Career Gap Metric

The overall gap score is computed using the importance weights ($w_i$) defined for the career track:

$$\text{OverallGapScore} = \frac{\sum_{i=1}^{N} (\text{Gap}_i \times w_i)}{\sum_{i=1}^{N} w_i}$$

Where $w_i \in [0.5, 2.0]$ reflects the indispensability of skill $i$ for that specific career track.
