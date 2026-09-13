# Phase-Field Models and the Stress-Based Driving Force

The previous note ended with the phase-field evolution equation

$$
\ell^2 \nabla^2 d - d + (1-d)\,\mathcal{C} = 0,
$$

and left the crack driving force $\mathcal{C}$ unspecified. That choice is what distinguishes phase-field models from one another, and it is the modeling decision that matters most for glacier ice.

## AT1, AT2, and what they assume

The classical Ambrosio–Tortorelli regularizations (AT1 and AT2) and the strain-energy-based models built on them drive damage with the elastic strain energy density. They differ in the shape of the fracture-energy term — AT2 uses $d^2$, giving damage that begins immediately under any load, while AT1 adds a linear term that creates a genuine elastic stage before damage starts.

Both share a limitation for this application: driving fracture with the total strain energy does not properly account for the **tension–compression asymmetry** of fracture. Ice is far weaker in tension than in compression. A model that lets compressive energy drive damage will crack a glacier in places where the material is simply being squeezed.

## The stress-based driving force

SPICE therefore uses a stress-based PFM, in which the driving force is built from the **positive part of the effective stress** only. Define the tensile strain energy density from the positive principal effective stresses $\tilde{\sigma}_a$:

$$
\psi_e^{+} = \frac{1}{2E}\left\| \tilde{\boldsymbol{\sigma}}^{+} \right\|^2
= \frac{1}{2E} \sum_{a=1}^{3} \langle \tilde{\sigma}_a \rangle^2 ,
$$

where $\langle O \rangle = (O + |O|)/2$ are Macaulay brackets. The modified crack driving force is then

$$
\mathcal{C}^{+}(\boldsymbol{x})
= \left\langle \frac{\psi_e^{+}}{\psi_c} - 1 \right\rangle
= \left\langle \left( \frac{\sum_{a=1}^{3} \langle \tilde{\sigma}_a \rangle^2}{\sigma_c^2} \right) - 1 \right\rangle ,
$$

and the strong form of the damage problem becomes

$$
\begin{aligned}
\ell^2 \nabla^2 d - d + (1-d)\,\mathcal{C}^{+} &= 0 && \text{in } \Omega, \\
\nabla d \cdot \boldsymbol{n} &= 0 && \text{on } \Gamma .
\end{aligned}
$$

## The failure envelope

The condition $\mathcal{C}^{+} = 0$ defines a **Rankine-type failure envelope** in principal stress space. Stress states satisfying

$$
\sum_{a=1}^{3} \langle \tilde{\sigma}_a \rangle^2 / \sigma_c^2 \leq 1
$$

remain elastic; equality marks the onset of failure; anything beyond it gives $\mathcal{C}^{+} > 0$ and damage grows. In three dimensions the surface is cube-like with beveled edges of radius $\sigma_c$, because only positive principal stresses contribute.

Two consequences are worth stating plainly:

- Fracture evolves **only** where the material is under sufficient tensile stress, consistent with observations of surface crevasses on glacier ice.
- Because the criterion is written in principal stresses, crack propagation is still captured under macroscopic **shear**, as long as the maximum principal stress is tensile.

## Irreversibility: the history field

Healing is assumed not to occur on the timescales of interest, so the driving force must increase monotonically. This is enforced with a history variable that stores the largest driving force ever experienced at each point:

$$
\mathcal{H}^{+}(\boldsymbol{x}, t) = \max_{\tau \leq t} \mathcal{C}^{+}(\boldsymbol{x}, \tau).
$$

$\mathcal{H}^{+}$ replaces $\mathcal{C}^{+}$ in the damage equation, which guarantees that damage cannot decrease. The assumption behind it is explicit: over short timescales, crevasses do not heal, because physical processes such as creep closure, refreezing and snow bridging are not modeled.

Because RAMR refines the mesh recursively *within* an iteration, updating the history field mid-refinement would freeze in artificial damage. SPICE therefore defers the update until the refinement loop has converged and the solution has been accepted — see [history-field projection](/notes/04_adaptivity/01_why_amr#history-field-projection).

## How this is implemented

`get_energy()` in `src/model.py` builds $\mathcal{C}^{+}$ directly:

1. `get_eigenstate()` computes the three principal values of $\tilde{\boldsymbol{\sigma}}$ in closed form (the trigonometric solution of the characteristic cubic), returning them as a diagonal tensor.
2. `split_plus_minus()` applies Macaulay brackets element-wise to that diagonal, giving $\langle \tilde{\sigma}_a \rangle$.
3. The driving force is assembled as $\sum_a (\langle\tilde{\sigma}_a\rangle/\sigma_c)^2 - 1$, clamped at zero with `ufl.Max`.
4. The result is multiplied by $\zeta$ and returned.

The history maximum itself is applied in `solve_problem()` (`src/solver.py`) as a direct vector operation on the DG0 space:

```python
projected_energy = mproject(get_energy(...), spaces.history, config)
history.vector()[:] = np.maximum(projected_energy.vector()[:], history.vector()[:])
```

## Two implementation parameters

The code exposes two numerical parameters in `[fracture]` that do not appear in the manuscript's equations. Both act on the driving force and both are set per study, so they should be read as part of the numerical setup rather than as material properties:

| Key | Symbol | Effect |
| --- | --- | --- |
| `zeta` | $\zeta$ | multiplies the driving force: $\mathcal{H}^{+} \leftarrow \zeta\,\mathcal{C}^{+}$ |
| `energy_threshold` | – | zeroes $\mathcal{C}^{+}$ wherever it does not exceed this value, suppressing damage nucleation from small over-stress |

The threshold is applied to the *unscaled* $\mathcal{C}^{+}$ before $\zeta$ is applied. Values used in each published study are listed on the corresponding [example pages](/examples/).

## Solved on which spaces

| Field | Space | Reason |
| --- | --- | --- |
| $\boldsymbol{u}$ | vector CG1 | standard displacement discretization |
| $d$ | scalar CG1 | continuous damage field |
| $\mathcal{H}^{+}$ | scalar **DG0** | element-wise constant; prevents spurious widening of the damage zone |

The DG0 choice for the history field is enforced by `validate_config()` in `src/config.py` — the adaptive implementation rejects any other choice.
