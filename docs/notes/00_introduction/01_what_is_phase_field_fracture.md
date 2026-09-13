# What is Phase-Field Fracture?

A crack is a surface across which the material has lost its ability to transmit stress. In a classical (sharp) description, that surface $S$ is an explicit geometric object embedded in the domain $\Omega$: it has to be meshed, tracked, and re-meshed every time it grows, branches, or merges with another crack. In three dimensions, with tens of interacting cracks, this bookkeeping becomes the dominant difficulty.

The phase-field fracture model (PFM) removes the bookkeeping entirely. Instead of tracking $S$, it introduces a smooth scalar field

$$
d(\boldsymbol{x}) \in [0, 1],
$$

defined at every point of the domain, where $d = 0$ denotes intact material and $d = 1$ denotes fully broken material. The sharp surface is replaced by a thin band in which $d$ transitions smoothly from $0$ to $1$. Cracks are then described by a field equation on a fixed mesh, and nucleation, propagation, branching, merging and coalescence all emerge from solving that equation — no explicit crack geometry is ever constructed.

## The two pictures

| | Sharp crack | Phase field |
| --- | --- | --- |
| Crack representation | Surface $S$ with normal $\boldsymbol{n}_S$ | Scalar field $d(\boldsymbol{x})$ |
| Topology changes | Explicit re-meshing / enrichment | Automatic |
| Stress at the tip | Singular ($r^{-1/2}$) | Bounded, regularized over $\ell$ |
| Governing object | Griffith energy balance on $S$ | PDE for $d$ over $\Omega$ |
| Cost driver | Geometry management | Mesh resolution of the damage band |

## The regularization length scale

The width of the transition band is controlled by a length scale $\ell$. The phase field is a *regularized* approximation of the sharp crack: as $\ell \to 0$ the phase-field solution recovers the sharp-crack result, and for finite $\ell$ the damage profile is smeared over a band of order $\ell$.

This single parameter dominates the cost of a simulation. The finite element mesh must resolve the band, which in practice means an element size

$$
h \lesssim \frac{\ell}{4},
$$

*everywhere the crack might go*. For a glacier terminus of a few hundred metres with $\ell$ of order $10\,\mathrm{m}$, this is affordable only if the fine mesh is placed where the crack actually is — which is the problem the [RAMR algorithm](/notes/04_adaptivity/01_why_amr) solves.

## Degradation

The phase field enters the mechanics through a degradation function $g(d)$ that reduces the elastic stiffness as damage accumulates,

$$
\boldsymbol{\sigma}(\boldsymbol{u}, d) = g(d)\, \tilde{\boldsymbol{\sigma}}(\boldsymbol{u}),
\qquad
g(d) = (1 - d)^2 + \kappa,
$$

where $\tilde{\boldsymbol{\sigma}}$ is the effective (undamaged) stress and $\kappa$ is a small residual stiffness that keeps the stiffness matrix non-singular where $d = 1$. Even though undamaged ice is modeled as a linear elastic solid, this coupling makes the full problem nonlinear: damage changes the stress field, and the stress field drives further damage.

## In the code

| Symbol | Meaning | Where it lives |
| --- | --- | --- |
| $\boldsymbol{u}$ | displacement | `displacement` function, CG1 vector space (`src/solver.py`) |
| $d$ | phase field / damage | `damage` function, CG1 space (`src/solver.py`) |
| $\ell$ | regularization length scale | `fracture.length_scale` (`src/config.py`) |
| $\kappa$ | residual stiffness | `fracture.residual_stiffness` |
| $g(d)$ | degradation function | `displacement_forms()` in `src/model.py` |
| $\tilde{\boldsymbol{\sigma}}$ | effective stress | `sigma()` in `src/model.py` |

## Where to go next

- [Why phase-field methods for fracture?](/notes/00_introduction/02_why_phase_field) — what the alternatives cannot do
- [Energy formulation](/notes/01_variational_fracture/01_energy_formulation) — where the equations come from
- [Stress-based driving force](/notes/02_phase_field_models/01_at_models) — the specific model used in SPICE
