---
title: "Booking the Settling Time with Delayed Feedback: Notes on Deng et al. (2024)"
date: "2026-10-12"
tags: [control theory, sliding mode control, predefined-time control, paper notes]
summary: "Close reading of Deng et al., IEEE TAC 2024: a nonsingular predefined-time terminal sliding mode control built on artificial-delay sliding surfaces, with notes on relevance to CAV control."
---

> Yang Deng, Emmanuel Moulay, Vincent Léchappé, Zhang Chen, Bin Liang, Franck Plestan. *Robust Nonsingular Predefined-Time Terminal Sliding Mode Control for Perturbed Chains of Integrators*. IEEE Transactions on Automatic Control, 69(12): 8946–8953, 2024. DOI: [10.1109/TAC.2024.3426554](https://doi.org/10.1109/TAC.2024.3426554); author copy at [hal.science/hal-04637935](https://hal.science/hal-04637935). Affiliations: Department of Automation, Tsinghua University (Deng, Chen, Liang; Chen corresponding), XLIM, Université de Poitiers (Moulay), Ampère, INSA Lyon (Léchappé), LS2N, Nantes Université (Plestan). Supported by NSFC grants 62203252 and 62073183.

## 1. What the paper is after

Terminal sliding mode control (TSMC) sells two things: invariance to matched disturbances once on the sliding surface, and finite-time convergence. The field has moved past "finite" to fixed-time: a settling-time bound independent of initial conditions (Polyakov, 2012). But fixed-time TSMC carries an old defect, singularity: on classical terminal sliding surfaces the control blows up as the state approaches the origin. The existing nonsingular fixed-time TSMC literature (a long line starting with Zuo, 2015) has two common weaknesses:

1. singularity is handled by switching, either between sliding surfaces or between control laws;
2. almost all of it covers double integrators or second-order systems only; high-order chains of integrators are left out.

Pal et al. (2022) and Chen et al. (2022) used time scaling and variable gains to avoid switching altogether, delivering nonsingular predefined-time TSMC, but only for matched disturbances. A separate line is the smooth periodic delayed feedback of Zhou, Michiels and Chen (2021): artificial delays buy fixed-time convergence in a smooth form, at the cost of the robustness defect stated in their Remark 4, namely that controllers built that way do not preserve robust predefined-time stability under perturbations or model uncertainties.

This paper welds the two lines together: keep the *form* of delayed feedback for the sliding surface, and leave robustness to sliding mode theory. The result does four things at once: nonsingular, switching-free, matched and mismatched disturbances, and the extension from double integrators to n-th order chains of integrators.

Terminology first. Predefined-time means the user picks the settling instant T_c up front and tunes the controller for it; convergence happens no later than T_c. Fixed-time only promises a bound independent of initial conditions, indirectly set by parameters. The paper also uses a stricter notion, all nonzero initial conditions converging exactly at T_c, which it calls prescribed-time; I keep the English.

## 2. The core idea: encode the settling instant into when the gain switches on

The building block is a scalar system with an artificial delay (Lemma 3):

```
ζ'(t) = a·ζ(t) − K(t)·ζ(t−h)
```

The gain K(t) is not constant. It is a smooth bump supported on [h, 2h], normalised by W:

```
K(t) = R(t)·e^(a·h)·W·e^(−2a·t)

R(t) = 0                        , t ∈ (−∞, h) ∪ [2h, ∞)
R(t) = M − (t−h)·(2h−t)         , t ∈ [h, 2h]     (M > 1; shape schematic, zero at endpoints)

W = ∫[h→2h] R(θ)·e^(−2aθ) dθ    (computed offline from a, always positive)
```

Claim: for any ζ(0) ≠ 0, ζ(t) hits zero exactly at t = 2h, and stays there since K ≡ 0 afterwards.

The proof skeleton is worth walking through, because it shows where "exactly at the instant" comes from:

- on [0, h): K ≡ 0, the system degenerates to the linear ζ' = a·ζ, with solution ζ(t) = e^(a·t)·ζ(0);
- on [h, 2h]: the delayed term is active and the solution takes the form e^(a·(t−h))·[1 − (1/W)·∫[h→t] R(θ)·e^(−2aθ) dθ]·W·ζ(0). The integrand is positive, the integral increases monotonically, and by the definition of W it reaches exactly 1, so the bracket climbs from 0 to 1 and hits 0 at t = 2h;
- for t ≥ 2h: K ≡ 0 again, ζ' = a·ζ with ζ(2h) = 0, and the origin is kept.

Three observations:

1. the exact instant is manufactured by the normalising integral W, not approached asymptotically; that is the essence of predefined-time as opposed to fixed-time;
2. the claim holds for any a ∈ R; the sign of a shapes the transient but not the settling instant;
3. the delay h is a tuning parameter of the sliding surface, not a physical delay of the plant, and the paper says so explicitly. Implementation needs a buffer of state history over [0, 2h], but h is a small design parameter (0.5 s and 0.75 s in the simulations), so the cost is negligible.

Where does robustness come from? This is the neatest cut in the paper: the delayed feedback lives only in the sliding surface. A sliding surface is a chosen geometry, unaffected by perturbations and independent of the model; disturbances can only enter through the reaching phase, which is handled by the robust fixed-time term of Moulay et al. (2022). Clean separation of duties: the surface decides *when*, the reaching term makes sure it gets there *despite disturbances*, and neither vouches for the other. The robustness defect of Zhou et al.'s delayed feedback is sidestepped this way.

## 3. The mathematical structure

### 3.1 Four notions of stability

| Notion | Criterion | Bound depends on initial state | Bound an explicit function of parameters |
|---|---|---|---|
| Finite time | some T_c(x0) exists | yes | no |
| Fixed time | T_c(x0) ≤ T_c, T_c constant | no | indirect |
| Predefined time | user fixes T_c, convergence by T_c | no | yes |
| Prescribed time | every nonzero initial state converges exactly at T_c | no | yes |

The distinction between the last two is the quiet thread of the paper: the main theorems deliver "by T_c", and Proposition 1 is what upgrades to "exactly at T_c".

### 3.2 The double integrator: a three-phase timeline

The plant is a perturbed double integrator:

```
x1' = x2
x2' = u + d          |d| ≤ δ
```

The sliding surface (17) appends a delayed-feedback term to the linear surface x2 − a·x1:

```
s(t) = x2(t) − (a·x1(t) − K'(t)·x1(t−h))        where K'(t) = K(t−h)
```

The control law (19) is equivalent control plus a robust reaching term:

```
u(t)   = ueq(t) + uF(t)
ueq(t) = a·x2(t) − K̇'(t)·x1(t−h) − K'(t)·x2(t−h)
uF(t)  = −k·|s|^(λ·s²/(1+μ·s²))·sgn(s)
```

uF comes from Moulay et al. (2022): the exponent λ·s²/(1+μ·s²) rises monotonically from 0 to λ/μ as |s| grows, so the term is bounded by k near the origin (no blow-up) and grows like |s|^(λ/μ) far away (strong). Nonsingularity and robust reaching are its job; λ, μ > 0 and k is taken large enough per (6) of the paper so that s is driven to zero before the prescribed instant h.

Plotting when K'(t) is on gives a three-phase closed loop, with h = T_c/3:

| Phase | K'(t) | Surface | Dynamics | Zero at |
|---|---|---|---|---|
| [0, h) | 0 | s = x2 − a·x1 | reaching, s' = uF + d | s by h |
| [h, 2h) | 0 | s = x2 − a·x1 | sliding, x1' = a·x1 | — |
| (2h, 3h) | on | s = x2 − a·x1 + K'·x1(t−h) | sliding, x1' = a·x1 − K'·x1(t−h) | x1 at 3h |
| ≥ 3h | 0 | s = x2 − a·x1 | maintained by uF | kept |

- first phase: K' ≡ 0, the surface degenerates to the linear one and the reaching dynamics are exactly those of Lemma 1 (i.e. Moulay 2022);
- second phase: K'(t) = K(t−h) only becomes nonzero for t > 2h, so sliding is purely linear;
- third phase: the delayed gain is active and the sliding dynamics are Lemma 3 shifted by h, so x1 hits zero exactly at t = 3h; s ≡ 0 together with x1 ≡ 0 forces x2 ≡ 0.

Theorem 1: robust predefined-time stability of the closed loop at t = 3h; shrink h to shorten convergence.

Two snags. First, if the trajectory reaches the surface *at the origin* (Case 1 of the paper), then x1(h) = 0, the delayed phase starts from a zero initial condition, and Lemma 3's exact instant is out of reach; only "by 3h" survives. Proposition 1 patches this: pick a from the initial conditions, a = x2(0)/x1(0) when x1(0) ≠ 0 and a = 0 otherwise, which guarantees x1(h) ≠ 0 and upgrades to prescribed-time. Second, Remark 3 warns that a > 0 makes the steady surface x2 − a·x1 = 0 itself unstable (the sliding phase x1' = a·x1 diverges); harmless in theory since the state is already at the origin, but numerically it is advised to switch a to a negative value after 3h.

Nonsingularity is proved in two halves: boundedness of uF from Moulay (2022); boundedness of ueq, which contains K̇', from Lemma 4 guaranteeing that K' and all its derivatives are globally bounded. No switching, no fractional-power singularity anywhere.

### 3.3 Chains of integrators: cascading the timeline

For a perturbed n-th order chain (x_i' = x_(i+1), i < n; x_n' = u + d) the sliding surfaces are defined recursively:

```
s0 = x1
si(t) = s(i−1)'(t) − (a·s(i−1)(t) − Ki(t)·s(i−1)(t−h))      i = 1…n−1
Ki(t) = K(t − (2n−2i−1)·h)
```

Each surface's gain window opens 2h later than the one above, forming a cascade: s(n−1) is zeroed by the reaching term before h, s(n−2) at 3h, s(i) at (2n−2i−1)·h, and the whole chain at (2n−1)·h. The control law (29) is equivalent control plus the same uF, at the price of needing the derivatives of s(i−1), computed explicitly through the binomial expansion of (28). Theorem 2: robust predefined-time stability at t = (2n−1)·h; the double integrator is the case n = 2.

### 3.4 Mismatched disturbances: the origin is no longer the destination

With mismatched disturbances (x_i' = x_(i+1) + d_i, i < n), the paper first builds a bank of disturbance observers from Moreno's (2021) arbitrary-order fixed-time differentiators (Assumption 1: the mismatched disturbances have bounded derivatives up to order n−i+1; the matched one is bounded), requiring observer settling T_O ≤ h. The observer outputs reconstruct the derivatives of s0, the surface form is unchanged, and the gain windows shift later (Ki(t) = K(t − 2(n−i)·h)). Theorem 3: s(i) is zeroed at 2(n−i)·h, but the closed loop converges to the disturbance-consistent equilibrium trajectory

```
(x1, x2, …, xn) → (0, −d1, −d1' − d2, …, −Σ[i=1→n−1] d_i^(n−i−1))
```

rather than to the origin. That is the inherent boundary of mismatched disturbance rejection: with the disturbance outside the input channel, the strongest control can do is settle the state onto the trajectory along which disturbance and dynamics are consistent. For a practical setting like CAV control, this is a more honest conclusion than "converges to the origin".

## 4. Simulations

Double integrator: h = 0.5 s, T_c = 1.5 s, d = 1.5 + sin(2t), δ = 2.5, k = 18, λ = 3, μ = 1.2, M = 1.00001, W computed offline.

- initial state (1, −2): a = −2, the trajectory starts already on the linear surface, x1(h) = e^(a·h)·x1(0) = 0.368 ≠ 0, and zero is reached exactly at 1.5 s;
- initial state (0, 2): a = 0, the phase portrait turns clockwise onto the x1-axis at (0.083, 0), x1(h) ≠ 0, same exact convergence;
- initial state (1, 0.2): a = 0.2 > 0, after exact convergence a is switched to −1 per Remark 3 and the trajectory stays at the origin;
- Fig 2b: the state norm touches zero exactly at t = 1.5 s for every initial condition.

Triple integrator: h = 0.75 s, a = −3, k = 22, λ = 5, μ = 3, observer T_O = 0.65 s ≤ h; d1 = 0.5 + 0.5·sin(2t), d2 = 1 + 0.2·sin(10t), d3 = 1 + cos(2t), δ = 2.

- s2 is zeroed before 2h = 1.5 s, then s1 and s0 at 4h = 3.0 s and 6h = 4.5 s;
- the states converge to (0, −d1, −d1' − d2) before t = 6h = 4.5 s;
- a second run scales the initial states by 10¹ to 10⁴ and the error norm still vanishes before 6h, a direct check that predefined-time convergence does not care about initial conditions.

## 5. Assessment and things to verify

What it does well:

- nonsingular without switching; the surface is smooth throughout and the control is bounded;
- one structural step from double integrators to n-th order chains, via cascaded surfaces and shifted gain windows;
- matched and mismatched disturbances both covered, the latter with its own observer bank;
- "delayed feedback only inside the surface" simultaneously buys predefined time and dodges the robustness defect of delayed feedback;
- the settling instant becomes an explicit design parameter: T_c = (2n−1)·h (2n·h with mismatched disturbances); shrink h to converge sooner.

Costs and limitations, from my reading, to be checked in reproduction:

- the control needs derivatives of the sliding variables up to order n−1 (clean state measurement) and derivatives of the gains (computable offline);
- the artificial delay requires a buffer of h seconds of state history; smaller h shortens the buffer but enlarges K̇' inside the control law, so tuning has to be watched;
- choosing a is delicate: Proposition 1's a depends on initial conditions, i.e. open-loop tuning, while Remark 3 asks for a sign switch after convergence; how to do that smoothly in closed loop is left open;
- under persistent disturbance, a continuous reaching term means a boundary layer near the surface rather than exact invariance; the paper's "s ≡ 0 for t ≥ 3h" is an ideal sliding-mode statement;
- the disturbance assumptions are not light: bounded matched disturbance, and bounded derivatives for the mismatched ones;
- simulations only; experimental validation and nonlinear triangular systems are listed as future work, and CAV longitudinal dynamics is precisely triangular, so one step remains before direct use.

On CAV relevance: longitudinal collision avoidance and platooning often reduce the relative dynamics to a double or triple integrator (position, velocity, acceleration chain, plus unknown drag and mass perturbations), and predefined-time convergence turns "when does the platoon re-converge" into a design quantity, which fits deadline-driven scenarios such as merge conflict zones and green-light windows better than fixed-time's "there is a bound anyway". The smallest step toward my own topic: reproduce the mismatched triple-integrator case, replace d with speed-dependent drag, and check whether the T_c = 6h tuning and the T_O ≤ h constraint still hold at a realistic sampling rate.

To-do list:

- reproduce Lemma 3 for different a and M, verifying the exact instant is initial-condition independent
- reproduce Fig 2's three initial conditions, focusing on the Case 2 phase portrait
- reproduce Fig 3's mismatched triple integrator and check the necessity of T_O ≤ h
- verify Remark 3: numerical behaviour after 3h with a > 0 and no switching
- measure the boundary-layer width under persistent disturbance versus k
- read Remark 4 of Zhou et al. (2021) to pin down the exact scope of the robustness defect

## References (main ones)

- Deng Y, Moulay E, Léchappé V, Chen Z, Liang B, Plestan F. Robust nonsingular predefined-time terminal sliding mode control for perturbed chains of integrators. IEEE TAC, 69(12): 8946–8953, 2024.
- Polyakov A. Nonlinear feedback design for fixed-time stabilization of linear control systems. IEEE TAC, 57(8): 2106–2110, 2012.
- Bhat S P, Bernstein D S. Finite-time stability of continuous autonomous systems. SIAM J. Control Optim., 38(3): 751–766, 2000.
- Aldana-López R, Seeber R, Gómez-Gutiérrez M, Angulo M T, Defoort M. A redesign methodology generating predefined-time differentiators with bounded time-varying gains. Int. J. Robust Nonlinear Control, 2022.
- Zhou B, Michiels W, Chen J. Fixed-time stabilization of linear delay systems by smooth periodic delayed feedback. IEEE TAC, 67(2): 557–573, 2021.
- Moulay E, Léchappé V, Bernuau E, Plestan F. Robust fixed-time stability: application to sliding mode control. IEEE TAC, 67(2): 1061–1066, 2022.
- Moreno J A. Arbitrary-order fixed-time differentiators. IEEE TAC, 67(3): 1543–1549, 2021.
- Pal A K, Kamal S, Yu X, Nagar S K, Bandyopadhyay B. Free-will arbitrary time terminal sliding mode control. IEEE TCAS-II, 69(7): 3189–3193, 2022.
- Chen Z, Ju X, Wang Z, Li Q. The prescribed time sliding mode control for attitude tracking of spacecraft. Asian J. Control, 24(4): 1650–1662, 2022.
- Zuo Z. Non-singular fixed-time terminal sliding mode control of non-linear systems. IET Control Theory Appl., 9(4): 545–552, 2015.
