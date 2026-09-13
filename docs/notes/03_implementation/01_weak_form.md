# Weak Form and Solution Strategy

This note turns the strong form into the linear systems the code actually assembles, and walks through one solver iteration end to end.

## Galerkin weak form

Find $\boldsymbol{u} \in \mathcal{V}$ and $d \in \mathcal{S}$ such that, for all test functions $\boldsymbol{v} \in \mathcal{V}$ and $\omega \in \mathcal{S}$:

$$
\int_{\Omega} \boldsymbol{\sigma} : \nabla \boldsymbol{v} \,\mathrm{d}\Omega
= \int_{\Omega} \chi(d)\, \bar{\boldsymbol{b}} \cdot \boldsymbol{v} \,\mathrm{d}\Omega
+ \int_{\Gamma_N} \bar{\boldsymbol{t}} \cdot \boldsymbol{v} \,\mathrm{d}S ,
$$

$$
\int_{\Omega} \left(1 + \mathcal{H}^{+}\right) d\, \omega \,\mathrm{d}\Omega
+ \int_{\Omega} \ell^2 \nabla d \cdot \nabla \omega \,\mathrm{d}\Omega
= \int_{\Omega} \mathcal{H}^{+} \omega \,\mathrm{d}\Omega .
$$

The vector-valued space $\mathcal{V}$ and scalar space $\mathcal{S}$ are chosen piecewise linear and continuous (order-1 CG elements in FEniCS). The history variable lives in a separate space $\mathcal{D}$ that is piecewise constant and discontinuous (order-0 DG elements), which keeps the damage zone from widening spuriously.

## No load steps

In most phase-field simulations the external load or displacement is applied incrementally over many steps. Glacier fracture is different: the body force due to gravity in the domain, and the ocean pressure at the terminus, are applied **in one step** and held constant. There is no load increment and no pseudo-time stepping in the usual sense.

Propagation instead occurs under sustained load, because of the nonlinear coupling between stress and damage. Once damage initiates where the local tensile stress exceeds the material strength, it alters the stress field, which creates more damage — a positive feedback loop that has to be iterated to a fixed point. The simulation terminates when no further crack propagation occurs: either the crack has reached full thickness, or the stress at its tip has fallen below $\sigma_c$.

## Alternate minimization

The coupled system is solved with the **alternate minimization** (AM, or staggered) scheme. At iteration $j+1$, the converged fields ${}_{j}\boldsymbol{u}$ and ${}_{j}d$ from the previous iteration serve as the initial guess, and two solves are performed in sequence:

**Step 1 — hold damage fixed, solve for displacement:**

$$
\int_{\Omega} \boldsymbol{\sigma}({}_{j+1}\boldsymbol{u}, {}_{j}d) : \nabla \boldsymbol{v} \,\mathrm{d}\Omega
= \int_{\Omega} \chi({}_{j}d)\, \bar{\boldsymbol{b}} \cdot \boldsymbol{v} \,\mathrm{d}\Omega
\quad \forall\, \boldsymbol{v} \in \mathcal{V}.
$$

**Step 2 — hold displacement fixed, solve for damage:**

$$
\int_{\Omega} \left(1 + {}_{j+1}\mathcal{H}^{+}\right) {}_{j+1}d\, \omega \,\mathrm{d}\Omega
+ \int_{\Omega} \ell^2 \nabla {}_{j+1}d \cdot \nabla \omega \,\mathrm{d}\Omega
= \int_{\Omega} {}_{j+1}\mathcal{H}^{+} \omega \,\mathrm{d}\Omega
\quad \forall\, \omega \in \mathcal{S},
$$

where ${}_{j+1}\mathcal{H}^{+}$ is the history variable computed from the new displacement field ${}_{j+1}\boldsymbol{u}$.

Both steps are **linear** once the other field is frozen, so each is a single `LinearVariationalProblem` — no Newton iteration is required inside a step.

## One iteration, in code

`solve_problem()` in `src/solver.py` performs exactly this sequence:

```python
displacement_solver.solve()                              # step 1
projected_energy = mproject(get_energy(...), history)    # C+ on DG0
history.vector()[:] = np.maximum(projected_energy.vector()[:],
                                 history.vector()[:])    # irreversibility
damage_solver.solve()                                    # step 2
damage_new.vector()[:] = np.clip(damage_new.vector()[:], 0.0, 1.0)
```

The order matters. The displacement solve uses the *old* damage field; the driving force is then evaluated from the *new* displacement; and only then is the damage updated. The final `clip` enforces $d \in [0,1]$ pointwise, which the linear damage solve does not guarantee on its own.

The forms themselves are built in `src/model.py`:

| Function | Builds |
| --- | --- |
| `displacement_forms()` | $\left[(1-d)^2 + \kappa\right]\tilde{\boldsymbol{\sigma}} : \boldsymbol{\varepsilon}(\boldsymbol{v})\,\mathrm{d}x$ and the $\chi(d)\bar{\boldsymbol{b}}$, $\bar{\boldsymbol{t}}$ load terms |
| `phase_field_forms()` | $\left(\ell^2 \nabla d \cdot \nabla \omega + d\,\omega + \mathcal{H}^{+} d\,\omega\right)\mathrm{d}x = \mathcal{H}^{+}\omega\,\mathrm{d}x$ |
| `get_energy()` | $\mathcal{C}^{+}$ from the positive principal effective stresses |

## Convergence

Because all external loads and displacement constraints are applied at the beginning and kept constant, there are no load steps: the simulation terminates when no further damage evolves with further iteration, indicating that the system has reached a stable configuration.

The manuscript defines the convergence metric as the maximum relative $L^2$ error over both fields,

$$
\mathcal{E} = \max\left(
\frac{\left\| {}_{j+1}\boldsymbol{u} - {}_{j}\boldsymbol{u} \right\|_{L^2(\Omega)}}{\left\| {}_{j+1}\boldsymbol{u} \right\|_{L^2(\Omega)}},
\;
\frac{\left\| {}_{j+1}d - {}_{j}d \right\|_{L^2(\Omega)}}{\left\| {}_{j+1}d \right\|_{L^2(\Omega)}}
\right),
$$

evaluated with `assemble()` rather than the built-in norm function, for performance. The iteration stops when $\mathcal{E}$ falls below a prescribed tolerance, taken as $10^{-4}$.

## Linear solvers

Both variational problems and all projections use the same configurable pair:

| Key | Default | Used for |
| --- | --- | --- |
| `solver.linear_solver` | `gmres` | displacement and damage systems |
| `solver.preconditioner` | `hypre_euclid` | |
| `solver.projection_linear_solver` | `gmres` | `mproject()` — driving force, markers, transfers |
| `solver.projection_preconditioner` | `hypre_euclid` | |

`mproject()` in `src/solver.py` is a thin wrapper over dolfin's `project()` that routes every projection through these settings instead of the default direct solver — which matters, because projections are performed on every refinement level.

## Pseudo-time in the output

The XDMF time index written to `output.xdmf` is the AM iteration counter, not a physical time. Each accepted iteration is one frame. Reading the output as an animation shows the fracture evolving toward its stable configuration, but the frame spacing carries no physical duration.

## Where to go next

- [Recursive adaptive mesh refinement](/notes/04_adaptivity/01_why_amr) — what happens *inside* each AM iteration
- [The input file reference](/examples/00_setup/02_input_file_reference) — every key referenced above
