# Parallel Performance and Scaling

The studies in [§4.1–§4.4](/examples/) run in serial, because the final meshes produced by RAMR contain fewer than one million degrees of freedom. Kilometre- scale domains relevant to ice-sheet modeling are a different matter: adaptive refinement there generates meshes with many millions of DoFs, which is what motivated the *scalable parallel* part of SPICE.

## The strong-scaling experiment

The benchmark is the representative glacier domain of [§4.1](/examples/01_accuracy/01_ramr_vs_local_refinement) — $500 \times 750 \times 125\,\mathrm{m}$ — run with $N_p = \{1, 2, 4, 8, 16, 32\}$ MPI processes. The RAMR loop starts from a fine mesh with **13.4 million displacement DoFs** and **4.47 million phase-field DoFs**, and the simulation runs for a **single alternate-minimization iteration**.

One iteration is sufficient, because it already exercises every stage of the workflow: marking, refinement, solution transfer, and the displacement and phase-field solves.

| $n^u_{\mathrm{dof}}$ | $n^p_{\mathrm{dof}}$ | Cores | $T_{\mathrm{disp}}$ | $T_{\mathrm{phase}}$ | $T_{\mathrm{mark}}$ | $T_{\mathrm{refn}}$ | $T_{\mathrm{tsfr}}$ | $T_{\mathrm{tot}}$ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 13,420,188 | 4,473,396 | 1 | 978 | 102 | 45 | 93 | 275 | **1493** |
| | | 2 | 630 | 63 | 25 | 103 | 155 | **976** |
| | | 4 | 334 | 33 | 12 | 149 | 70 | **598** |
| | | 8 | 196 | 18 | 6 | 192 | 37 | **449** |
| | | 16 | 115 | 10 | 3 | 210 | 18 | **356** |
| | | 32 | 74 | 5 | 2 | 450 | 10 | **541** |

All times in seconds.

## Reading the table

**The solves scale.** $T_{\mathrm{disp}}$ and $T_{\mathrm{phase}}$ drop substantially with process count. The speedup is sublinear, but that is expected for large finite element computations on unstructured meshes, where MPI communication cost is unavoidable.

**Marking and transfer scale.** Both improve steadily with parallelization.

**Refinement does not.** $T_{\mathrm{refn}}$ *increases* with core count — from 93 s on one core to 450 s on 32. Parallel adaptive refinement is communication intensive and memory bound. As the number of MPI processes grows, mesh conformity must be maintained across more subdomain boundaries: a mesh cannot be refined within one process alone, because adjacent subdomain meshes must be refined too, adding communication and synchronization.

**The total has a minimum.** Because refinement eventually dominates, the computational advantage of adding cores is outweighed beyond about 16 cores. Total runtime on 32 cores (541 s) is *worse* than on 8 (449 s) or 16 (356 s).

::: tip Practical guidance
For this workflow, pick the process count near the runtime minimum rather than the largest available. On the published benchmark that is 8–16 cores; the kilometre-scale production runs used 20.
:::

## Why this is acceptable — and what would fix it

Despite the refinement overhead, parallelization still reduces total runtime substantially compared with serial execution, and more importantly it enables mesh and domain sizes that are infeasible on a single core. Further optimization of the refinement stage was not necessary for the scientific goals of the study.

The structural fix is **nonconforming meshes**, which would remove the cross-subdomain conformity requirement and permit highly scalable implementations running on hundreds of processor cores. That is identified as future work.

## Kilometre scale in practice

Applying RAMR to a $1500 \times 750 \times 125\,\mathrm{m}$ idealized glacier with $\ell = 5\,\mathrm{m}$ requires elements on the order of 1–2 m to resolve the fracture process zone. A uniformly refined mesh at that resolution would be about one billion DoFs — beyond the capability of most existing parallel finite-element-based phase-field implementations.

With RAMR refining only where damage is nonzero, the final mesh is roughly **13 million DoFs**. Distributing the finite element computations, mesh refinement, solution transfer and nonlinear solve across **20 CPU cores** completed the full simulation in **under ten hours**. The [released-boundary experiment](/examples/06_boundary/01_margin_boundary_conditions), which produces a much more intricate fracture network, completed within two days on the same 20 cores.

## What the code reports

`run_adaptive()` in `src/adaptivity.py` prints and writes one row per accepted AM iteration:

```
step:  12, ram:  31.44 GB, hmin:  1.25, ndof: 4821336, time:  8123, ms_err: 3.47e-03
```

| Field | Meaning |
| --- | --- |
| `step` | AM iteration index (also the XDMF frame index) |
| `ram_gb` | resident memory summed across **all** ranks (`MPI.sum`) |
| `hmin` | global minimum element size (`MPI.min` over `mesh.hmin()`) |
| `ndof` | `displacement.dim() + damage.dim()` on the current mesh |
| `elapsed_seconds` | wall clock since the start of the run |
| `ms_error` | convergence metric for this iteration |

The same fields go to `metrics.csv`, written by rank 0 only. Watching `hmin` fall to `target_hmin` and `ndof` climb is the most direct way to see RAMR working; watching `ram_gb` is the most direct way to see it running out of room.

## Memory

Memory, not arithmetic, is what usually ends a large run. Two mitigations are built in:

- Inside the RAMR loop, references to the previous mesh's function spaces and functions are explicitly deleted and `gc.collect()` is called after each transfer, so only one mesh generation is live at a time.
- `logging.garbage_collect_every` forces an additional collection every *N* accepted iterations.

If a run is at risk, enable `[write_checkpoint]`: the checkpoint stores the adapted mesh together with the fields and the iteration counters, and `[restart_checkpoint]` resumes from it.

## Cloud execution

The §4.6 examples were also run on Google Cloud, on an `n2-standard-96` virtual machine with Intel Xeon CPUs at 2.60 GHz and 48 physical cores, provisioned with the Google Cloud Cluster Toolkit and a YAML configuration specifying the infrastructure and the FEniCS installation. Effective runtime was comparable to the in-house workstation, since the VM was selected to match the local hardware closely. The advantage of the cloud deployment is elasticity — the same YAML scales the cluster beyond single-node limits, which is what deploying large-scale 3-D glacier fracture simulations across tens to thousands of cores requires.
