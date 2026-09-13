# Software, Data, and Reproducibility

SPICE is implemented in the open-source finite element software [FEniCS](https://fenicsproject.org/) (`dolfin`, v2019), and the repository is organized so that every published simulation corresponds to one input file under `examples/` and one mesh under `data/mesh/`.

## Software stack

| Component | Used for |
| --- | --- |
| `dolfin` (FEniCS 2019) | meshes, function spaces, assembly, linear solves, `refine()` |
| `ufl_legacy` / `ufl` | symbolic forms, principal-stress eigenvalues |
| PETSc (via dolfin) | GMRES + `hypre_euclid`, `PETScDMCollection` transfer matrices |
| `mpi4py` | MPI communicator, reductions in the refinement loop |
| `numpy` | history-field maximum, damage clipping |
| `psutil` | per-rank resident memory reported each iteration |
| `tomllib` / `toml` | reading the input file |

`tomllib` ships with Python 3.11+; on Python 3.7–3.10 the loader falls back to the third-party `toml` package (`src/config.py`).

## Repository layout

```
spice/
├── main.py               # CLI entry point: parse --input, load mesh, run
├── src/
│   ├── config.py         # TOML parsing, dataclasses, validation
│   ├── model.py          # constitutive relations, principal stress split, weak forms
│   ├── boundary.py       # named boundaries, Dirichlet BCs, gravity, ocean pressure
│   ├── solver.py         # function spaces, projections, one staggered solve
│   ├── adaptivity.py     # RAMR loop, field transfer, checkpoints, run orchestration
│   └── metrics.py        # MPI-safe CSV writer (rank 0 only)
├── examples/             # one TOML per published simulation, grouped by paper section
├── data/mesh/            # XDMF/HDF5 meshes, numbered 01–12
└── docs/                 # this site
```

## Reproducing a run

Every simulation is fully specified by its input file. Nothing is hard-coded per study; the solver reads geometry, material properties, loads, boundary conditions, adaptivity settings and output paths from the TOML:

```bash
mpirun -np 4 python3 main.py --input examples/4.1.accuracy/04.toml
```

See [Running a simulation](/examples/00_setup/01_running_a_simulation) for the full workflow and [the input reference](/examples/00_setup/02_input_file_reference) for every key the parser accepts.

## What a run produces

| Artifact | Contents |
| --- | --- |
| `output.xdmf` / `.h5` | damage (and optionally displacement) at each accepted iteration |
| `metrics.csv` | `step`, `ram_gb`, `hmin`, `ndof`, `elapsed_seconds`, `ms_error` |
| `checkpoint.h5` | mesh, displacement, damage, history field, iteration counters |

The CSV is written by MPI rank 0 only, so parallel runs produce a single consistent metrics stream (`src/metrics.py`). Checkpoints are written by replacing a temporary file atomically, so an interrupted write cannot corrupt a usable checkpoint (`write_checkpoint()` in `src/adaptivity.py`).

## Restarting and continued experiments

Because the checkpoint stores the adapted mesh alongside the fields, a run can be continued under *changed* conditions. This is not just a convenience — it is how the boundary-condition experiment in [§4.6](/examples/06_boundary/01_margin_boundary_conditions) is constructed: the first input fixes the back boundary and runs to convergence; the second restarts from that checkpoint with the constraint removed, so the released-margin case begins from the exact fracture state reached under the fixed margin.

## FAIR principles and data availability

The model is implemented in open-source software and follows FAIR (Findable, Accessible, Interoperable, Reproducible) principles. As stated in the SPICE manuscript:

- Simulation data and input files: <https://doi.org/10.5281/zenodo.18435068>
- Source code: <https://github.com/iitrabhi/adaptive-phase-field-fracture>

## Hardware used for the published results

- Serial studies (§4.1–§4.4): one core of a Dell Precision 7820 Tower with two Intel Xeon Gold 6148 CPUs (40 physical cores).
- Parallel studies (§4.5–§4.6): MPI on the same workstation; the kilometre-scale runs used 20 cores.
- The §4.6 cases were also reproduced on Google Cloud (`n2-standard-96`, Intel Xeon 2.60 GHz, 48 physical cores), provisioned with the Google Cloud Cluster Toolkit and a YAML infrastructure specification, with comparable runtime.
