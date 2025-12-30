# IAUS Study Website - Design Plan

## Overview
A purely visual, interactive playground for learning the Infinite Axis Utility System (IAUS). No descriptive pages - users dive immediately into hands-on curve manipulation with real-time visual feedback on all graphs.

---

## User Journey

**Immediate Playground Dive** - Users land directly on interactive tools:
```
┌────────────────────────────────────────────────────────────────────┐
│  [Curves]  [Multi]  [Simulator]  [Library]  [Presets]              │
└────────────────────────────────────────────────────────────────────┘
      │         │          │           │          │
      ▼         ▼          ▼           ▼          ▼
   Single    Combine    Compare     Export     Load
   curve     curves     actions      C#       examples
```

---

## Page Structure & Mockups

### Page 1: Single Curve Playground (Default Landing)
```
┌─────────────────────────────────────────────────────────────────────┐
│  [● Curves]  [Multi]  [Simulator]  [Library]  [Presets]            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [Distance Priority________]                      [📋 C#]  [🗑]    │
│                                                                     │
│  ┌───────────────────────────────────────┐  ┌─────────────────────┐│
│  │                                       │  │ [▼ Polynomial]      ││
│  │ 1.0 ┤           ___________           │  │                     ││
│  │     │         /´                      │  │ Exp   [====●===] 2.0││
│  │ 0.8 ┤       /                         │  │ X     [●=======] 0.0││
│  │     │      /     ●                    │  │ Y     [●=======] 0.0││
│  │ 0.6 ┤    /       │                    │  │ Slope [====●===] 1.0││
│  │     │   /        │                    │  │                     ││
│  │ 0.4 ┤  /         │                    │  │ [×] Invert          ││
│  │     │ /          │                    │  │                     ││
│  │ 0.2 ┤/           │                    │  └─────────────────────┘│
│  │     │            │                    │                         │
│  │ 0.0 ┼────────────┼────────────        │  ┌─────────────────────┐│
│  │     0    0.2   0.4   0.6   0.8   1.0  │  │ In  ░░░░░░█░░░ 0.65 ││
│  └───────────────────────────────────────┘  │ Out ░░░░░░░█░░ 0.72 ││
│                                              └─────────────────────┘│
│  ┌─ Saved ─────────────────────────────────────────────────────────┐│
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           ││
│  │  │ Distance │ │ Health   │ │ Threat   │ │ Cooldown │           ││
│  │  │   _/     │ │  \_      │ │   /¯     │ │  __|     │           ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Page 2: Multi-Consideration
```
┌───────────────────────────────────────────────────────────────────────────────────┐
│  [Curves]  [● Multi]  [Simulator]  [Library]  [Presets]     [📋 Curves] [📋 IAUS]│
├───────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  ┌─ CONSIDERATIONS ─────────────────────┐  ┌─ Combined + Compensation ───────────┐│
│  │                                      │  │                                     ││
│  │  ┌─ Distance ──────────────────────┐ │  │  1.0 ┤ ── C1  -- C2  ━━ Raw ░░ Comp││
│  │  │ [▼ Polynomial]  [🔗] [×]        │ │  │      │ \                            ││
│  │  │      /¯¯                        │ │  │  0.8 ┤  \  - - - - -    ░░░░░░░░░  ││
│  │  │     /    ●                      │ │  │      │   \/          ░░░░          ││
│  │  │ Exp [====●===] 2.0              │ │  │  0.6 ┤    \      ░░░░    ━━━━━━━   ││
│  │  │ X   [●=======] 0.0  [×] Invert  │ │  │      │     \ ░░░░   ━━━━           ││
│  │  │ In  [========●===] 0.70 → 0.85  │ │  │  0.4 ┤      ━━━━━━━━━              ││
│  │  └─────────────────────────────────┘ │  │      │  Raw: 0.497  Comp: 0.664    ││
│  │                                      │  │  0.0 ┼─────────────────────────    ││
│  │  ┌─ Health ────────────────────────┐ │  └─────────────────────────────────────┘│
│  │  │ [▼ Logistic]  [🔗] [×]          │ │                                        │
│  │  │      ___/                       │ │  ┌─ Contributions ─────────────────────┐│
│  │  │     /   ●                       │ │  │  Distance  ████████████████░░  0.85││
│  │  │ k   [====●===] 10.0             │ │  │  Health    █████████████░░░░░  0.65││
│  │  │ mid [===●====] 0.5  [×] Invert  │ │  │  Threat    ██████████████████  0.90││
│  │  │ In  [==●=========] 0.30 → 0.65  │ │  │  ─────────────────────────────────  ││
│  │  └─────────────────────────────────┘ │  │  Product   ██████████░░░░░░░  0.497││
│  │                                      │  │  + Comp    ██████████████░░░  0.664││
│  │  ┌─ Threat ────────────────────────┐ │  └─────────────────────────────────────┘│
│  │  │ [▼ Linear]  [🔗] [×]            │ │                                        │
│  │  │    /                            │ │  ┌─ Compensation ──────────────────────┐│
│  │  │   /  ●                          │ │  │  n=3 → mod=0.667  boost=+0.167     ││
│  │  │ m   [======●==] 1.0             │ │  │  1.0 ┤  ░░░░ boost                  ││
│  │  │ b   [●=======] 0.0  [×] Invert  │ │  │  0.6 ┤  ━━━━░░░░░━━━ Comp          ││
│  │  │ In  [==========●=] 0.80 → 0.90  │ │  │      │  ━━━━━━━━━━━━ Raw           ││
│  │  └─────────────────────────────────┘ │  │  0.0 ┼─────────────────────────    ││
│  │                                      │  └─────────────────────────────────────┘│
│  │  [+ New]  [+ From Saved ▼]           │                                        │
│  └──────────────────────────────────────┘                                        │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

### Page 3: Simulator
```
┌───────────────────────────────────────────────────────────────────────────────┐
│  [Curves]  [Multi]  [● Simulator]  [Library]  [Presets]                       │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─ SCENARIO INPUTS ──────────────────────────────────────────────────────────┐
│  │ Distance    Health     Threat     Ammo       Mana       Enemies           │
│  │   0.6        0.2        0.9       0.7        0.5         0.8              │
│  │  ──●──     ──●──      ──●──     ──●──      ──●──       ──●──             │
│  └────────────────────────────────────────────────────────────────────────────┘
│                                                                               │
│  ┌─ ACTION SCORES ────────────────────┐  ┌─ WINNER BREAKDOWN ────────────────┐│
│  │                                    │  │  HEAL (Winner) - Score: 0.82     ││
│  │  Raw          Compensated          │  │                                   ││
│  │                                    │  │  Health   ███████████████░  0.95 ││
│  │  Attack  ████████  ███████████     │  │  InCombat ████████████░░░░  0.80 ││
│  │          0.42      0.58            │  │  Cooldown █████████████████  0.92 ││
│  │                                    │  │  ────────────────────────────────││
│  │  Heal    ██████████████████████ ◄  │  │  Product  ██████████████░░  0.70 ││
│  │          0.71      0.82  WINNER    │  │  +Comp    █████████████████  0.82 ││
│  │                                    │  │                                   ││
│  │  Retreat ██████    █████████       │  └───────────────────────────────────┘│
│  │          0.31      0.48            │                                       │
│  │                                    │  ┌─ ALL ACTIONS BREAKDOWN ───────────┐│
│  │  Buff    ████      ███████         │  │                                   ││
│  │          0.22      0.39            │  │      Dist  Hlth  Thrt  Ammo  Mana ││
│  │                                    │  │  Atk  ██   ░░    ██    ██    ░░   ││
│  └────────────────────────────────────┘  │  Heal ░░   ██    ██    ░░    ██   ││
│                                          │  Ret  ██   ██    ░░    ░░    ░░   ││
│  ┌─ SWEEP: Winner Over Distance ─────────┤  Buff ░░   ░░    ░░    ██    ██   ││
│  │  (Other inputs fixed)                 │       Contribution per factor    ││
│  │                                       └───────────────────────────────────┘│
│  │  1.0 ┤  ██ Attack  ░░ Heal  ▓▓ Retreat  ▒▒ Buff                           │
│  │      │                                                                     │
│  │  0.8 ┤         ░░░░░░░░░░░░░░░░░░                                         │
│  │      │      ░░░░                ░░░░                                       │
│  │  0.6 ┤   ░░░                       ░░░░                                   │
│  │      │████                            ▓▓▓▓                                │
│  │  0.4 ┤██████████                         ▓▓▓▓▓▓                           │
│  │      │     ████████████                      ▓▓▓▓▓▓                       │
│  │  0.2 ┤            ████████                       ▓▓▓▓                     │
│  │      │                                                                     │
│  │  0.0 ┼──────────────────────────────────────────────────                  │
│  │      0    0.2    0.4    0.6    0.8    1.0                                 │
│  │                          ▲ Current                                        │
│  └───────────────────────────────────────────────────────────────────────────┘│
│                                                                               │
│  ┌─ 2D DECISION MAP ─────────────────┐  ┌─ SENSITIVITY ANALYSIS ─────────────┐│
│  │  X: Distance  Y: Health           │  │  How much does each input affect   ││
│  │  Winner at each point:            │  │  the winning action?               ││
│  │                                   │  │                                    ││
│  │  1.0 ┤▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │  │  Health   ████████████████  High  ││
│  │  0.8 ┤▓▓▓▓▓▓░░░░░░░░░░░░▓▓▓▓▓▓   │  │  Threat   ███████████░░░░░  Med   ││
│  │  0.6 ┤▓▓▓▓░░░░░░░░░░░░░░░░▓▓▓▓   │  │  Distance ████████░░░░░░░░  Med   ││
│  │  0.4 ┤▓▓░░░░░░░░░░░░░░░░░░░░▓▓   │  │  Mana     ████░░░░░░░░░░░░  Low   ││
│  │  0.2 ┤████████████████████████   │  │  Ammo     ██░░░░░░░░░░░░░░  Low   ││
│  │  0.0 ┤████████████████████████   │  │                                    ││
│  │      └──────────────────────────  │  │  Current winner: HEAL             ││
│  │      0.0  0.2  0.4  0.6  0.8 1.0  │  │  Margin over 2nd: +0.24           ││
│  │      ██Attack ░░Heal ▓▓Retreat    │  │                                    ││
│  └───────────────────────────────────┘  └────────────────────────────────────┘│
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Page 4: Library
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Curves]  [Multi]  [Simulator]  [● Library]  [Presets]                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─ Config ────────────────────────────────────────────────────────────────┐│
│  │  Type: (●) float  ( ) double     Math: (●) MathF  ( ) Unity Mathf      ││
│  │  [✓] XML Docs    [✓] ICurve                                            ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  ┌─ Preview ───────────────────────────────────────────────────────────────┐│
│  │  // ResponseCurves.cs                                                   ││
│  │  using System;                                                          ││
│  │  using System.Runtime.CompilerServices;                                 ││
│  │                                                                         ││
│  │  public interface ICurve { float Evaluate(float input); }               ││
│  │                                                                         ││
│  │  public readonly struct LinearCurve : ICurve                            ││
│  │  { ... }                                                                ││
│  │                                                   [Scroll ↓]            ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│                            [📋 Copy]    [💾 Download]                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Note:** All curves always exported. AggressiveInlining always included.

### Page 5: Presets
```
┌─────────────────────────────────────────────────────────────────────┐
│  [Curves]  [Multi]  [Simulator]  [Library]  [● Presets]            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─ Curve Types ───────────────────────────────────────────────────┐│
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   ││
│  │  │   /     │ │     _/  │ │   ___/  │ │  \      │ │   /\    │   ││
│  │  │  /      │ │   /     │ │  /      │ │   \     │ │  /  \   │   ││
│  │  │ Linear  │ │  Poly   │ │Logistic │ │ Inverse │ │  Bell   │   ││
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─ Scenarios ─────────────────────────────────────────────────────┐│
│  │  ┌─ Combat AI ──────────────────────────────────────────────┐   ││
│  │  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                  [→]   │   ││
│  │  │  │ Atk │ │Heal │ │ Ret │ │Buff │                        │   ││
│  │  │  │ _/  │ │ \_  │ │ \_  │ │  _  │                        │   ││
│  │  │  └─────┘ └─────┘ └─────┘ └─────┘                        │   ││
│  │  └──────────────────────────────────────────────────────────┘   ││
│  │  ┌─ Target Priority ────────────────────────────────────────┐   ││
│  │  │  ┌─────┐ ┌─────┐ ┌─────┐                          [→]   │   ││
│  │  │  │Dist │ │Hlth │ │Thrt │                                │   ││
│  │  │  └─────┘ └─────┘ └─────┘                                │   ││
│  │  └──────────────────────────────────────────────────────────┘   ││
│  │  ┌─ Resource Gather ────────────────────────────────────────┐   ││
│  │  │  ┌─────┐ ┌─────┐ ┌─────┐                          [→]   │   ││
│  │  │  │ Val │ │Dist │ │Safe │                                │   ││
│  │  │  └─────┘ └─────┘ └─────┘                                │   ││
│  │  └──────────────────────────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

---

## Core Components Needed

### 1. Curve Types to Implement (Expanded from Research)

Based on Dave Mark's GDC presentations and Game AI Pro resources:

| Curve Type | Formula | Parameters |
|------------|---------|------------|
| **Linear** | `y = mx + b` | slope (m), intercept (b) |
| **Polynomial** | `y = x^n` | exponent (n) |
| **Exponential Growth** | `y = a^x` where a>1 | base (a) |
| **Exponential Decay** | `y = a^x` where 0<a<1 | base (a) |
| **Logarithmic** | `y = log_b(x+1)` | base (b) |
| **Logistic (Sigmoid)** | `y = 1/(1+e^(-k(x-m)))` | steepness (k), midpoint (m) |
| **Logit** | `y = log_b(x/(1-x))` | logBase (b) |
| **Smoothstep** | `y = 3x² - 2x³` | none |
| **Smootherstep** | `y = 6x⁵ - 15x⁴ + 10x³` | none |
| **Sine** | `y = sin(kx + offset)` | steepness (k), offset |
| **Cosine (Ease-in)** | `y = 1 - cos(kx)` | steepness (k) |
| **Bell/Gaussian** | `y = e^(-(x-μ)²/2σ²)` | mean (μ), stddev (σ) |
| **Step** | `y = x > t ? 1 : 0` | threshold (t) |
| **Inverse** | `y = 1 - f(x)` | wraps any curve |
| **Piecewise Linear** | `y = segments[i].evaluate(x)` | list of (x,y) points |

Sources:
- [Game AI Pro - Utility Theory](http://www.gameaipro.com/GameAIPro/GameAIPro_Chapter09_An_Introduction_to_Utility_Theory.pdf)
- [Alastair Aitchison - Utility Functions](https://alastaira.wordpress.com/2013/01/25/at-a-glance-functions-for-modelling-utility-based-game-ai/)
- [Dave Mark GDC 2010](https://media.gdcvault.com/gdc10/slides/MarkDill_ImprovingAIUtilityTheory.pdf)

### 2. C# Code Export Architecture

**Two-Part System:**
1. **Static Library** (ResponseCurves.cs) - Added once to project, contains all curve math
2. **Usage Code** - Minimal snippets that reference the static library

---

**Part 1: Static Library (Dedicated Config Page)**

Configurable options:
- Numeric type: float / double
- Math library: System.MathF / Unity Mathf
- XML Documentation: on/off
- ICurve interface: on/off

Always included (not configurable):
- All curve types (no selection)
- AggressiveInlining on all Evaluate methods

```csharp
// ResponseCurves.cs - Add this file to your project once
// EXTREME PERFORMANCE: Zero allocations, struct-based, inline-friendly
using System;
using System.Runtime.CompilerServices;

namespace UtilityAI
{
    /// <summary>Common interface for all response curves</summary>
    public interface ICurve
    {
        float Evaluate(float input);
    }

    // ============== HIGH-PERFORMANCE STRUCT CURVES ==============
    // All curves are structs (stack allocated, no GC pressure)
    // All Evaluate methods are aggressively inlined

    public readonly struct LinearCurve : ICurve
    {
        public readonly float Slope, Intercept;
        public readonly bool Invert;

        public LinearCurve(float slope = 1f, float intercept = 0f, bool invert = false)
        {
            Slope = slope; Intercept = intercept; Invert = invert;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public float Evaluate(float x)
        {
            float result = Slope * x + Intercept;
            return Invert ? 1f - result : result;
        }
    }

    public readonly struct PolynomialCurve : ICurve
    {
        public readonly float Exponent;
        public readonly bool Invert;

        public PolynomialCurve(float exponent = 2f, bool invert = false)
        {
            Exponent = exponent; Invert = invert;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public float Evaluate(float x)
        {
            float result = MathF.Pow(x, Exponent);
            return Invert ? 1f - result : result;
        }
    }

    public readonly struct LogisticCurve : ICurve
    {
        public readonly float Steepness, Midpoint;
        public readonly bool Invert;

        public LogisticCurve(float steepness = 10f, float midpoint = 0.5f, bool invert = false)
        {
            Steepness = steepness; Midpoint = midpoint; Invert = invert;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public float Evaluate(float x)
        {
            float result = 1f / (1f + MathF.Exp(-Steepness * (x - Midpoint)));
            return Invert ? 1f - result : result;
        }
    }

    public readonly struct SmoothstepCurve : ICurve
    {
        public readonly bool Invert;
        public SmoothstepCurve(bool invert = false) => Invert = invert;

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public float Evaluate(float x)
        {
            x = x < 0f ? 0f : (x > 1f ? 1f : x); // Branchless clamp
            float result = x * x * (3f - 2f * x);
            return Invert ? 1f - result : result;
        }
    }

    public readonly struct GaussianCurve : ICurve
    {
        public readonly float Mean, StdDev;
        public readonly bool Invert;

        public GaussianCurve(float mean = 0.5f, float stdDev = 0.2f, bool invert = false)
        {
            Mean = mean; StdDev = stdDev; Invert = invert;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public float Evaluate(float x)
        {
            float diff = x - Mean;
            float result = MathF.Exp(-(diff * diff) / (2f * StdDev * StdDev));
            return Invert ? 1f - result : result;
        }
    }

    public readonly struct StepCurve : ICurve
    {
        public readonly float Threshold;
        public readonly bool Invert;

        public StepCurve(float threshold = 0.5f, bool invert = false)
        {
            Threshold = threshold; Invert = invert;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public float Evaluate(float x)
        {
            float result = x > Threshold ? 1f : 0f;
            return Invert ? 1f - result : result;
        }
    }

    // ... (SmootherstepCurve, SineCurve, CosineCurve, LogitCurve, etc.)

    // ============== IAUS UTILITY SCORING ==============

    public static class IAUSScorer
    {
        /// <summary>Apply compensation factor to prevent score collapse</summary>
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static float ApplyCompensation(float score, int considerationCount)
        {
            float modFactor = 1f - (1f / considerationCount);
            return score + ((1f - score) * modFactor * score);
        }

        /// <summary>Score with early termination on zero</summary>
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static float ScoreWithTermination(float currentScore, float newValue)
        {
            if (newValue <= 0f) return 0f;
            return currentScore * newValue;
        }
    }
}
```

---

**Part 2: Usage Code (Stack-Allocated, Zero GC)**

On Single Curve page - minimal struct instantiation:
```csharp
// Distance Priority - stack allocated, no heap
var distanceCurve = new PolynomialCurve(exponent: 2.0f, invert: false);
float score = distanceCurve.Evaluate(normalizedDistance);
```

On Multi-Consideration page - IAUS scorer with structs:
```csharp
// Combat Action Scorer - all structs on stack
public float ScoreAttackAction(float enemyDist, float enemyHealth, float ammo)
{
    // Curves are structs - created on stack, no allocations
    var distCurve = new PolynomialCurve(exponent: 2.0f, invert: true);
    var healthCurve = new LogisticCurve(steepness: 10f, midpoint: 0.3f);
    var ammoCurve = new LinearCurve(slope: 1f);

    float score = 1f;
    score = IAUSScorer.ScoreWithTermination(score, distCurve.Evaluate(enemyDist));
    score = IAUSScorer.ScoreWithTermination(score, healthCurve.Evaluate(enemyHealth));
    score = IAUSScorer.ScoreWithTermination(score, ammoCurve.Evaluate(ammo));

    return IAUSScorer.ApplyCompensation(score, 3);
}
```

Pre-cached curves for hot paths (stored in class fields as value types):
```csharp
public class CombatAI
{
    // Curves stored as value type fields - no boxing, no GC
    private readonly PolynomialCurve _distanceCurve = new(exponent: 2.0f, invert: true);
    private readonly LogisticCurve _healthCurve = new(steepness: 10f, midpoint: 0.3f);
    private readonly LinearCurve _ammoCurve = new(slope: 1f);

    public float ScoreAttack(float dist, float health, float ammo)
    {
        float score = _distanceCurve.Evaluate(dist);
        score = IAUSScorer.ScoreWithTermination(score, _healthCurve.Evaluate(health));
        score = IAUSScorer.ScoreWithTermination(score, _ammoCurve.Evaluate(ammo));
        return IAUSScorer.ApplyCompensation(score, 3);
    }
}
```

---

**UI: Copy Buttons**
- Library Config page: [Copy ResponseCurves.cs] + [Download .cs file] (full static library with all curves)
- Single Curve page: [Copy C# Code] (minimal struct instantiation for current curve)
- Multi-Consideration page: [Copy All Curves] + [Copy IAUS Scorer] (scorer class with all considerations)

### 3. Page Cross-Linking Navigation

**From Multi-Consideration → Single Curve Editor:**
```
┌─ Consideration 1 ───────────────┐
│ [▼ Distance (saved)]  [×]       │
│ Type: [▼ Polynomial]            │
│      /¯¯                        │
│ [🔗 Edit in Curve Editor]  ←────── Opens Single Curve page with this curve loaded
│ ...                             │      (Navigation state preserved, back button returns here)
└─────────────────────────────────┘
```

**Navigation Flow:**
- Click "Edit in Curve Editor" → Opens Single Curve page with curve loaded
- URL updates to `/curves?edit=consideration-1&returnTo=multi`
- "← Back to Multi-Consideration" button appears
- Changes sync back when returning

**Tab Navigation with Context:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Curves]  [Multi-Consideration]  [Simulator]  [Library]  [Presets]        │
│                                                    ↑                        │
│                                          NEW: Library Config Page           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3. Interactive Parameters
- Exponent/Power
- X-shift (horizontal translation)
- Y-shift (vertical translation)
- Slope/Steepness
- Threshold points
- Invert toggle

### 3. Graph Components
- **Single Curve Graph**: Shows one curve with parameter controls
- **Multi-Curve Overlay**: Shows multiple considerations on same graph
- **Bar Chart**: Compares action scores
- **Comparison Chart**: Raw vs Compensated scores
- **Real-time Updates**: All graphs update as sliders move

---

## Technical Stack (Confirmed)

```
Frontend Framework: React + TypeScript
Charting Library:  Recharts
Styling:           Tailwind CSS (Light theme)
State Management:  Zustand + localStorage persistence
Routing:           React Router (multi-page)
Math:              Simple JS functions
Build:             Vite
```

### Key Features Included
- **Multi-page routes** - Separate pages for Playground, Action Builder, Simulator, Library
- **State persistence** - Save user configurations to localStorage
- **Light theme** - Clean, professional appearance
- **Mobile responsive** - Touch-friendly sliders, stacked layouts on small screens
- **Pre-built examples** - Combat AI, Resource Gathering, Target Prioritization scenarios

---

## File Structure
```
src/
├── components/
│   ├── graphs/
│   │   ├── CurveGraph.tsx          # Interactive curve with draggable point
│   │   ├── InputOutputGraph.tsx    # Input → output bar visualization
│   │   ├── CombinedCurveGraph.tsx  # Overlay curves + raw + compensated
│   │   ├── ContributionBars.tsx    # Per-consideration contribution bars
│   │   ├── ActionBarChart.tsx      # Raw + compensated score bars
│   │   ├── BreakdownGraph.tsx      # Winner action breakdown
│   │   ├── AllActionsHeatmap.tsx   # Factor contribution per action
│   │   ├── WinnerSweepGraph.tsx    # Winner across input range
│   │   ├── DecisionMap2D.tsx       # 2D heatmap of winners
│   │   └── SensitivityGraph.tsx    # Input sensitivity analysis
│   ├── controls/
│   │   ├── CurveTypeSelector.tsx   # Dropdown for curve type
│   │   ├── ParameterSlider.tsx     # Real-time parameter control
│   │   ├── ScenarioInputs.tsx      # Multiple draggable inputs
│   │   ├── ConsiderationCard.tsx   # Mini curve with embedded controls
│   │   ├── SavedCurvePicker.tsx    # Dropdown to select saved curve
│   │   └── CurveNameInput.tsx      # Name + save button
│   ├── layout/
│   │   ├── TabNav.tsx              # Top navigation tabs
│   │   └── PageContainer.tsx       # Common page wrapper
│   └── pages/
│       ├── CurvesPage.tsx          # Single curve + save/library + usage code copy
│       ├── MultiConsiderationPage.tsx  # Left controls, right graphs, cross-links
│       ├── SimulatorPage.tsx       # Dense multi-graph layout
│       ├── LibraryPage.tsx         # C# ResponseCurves.cs config + export
│       └── PresetsPage.tsx         # Visual presets grid
├── lib/
│   ├── curves.ts                   # All curve math functions (15 curve types)
│   ├── compensation.ts             # IAUS compensation formula
│   ├── codeGen.ts                  # C# code generation (single + module)
│   ├── presets.ts                  # Built-in curve types + scenarios
│   └── types.ts                    # TypeScript interfaces
├── stores/
│   └── iausStore.ts                # Zustand: saved curves, state, localStorage
└── App.tsx                         # Router setup
```

---

## Implementation Order

### Phase 1: Project Setup & Core Math
1. Initialize Vite + React + TypeScript project
2. Install dependencies (Recharts, Tailwind, Zustand, React Router)
3. Implement `lib/curves.ts` - all curve math functions
4. Implement `lib/compensation.ts` - IAUS compensation formula
5. Implement `lib/types.ts` - TypeScript interfaces for curves, actions, considerations
6. Create app layout with tab navigation (no landing page)

### Phase 2: Single Curve Playground + Save System
1. Build `CurveGraph.tsx` - interactive curve with draggable point
2. Build `ParameterSlider.tsx` for real-time parameter adjustment
3. Build `InputOutputGraph.tsx` - input/output bar visualization
4. Build `CurveNameInput.tsx` - name field + save button
5. Build saved curves library display with thumbnails
6. Implement `lib/codeGen.ts` - C# code generation:
   - `generateSingleCurveCode(curve)` - standalone function
   - `generateFullModule(curves)` - complete ResponseCurves class with factory
7. Add copy-to-clipboard buttons for C# code export
8. Implement Zustand store for saved curves + localStorage persistence
9. Wire up real-time updates on all parameter changes

### Phase 3: Multi-Consideration Page + Cross-Linking
1. Build `ConsiderationCard.tsx` - expandable card with:
   - Curve type selector dropdown
   - Full parameter sliders (curve-type-specific)
   - Input value slider
   - Mini curve preview
   - Output display
   - "Edit in Curve Editor" link (cross-page navigation)
2. Build `SavedCurvePicker.tsx` - dropdown to load saved curves
3. Build `CombinedCurveGraph.tsx` - overlays all curves + raw + compensated
4. Build `ContributionBars.tsx` - per-consideration output bars
5. Implement add/remove considerations dynamically
6. Add C# copy buttons: [Copy Usage Code] [Copy Scorer Class]
7. Implement cross-linking navigation:
   - URL state for editing context (`?edit=consideration-1&returnTo=multi`)
   - "Back to Multi-Consideration" button on Single Curve page
   - State sync on return
8. All graphs update in real-time as any parameter OR input changes

### Phase 4: Library Config Page
1. Build `LibraryPage.tsx` - C# code configuration UI:
   - Radio buttons: float/double
   - Radio buttons: System.MathF/Unity Mathf
   - Checkbox: XML Documentation
   - Checkbox: ICurve interface
   - Always exports ALL curves (no selection UI)
   - Always includes AggressiveInlining (no toggle)
2. Build `lib/codeGen.ts` - C# code generation:
   - `generateLibraryCode(config)` - full ResponseCurves.cs with all curve structs
   - `generateUsageCode(curve)` - minimal struct instantiation (for single curve page)
   - `generateScorerClass(considerations)` - IAUS scorer (for multi-consideration page)
3. Build live preview panel showing generated code
4. Copy to clipboard + download .cs file buttons

### Phase 5: Action Simulator (Dense Graphs)
1. Build `ScenarioInputs.tsx` - compact draggable sliders
2. Build `ActionBarChart.tsx` - raw + compensated score bars
3. Build `BreakdownGraph.tsx` - winner action consideration breakdown
4. Build `AllActionsHeatmap.tsx` - factor contribution per action grid
5. Build `WinnerSweepGraph.tsx` - winner across single input range
6. Build `DecisionMap2D.tsx` - 2D heatmap of winners (X vs Y input)
7. Build `SensitivityGraph.tsx` - input sensitivity ranking

### Phase 6: Presets Page
1. Create `lib/presets.ts` - built-in curve types + example scenarios
2. Build `PresetsPage.tsx` - visual grid of curves and scenarios
3. Implement load preset → applies config and navigates to relevant page

---

## Pre-built Example Scenarios

### Combat AI Example
```
Actions:
- Attack: [Distance (inverse), Enemy Health (low priority), Ammo Available]
- Heal:   [My Health (inverse), In Combat, Heal Cooldown Ready]
- Retreat:[My Health (inverse), Enemy Count, Escape Route Available]
- Buff:   [Buff Available, Not In Combat, Ally Nearby]
```

### Target Prioritization Example
```
Considerations:
- Distance: Polynomial inverse (closer = higher)
- Health:   Linear inverse (low health = finish off)
- Threat:   Logistic (dangerous first)
- Type:     Step function multipliers
```
