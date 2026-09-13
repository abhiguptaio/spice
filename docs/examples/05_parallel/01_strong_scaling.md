# Parallel Performance and the Kilometre-Scale Field

> **Input files:** `examples/4.5.parallel/01-06.toml`, `examples/4.5.parallel/07.toml`
> **Meshes:** `data/mesh/10`, `data/mesh/11`
> **Manuscript section:** 4.5

Two experiments: a strong-scaling measurement of the RAMR workflow, and the kilometre-scale simulation that the parallel implementation makes possible.

## Part 1 — Strong scaling

### Setup

The representative glacier domain of [§4.1](/examples/01_accuracy/01_ramr_vs_local_refinement) is run with $N_p = \{1, 2, 4, 8, 16, 32\}$ MPI processes. The RAMR loop starts from a fine mesh with **13.4 million displacement DoFs** and **4.47 million phase-field DoFs**, and runs for a **single alternate-minimization iteration** — enough to exercise marking, refinement, solution transfer, and both solves.

`01-06.toml` is the single input used for all six process counts; only the `mpirun` process count changes. It sets $\ell = 10\,\mathrm{m}$, `target_hmin = 2.5`, $h_w = 0.5H$, $\zeta = 2.0$, `energy_threshold = 1.0`.

### Running it

```bash
for np in 1 2 4 8 16 32; do
  mpirun -np $np python3 main.py --input examples/4.5.parallel/01-06.toml
done
```

Change `output.directory` between runs, or the six runs will overwrite each other's results.

### Results

All times in seconds, for one AM iteration.

| Cores | $T_{\mathrm{disp}}$ | $T_{\mathrm{phase}}$ | $T_{\mathrm{mark}}$ | $T_{\mathrm{refn}}$ | $T_{\mathrm{tsfr}}$ | $T_{\mathrm{tot}}$ |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 978 | 102 | 45 | 93 | 275 | **1493** |
| 2 | 630 | 63 | 25 | 103 | 155 | **976** |
| 4 | 334 | 33 | 12 | 149 | 70 | **598** |
| 8 | 196 | 18 | 6 | 192 | 37 | **449** |
| 16 | 115 | 10 | 3 | 210 | 18 | **356** |
| 32 | 74 | 5 | 2 | 450 | 10 | **541** |

### What to take from it

The displacement and phase-field solves show clear strong scaling, with substantial reductions in runtime as process count grows. The speedup is sublinear, which is expected for large finite element computations on unstructured meshes owing to MPI communication cost. Marking and solution transfer also improve with parallelization.

**Refinement is the exception.** $T_{\mathrm{refn}}$ *increases* with core count. Parallel adaptive refinement is communication intensive and memory bound: as the number of MPI processes grows, mesh conformity must be maintained across more subdomain boundaries, so a mesh cannot be refined within one process alone — adjacent subdomain meshes must be refined too, adding communication and synchronization.

The consequence is a runtime minimum. Beyond about 16 cores the advantage of additional processes is outweighed by the increase in refinement cost; total runtime on 32 cores exceeds that on 8 or 16. Using nonconforming meshes could alleviate this and enable implementations scaling to hundreds of cores — that is identified as future work.

## Part 2 — Kilometre-scale crevasse field

### Setup

`07.toml` applies RAMR to an idealized glacier of $1500 \times 750 \times 125\,\mathrm{m}$ with 30 pre-existing surface notches spaced $90\,\mathrm{m}$ apart. Slip boundary conditions on the bottom, left, front and back faces; no ocean pressure (`loads.hydrostatic.enabled = false`).

| Parameter | Value |
| --- | --- |
| $\ell$ | 5 m |
| `target_hmin` | 1.25 m |
| `damage_threshold` | 0.1 |
| $\zeta$ | 2.0 |
| `energy_threshold` | 10.0 |
| Mesh | `11/Lx1500_30C_S90.xdmf` |

Taking $\ell = 5\,\mathrm{m}$ necessitates elements on the order of 1–2 m to resolve the fracture process zone. A uniformly refined mesh at that resolution over this domain would be about **one billion DoFs**, exceeding the parallel capability of most existing finite-element-based phase-field implementations.

### Running it

```bash
mpirun -np 20 python3 main.py --input examples/4.5.parallel/07.toml
```

### Results

RAMR reduces the final problem to approximately **13 million DoFs** — more than two orders of magnitude fewer than the uniform mesh — starting from an initial coarse mesh of about 100 K DoFs. Distributing the finite element computations, mesh refinement, solution transfer and nonlinear solve across **20 CPU cores** completed the full simulation in **under ten hours**.

The resulting fracture pattern shows multiple surface crevasses propagating from the closely spaced initial notches, both vertically and horizontally. Some coalesce to span the entire width; others stop propagating due to crack shielding. The pattern resembles crevasse fields observed in satellite imagery of real glaciers.

Mesh refinement tracks individual crevasse tips so that the element size in the active damage zones is less than the length scale, which is what ensures accuracy.

### Depth, and why the classical models bracket it

Maximum crevasse depths range from **92 to 102 m** — less than the LEFM depth of **112 m**, but much greater than the Nye zero-stress depth of **62.5 m**.

The reason is spacing. At $90\,\mathrm{m}$ separation the crevasses interact only partially and crack-shielding effects are diminished, so the result falls between the two limiting idealizations: the Nye model assumes closely spaced crevasses and underestimates, LEFM assumes isolated crevasses and overestimates. Crevasse spacing is therefore an important parameter for determining crevasse depth, and it is not explicitly represented in either classical model — which is why they provide lower and upper limits on calving rather than predictions.

## Next

- [Effect of boundary conditions](/examples/06_boundary/01_margin_boundary_conditions) — the same domain, different margin treatment
- [Parallel performance notes](/notes/05_hpc/01_parallel_scaling) — the scaling discussion in full
