# Parallel Performance and the Kilometre-Scale Field

::: tip Files for this example
- **Input files:** `examples/4.5.parallel/01-06.toml`, `examples/4.5.parallel/07.toml`
- **Meshes:** `data/mesh/10`, `data/mesh/11`
- **Manuscript section:** 4.5
:::

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

## Part 2 — Kilometre-scale crevasse field

### Setup

`07.toml` applies RAMR to an idealized glacier of $1500 \times 750 \times 125\,\mathrm{m}$ with 30 pre-existing surface notches spaced $90\,\mathrm{m}$ apart. Slip boundary conditions on the bottom, left, front and back faces; no ocean pressure (`loads.hydrostatic.enabled = false`).
### Running it

```bash
mpirun -np 20 python3 main.py --input examples/4.5.parallel/07.toml
```

## Next

- [Effect of boundary conditions](/examples/06_boundary/01_margin_boundary_conditions) — the same domain, different margin treatment
- [Parallel performance notes](/notes/05_hpc/01_parallel_scaling) — the scaling discussion in full
