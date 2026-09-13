# Recursive Adaptive Mesh Refinement (RAMR)

Accurately describing surface crevasse growth and interaction requires metre-scale resolution over kilometre-scale domains. With a conventional uniform mesh this is computationally infeasible — millions to billions of nodal degrees of freedom. RAMR is the algorithm that makes it affordable.

## Why not just refine locally?

The obvious alternative is a locally refined (LR) mesh: put fine elements where you expect the crack. That requires **guessing the crack path before the simulation**, which is impractical when the path is the answer you are looking for, and hopeless when crevasses curve, coalesce, or arrest depending on their neighbours.

Existing load-stepping-based AMR algorithms do not help either. They were developed for laboratory specimens, where crack propagation is driven by applied force or displacement increments, and refinement is triggered per load step. Glacier fracture has no load steps — gravity and seawater pressure are applied at the beginning and maintained throughout — so there is no natural point at which to refine.

RAMR instead operates **inside** the alternate minimization iteration, using an accept–reject loop. It detects damage initiation automatically and refines the mesh appropriately without any manual intervention or prior specification of crack locations.

## The algorithm

Let $\mathcal{T}^{\mathcal{L}}$ denote the finite element mesh at refinement level $\mathcal{L}$, and ${}_{j}\boldsymbol{u}^{\mathcal{L}}$, ${}_{j}d^{\mathcal{L}}$ the fields at AM iteration $j$.

**1. Solve.** Compute the new fields ${}_{j+1}\boldsymbol{u}^{\mathcal{L}}$ and ${}_{j+1}d^{\mathcal{L}}$ on the current mesh using the two weak forms.

**2. Mark.** Build the refinement indicator set from every element where the phase field is nonzero:

$$
\mathcal{M} = \left\{ e \in \mathcal{T}^{\mathcal{L}} \;\middle|\; \exists\, \boldsymbol{x} \in e : \; {}_{j+1}d^{\mathcal{L}}(\boldsymbol{x}) > 0 \right\}.
$$

**3. Unmark.** This would include damaged regions that are already fine enough. To prevent over-refinement, drop elements whose size is already below the user-defined minimum resolution $h_{\min}$:

$$
\mathcal{M} \leftarrow \mathcal{M} \setminus \left\{ e \in \mathcal{M} \;|\; h(e) < h_{\min} \right\},
$$

where $h(e)$ is a measure of the size of element $e$.

**4. Accept or reject.** If $\mathcal{M} = \varnothing$, the mesh already resolves the damage: **accept** iteration $j+1$ and check convergence. If $\mathcal{M} \neq \varnothing$, **reject** it.

**5. Refine and transfer.** On rejection, refine the marked elements,

$$
\mathcal{T}^{\mathcal{L}+1} = \texttt{refine}\!\left(\mathcal{T}^{\mathcal{L}}, \mathcal{M}\right),
$$

and interpolate the **old** fields onto the new mesh,

$$
{}_{j}\boldsymbol{u}^{\mathcal{L}+1},\; {}_{j}d^{\mathcal{L}+1},\; {}_{j}\mathcal{H}^{+\,\mathcal{L}+1}
= \texttt{transfer}\!\left({}_{j}\boldsymbol{u}^{\mathcal{L}},\; {}_{j}d^{\mathcal{L}},\; {}_{j}\mathcal{H}^{+\,\mathcal{L}},\; \mathcal{T}^{\mathcal{L}+1}\right),
$$

then return to step 1. The transferred old fields become the initialization for re-solving at iteration $j+1$ on the refined mesh.

The process is **recursive**: the refinement loop continues until the new phase field triggers no further refinement. Crevasse evolution is therefore always resolved on a sufficiently refined mesh in the narrow damaged region, and no *a priori* refinement is needed anywhere else.

## Convergence and field update

Only once $\mathcal{M} = \varnothing$ are the new fields checked for convergence, using the relative error metric $\mathcal{E}$ defined in [the implementation note](/notes/03_implementation/01_weak_form#convergence). If $\mathcal{E}$ is below tolerance ($10^{-4}$), the alternate minimization loop terminates; otherwise the accepted fields are assigned as the new old fields and the next AM iteration begins.

### History-field projection

The history field enforces crack irreversibility by retaining the maximum experienced tensile driving force at each point. Because RAMR refines the mesh recursively, applying the history condition on an intermediate mesh would lock in damage that the accepted solution does not support.

SPICE therefore **defers the history update until after the refinement loop has converged**. When the marked set is empty and the solution $\left({}_{j+1}\boldsymbol{u}^{\mathcal{L}},\; {}_{j+1}d^{\mathcal{L}}\right)$ is accepted, the current driving force is used to update the history field,

$$
{}_{j+1}\mathcal{H}^{+\,\mathcal{L}}(\boldsymbol{x}) = \max\left({}_{j}\mathcal{H}^{+\,\mathcal{L}}(\boldsymbol{x}),\; {}_{j+1}\mathcal{C}^{+\,\mathcal{L}}(\boldsymbol{x})\right),
$$

element-wise on the DG0 space. If the mesh was refined during the loop, the prior history field must first be transferred onto the accepted mesh so the comparison is well posed. Updating only after acceptance guarantees physical consistency and irreversibility, and avoids artificial damage activation during intermediate refinement stages.

## How this maps to the code

The whole algorithm lives in `src/adaptivity.py`.

| Step | Function | Notes |
| --- | --- | --- |
| Solve | `solve_problem()` (`src/solver.py`) | called at the top of the inner loop |
| Mark | `get_markers()` | projects $d$ onto DG0 and marks cells above `adaptivity.damage_threshold` |
| Unmark | `get_markers()` | unmarks cells whose `Circumradius(mesh)/3.0` is below `adaptivity.target_hmin` |
| Accept test | `get_markers()` | `communicator.allreduce(..., op=pyMPI.LAND)` — the loop exits only when **no rank** has a marked cell |
| Refine | `refine(mesh, marker)` | dolfin, with `parameters["refinement_algorithm"] = "plaza_with_parent_facets"` |
| Transfer | `transfer_to_space()` | `PETScDMCollection.create_transfer_matrix` between old and new spaces |
| Orchestration | `run_adaptive()` | outer AM loop, output, checkpoints, metrics |

Two details differ from the idealized description above and are worth knowing:

- **The marking criterion is a threshold, not $d > 0$.** `get_markers()` marks cells where the DG0-projected damage exceeds `adaptivity.damage_threshold` (typically $0.1$), which avoids chasing round-off-level damage.
- **Element size is the circumradius divided by three.** That is the $h(e)$ compared against `adaptivity.target_hmin`.

The published studies set `target_hmin` $= \ell/4$: $2.5\,\mathrm{m}$ for $\ell = 10\,\mathrm{m}$, $1.25\,\mathrm{m}$ for $\ell = 5\,\mathrm{m}$, and $5.0\,\mathrm{m}$ for $\ell = 20\,\mathrm{m}$.

Memory is managed explicitly inside the loop: references to the old mesh's spaces and functions are deleted and `gc.collect()` is called after every transfer, because the refined meshes are large and Python's reference cycles would otherwise keep several mesh generations alive at once.

## Known limitation

The refinement step itself does **not** scale well in parallel. See [parallel performance](/notes/05_hpc/01_parallel_scaling) for the measured component-wise timings and why mesh conformity across MPI subdomains is the cause.
