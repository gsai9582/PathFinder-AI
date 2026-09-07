# 08 — Adaptive Learning & Dynamic Roadmaps

## Adaptive Mutation Lifecycle

Unlike static learning paths, PathFinder mutates the active roadmap in response to real learning events.

```mermaid
stateDiagram-v2
    [*] --> ActiveModule
    ActiveModule --> SubmitAssessment: Complete Topic
    SubmitAssessment --> EvaluateScore

    state EvaluateScore {
        [*] --> ScoreCheck
        ScoreCheck --> LowScore: Score < 60%
        ScoreCheck --> MidScore: 60% <= Score < 85%
        ScoreCheck --> HighScore: Score >= 85%
    }

    LowScore --> InjectRemedial: Injects Revision Node at Phase Front
    LowScore --> DecreaseConfidence: Decreases Skill Confidence by 0.2
    
    MidScore --> StandardUnlock: Unlocks Next Item + Practice
    
    HighScore --> AccelerateTrack: Marks Current Skill Complete
    HighScore --> UnlockNextPhase: Unlocks Dependent Advanced Phase
    HighScore --> ElevateConfidence: Sets Confidence to High (0.95)

    InjectRemedial --> ActiveModule
    StandardUnlock --> ActiveModule
    AccelerateTrack --> ActiveModule
```

## Feedback Adaptation

When a learner marks an item as **"Too Difficult"**:
1. PathFinder immediately lowers the difficulty weighting for that skill tier.
2. Short, visual, and code-along tutorials are prioritized.
3. Supplementary review resources are highlighted in the Recommendations tab.

When a learner marks an item as **"Too Easy"**:
1. Introductory concepts are automatically marked completed.
2. The learner is invited to take a **Skill Test-Out Assessment** to bypass prerequisites.
