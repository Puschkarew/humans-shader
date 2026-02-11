---
module: Particle Render Pipeline
date: 2026-02-11
problem_type: ui_bug
component: frontend_stimulus
symptoms:
  - Particle contour looked smooth/blurred, and reference-like grain/noise was barely visible.
  - Color controls worked better, but particle edge lost the original organic shape character.
  - Tuning contour settings produced weak visual impact after post-processing.
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags: [webgl, shader, particle, bokeh, blue-noise, contour]
---

# Troubleshooting: Missing Particle Contour Noise After Bokeh Pipeline

## Problem
The particle color controls became more predictable, but the contour stopped looking like the reference. The edge noise existed in code, yet the final rendered image still looked too smooth.

## Environment
- Module: Particle Render Pipeline
- Affected Component: Frontend WebGL shader pipeline (`reveal -> sine -> shatter -> bokeh -> output`)
- Date: 2026-02-11
- Stage: Post-implementation visual parity tuning

## Symptoms
- Reference screenshot showed textured, grainy particle edges; implementation looked airbrushed.
- User feedback: contour appeared unchanged or effect too weak.
- No runtime errors in JS; issue was visual and pipeline-order dependent.

## What Didn't Work

**Attempted Solution 1:** Add contour noise in `reveal` pass only.
- **Why it failed:** Noise was injected before `bokeh`, so high-frequency edge detail got softened by downstream blur and became hard to perceive.

**Attempted Solution 2:** Keep very small contour perturbation in output compositing.
- **Why it failed:** Edge mask and amplitude were too conservative, so real-time tuning barely changed visible contour structure.

## Solution
Moved and strengthened contour noise where final pixels are composited, while keeping color fidelity logic intact.

**Code changes** (key excerpts):
```glsl
// index.html (outputFragmentSource)
float edgeBand = pow(clamp(1.0 - abs(particleAlpha * 2.0 - 1.0), 0.0, 1.0), 0.34);
float noiseA = sampleBlueNoise(vUv + vec2(particleAlpha * 0.13, 0.0), 3.4);
float noiseB = sampleBlueNoise(vUv + vec2(0.29, 0.47), 7.8);
float contourNoise = noiseA * 0.74 + noiseB * 0.26;
float contourStrength = uContourNoise * (0.85 + uContourNoise * 1.6);
float contourJitter = contourNoise * contourStrength * edgeBand * 0.95;
float noisyAlpha = clamp(particleAlpha + contourJitter, 0.0, 1.0);
```

```js
// index.html
PARTICLE_CONTOUR_NOISE: 0.46,
{ id: "PARTICLE_CONTOUR_NOISE", min: 0.0, max: 1.5, ... }
```

Additional fix:
- Blue-noise texture sampling kept as nearest filtering to preserve grain character.

Validation:
- Manual browser verification by user confirmed “всё ок”.

## Why This Works
The previous implementation generated contour irregularity too early in the pipeline. Because bokeh/post-processing came later, edge micro-detail was visually attenuated. Applying contour modulation in the final output stage preserves high-frequency detail at presentation time, so the user can actually see and tune the noise. Expanding contour-noise range and using a broader edge band makes the control perceptually responsive without breaking white-center behavior.

## Prevention
- For visual effects that must survive blur, inject final contour detail in the last compositing stage.
- Document pass ownership explicitly: `reveal` for shape mask, `bokeh` for blur character, `output` for final contour/detail and color composition.
- Keep one reference screenshot pair (reference vs current) for parity checks after shader tuning.
- When adding new visual controls, validate both parameter responsiveness and final-frame visibility.

## Related Issues
No related issues documented yet.

## References
- Plan: `/Users/vladimirpuskarev/Documents/Humans Refresh/docs/plans/2026-02-11-fix-reference-particle-contour-noise-parity-plan.md`
- Brainstorm: `/Users/vladimirpuskarev/Documents/Humans Refresh/docs/brainstorms/2026-02-11-particle-color-falloff-brainstorm.md`
