# Running a Simulation

Every SPICE simulation is one command: the solver, one TOML input file, and the mesh that file points at. Nothing is hard-coded per study.

## Prerequisites

- **FEniCS (legacy `dolfin`, v2019)** — meshes, assembly, linear solves, `refine()`
- **PETSc**, via dolfin, providing GMRES and the `hypre_euclid` preconditioner
- **mpi4py**, **numpy**, **psutil**
- **Python 3.11+** for the built-in `tomllib`; on Python 3.7–3.10 install `toml`

With a conda-based FEniCS installation, make sure the environment's binaries come first on the path:

```bash
export PATH="$CONDA_PREFIX/bin:$PATH"
```

## A single run

From the repository root:

```bash
python3 main.py --input examples/4.1.accuracy/04.toml
```

In parallel:

```bash
mpirun -np 4 python3 main.py --input examples/4.5.parallel/01-06.toml
```

`--input` defaults to `input.toml` if omitted. The mesh is read once on the communicator, and `run_adaptive()` takes over from there.

::: warning Relative paths resolve against the input file
Every relative path in the TOML — `mesh.path`, `output.directory`, checkpoint filenames — is resolved relative to **the directory containing that TOML file**, not the current working directory. This is why the example files use `../../data/mesh/...` for meshes and `./output/NN/` for results: running `examples/4.1.accuracy/04.toml` writes to `examples/4.1.accuracy/output/04/` regardless of where you launch it from.
:::

## Running several studies

There is no batch script in the repository; a shell loop is enough:

```bash
for f in examples/4.3.interaction/*.toml; do
  mpirun -np 4 python3 main.py --input "$f"
done
```

To keep a log of a long batch:

```bash
bash -c 'for f in examples/4.3.interaction/*.toml; do
  mpirun -np 4 python3 main.py --input "$f"
done' 2>&1 | tee run.log
```

## What you will see

One line per accepted alternate-minimization iteration, printed by rank 0:

```
step:   1, ram:   2.31 GB, hmin: 10.42, ndof:  31152, time:    38, ms_err: 1.00e+00
step:   2, ram:   4.87 GB, hmin:  2.49, ndof: 118440, time:   271, ms_err: 4.62e-01
...
step:  46, ram:   9.02 GB, hmin:  2.49, ndof: 243655, time:  7904, ms_err: 8.31e-05
```

| Field | Meaning |
| --- | --- |
| `step` | iteration index, also the XDMF frame index |
| `ram_gb` | resident memory summed over all MPI ranks |
| `hmin` | global minimum element size — watch it fall to `adaptivity.target_hmin` |
| `ndof` | displacement + damage degrees of freedom on the current mesh |
| `time` | wall-clock seconds since the run started |
| `ms_err` | convergence metric; the run stops when it drops below `solver.outer_tolerance` |

There is **no physical time** in these simulations. Loads are applied once and held; the step index is a pseudo-time counting iterations toward a stable fracture configuration.

## Output

Written into `output.directory`:

| File | Contents |
| --- | --- |
| `output.xdmf` + `.h5` | damage field (and displacement, if `write_displacement = true`) per accepted step |
| `metrics.csv` | the same columns as the log line, written by rank 0 only |
| `checkpoint.h5` | mesh, fields and iteration counters, if `[write_checkpoint]` is enabled |

Open `output.xdmf` in ParaView and threshold on `damage` (typically at $d > 0.9$) to see the crevasse surfaces. The `_outline` meshes shipped alongside each mesh in `data/mesh/` are convenient as a domain outline for figures.

## Restarting

Checkpoints store the **adapted mesh** together with the fields, so a restart resumes on the refined mesh rather than starting over:

```toml
[restart_checkpoint]
enabled = true
filename = "./output/01/checkpoint.h5"
```

This is also how a *continued* experiment is set up — restart from a converged state with changed boundary conditions. See [§4.6](/examples/06_boundary/01_margin_boundary_conditions).

## Choosing the process count

RAMR's refinement stage does not scale well (see [parallel performance](/notes/05_hpc/01_parallel_scaling)). On the published benchmark, total runtime is lowest around 8–16 cores and *worse* at 32 than at 8. The kilometre-scale production runs used 20. More cores is not automatically faster for this workflow.

## Next

- [Input file reference](/examples/00_setup/02_input_file_reference) — every key the parser accepts
- [Meshes and geometry](/examples/00_setup/03_meshes_and_geometry) — the mesh inventory and boundary naming
