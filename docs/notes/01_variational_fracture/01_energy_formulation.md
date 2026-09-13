# Energy Formulation

Everything SPICE solves follows from one energy functional and the principle of minimum potential energy. This page derives the governing equations in the form they are implemented, and points at the code that implements each piece.

## Domain and fields

Consider a three-dimensional solid glacier domain $\Omega \subset \mathbb{R}^3$ with external boundary $\partial\Omega$ and outward unit normal $\boldsymbol{n}$. The unknowns are the displacement field $\boldsymbol{u}$ and the scalar phase field $d$. The boundary is partitioned into disjoint Dirichlet and Neumann parts, $\Gamma_D \cup \Gamma_N = \partial\Omega$ and $\Gamma_D \cap \Gamma_N = \varnothing$.

## Constitutive model

Undamaged glacier ice is modeled as a homogeneous, isotropic, compressible, linearly elastic material. This deliberately avoids the complexity of large deformations associated with an incompressible nonlinear viscous model. The effective stress follows from Hooke's law,

$$
\tilde{\boldsymbol{\sigma}}(\boldsymbol{u})
= \frac{\partial \psi_e}{\partial \boldsymbol{\varepsilon}}
= \lambda\, \mathrm{tr}(\boldsymbol{\varepsilon})\, \boldsymbol{I}
+ 2\mu\, \boldsymbol{\varepsilon},
\qquad
\boldsymbol{\varepsilon} = \nabla^{s}\boldsymbol{u},
$$

with Lamé parameters obtained from Young's modulus $E$ and Poisson's ratio $\nu$,

$$
\lambda = \frac{E\nu}{(1+\nu)(1-2\nu)},
\qquad
\mu = \frac{E}{2(1+\nu)} .
$$

Where tensile stress exceeds the threshold and damage nucleates, the Cauchy stress is the degraded effective stress,

$$
\boldsymbol{\sigma}(\boldsymbol{u}, d) = g(d)\, \tilde{\boldsymbol{\sigma}}(\boldsymbol{u}).
$$

This is what makes an otherwise linear elastic problem nonlinear.

::: tip In the code
`epsilon()` and `sigma()` in `src/model.py` implement $\boldsymbol{\varepsilon}$ and $\tilde{\boldsymbol{\sigma}}$. The Lamé parameters are derived properties of `MaterialConfig` in `src/config.py`, computed through the shear and bulk moduli rather than directly.
:::

## The total energy

The total energy has three contributions — degraded elastic energy, regularized fracture energy, and the external work of the body force $\bar{\boldsymbol{b}}$ (gravity) and surface traction $\bar{\boldsymbol{t}}$ (ocean water pressure):

$$
U =
\underbrace{\int_{\Omega} g(d)\big((\psi_e - \psi_c) + \psi_c\big)\,\mathrm{d}\Omega}_{\text{elastic energy}}
+ \underbrace{\int_{\Omega} 2\psi_c \ell \left( \frac{d^2}{2\ell} + \frac{\ell}{2}|\nabla d|^2 \right) \mathrm{d}\Omega}_{\text{fracture energy}}
- \underbrace{\int_{\Omega} \bar{\boldsymbol{b}} \cdot \boldsymbol{u}\,\mathrm{d}\Omega
- \int_{\partial\Omega} \bar{\boldsymbol{t}} \cdot \boldsymbol{u}\,\mathrm{d}S}_{\text{external energy}} .
$$

Three ingredients deserve attention.

**The degradation function** $g(d) = \left[(1-d)^2 + \kappa\right]$ carries a numerical regularization parameter $\kappa$. It keeps the degraded stiffness strictly positive so the stiffness matrix does not become singular at $d = 1$. It is chosen small enough not to affect the physical response, but large enough to maintain numerical stability and ensure convergence. In the input files this is `fracture.residual_stiffness`, set to $10^{-4}$ throughout.

**The critical energy** $\psi_c = 0.5\,\sigma_c^2 / E$ is the strain energy density corresponding to the critical stress $\sigma_c$ required for damage initiation — the cohesive strength of the material.

**The length scale** $\ell$ controls the width of the diffused crack zone. In strain-energy-based phase-field models $\ell$ can be tied to elastic properties, critical fracture energy and cohesive strength; in the stress-based model used here it is treated as a numerical regularization parameter.

## Mechanical equilibrium

Taking the variation of $U$ with respect to $\boldsymbol{u}$ gives

$$
\nabla \cdot \boldsymbol{\sigma} + \bar{\boldsymbol{b}} = \boldsymbol{0},
\qquad
\bar{\boldsymbol{b}} = \rho \boldsymbol{g} .
$$

There is a practical problem with this form. Applying a body force inside heavily damaged regions produces excessive deformation and numerical instability: the material there has essentially no stiffness, but gravity is still pulling on it. The fix is a second degradation function $\chi(d)$ that removes the body force once damage passes a critical value:

$$
\begin{aligned}
\nabla \cdot \boldsymbol{\sigma} + \chi(d)\,\bar{\boldsymbol{b}} &= \boldsymbol{0} && \text{in } \Omega, \\
\boldsymbol{u} &= \bar{\boldsymbol{u}} && \text{on } \Gamma_D, \\
\boldsymbol{\sigma} \cdot \boldsymbol{n} &= \bar{\boldsymbol{t}} && \text{on } \Gamma_N,
\end{aligned}
$$

with the step function

$$
\chi(d) =
\begin{cases}
1, & d \leq d^{\mathrm{cr}}, \\
0, & d > d^{\mathrm{cr}},
\end{cases}
\qquad d^{\mathrm{cr}} = 0.6 .
$$

Because $\ell$ is much smaller than the domain, the region where $d > d^{\mathrm{cr}}$ is thin, so removing the body force there amounts to treating that region as an empty or air-filled crevasse — which is physically what it is.

::: tip In the code
$\chi(d)$ appears as `load_switch` in `displacement_forms()` (`src/model.py`): a UFL `conditional(gt(old_damage, 0.6), 0.0, 1.0)` multiplying the body-force term. The threshold $d^{\mathrm{cr}} = 0.6$ is fixed in the source, not exposed through the input file. Gravity and the hydrostatic traction themselves are built in `src/boundary.py`.
:::

## Phase-field evolution

Taking the variation of $U$ with respect to $d$ gives

$$
\ell^2 \nabla^2 d - d + (1-d)\,\mathcal{C} = 0,
$$

where $\mathcal{C} = \psi_e/\psi_c - 1$ is the **crack driving force** (CDF). This is the general form; the specific tension-sensitive driving force actually used — and the irreversibility condition that goes with it — are the subject of [the next note](/notes/02_phase_field_models/01_at_models).

## Material parameters

Unless a study states otherwise, all simulations use the following values for glacier ice:

| Parameter | Symbol | Value | Units |
| --- | --- | --- | --- |
| Young's modulus | $E$ | $9500 \times 10^{6}$ | Pa |
| Poisson's ratio | $\nu$ | $0.35$ | – |
| Density of glacial ice | $\rho_i$ | $917$ | kg/m³ |
| Density of seawater | $\rho_s$ | $1020$ | kg/m³ |
| Critical fracture stress | $\sigma_c$ | $0.1185 \times 10^{6}$ | Pa |
| Fracture toughness | $K_c$ | $0.4 \times 10^{6}$ | Pa |

These map directly onto the `[material]` and `[fracture]` sections of every input file.
