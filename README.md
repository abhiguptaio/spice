<h1 align="center">SPICE</h1>

<div align="center">
<h4>

[Documentation](https://abhiguptaio.github.io/spice/)  |  [Paper](#accompanying-paper)  |  [Data](https://doi.org/10.5281/zenodo.18435068)
</h4>
</div>

Scalable Phase-field Implementation of Crack Evolution — a parallel, recursively adaptive phase-field fracture framework in FEniCS for modeling surface crevasse growth and interaction in glaciers.

<table width="100%" cellspacing="0" cellpadding="0">
  <tr>
    <td width="50%" align="center">
      <img src="https://raw.githubusercontent.com/abhiguptaio/spice/main/assets/single_crevasse_ocean.gif" alt="Single crevasse propagating under gravity and ocean pressure" width="105%">
      <br>
      Single crevasse propagating under gravity and ocean pressure.
    </td>
    <td width="50%" align="center">
      <img src="https://raw.githubusercontent.com/abhiguptaio/spice/main/assets/ramr_mesh_refinement.gif" alt="RAMR refining the mesh around an advancing crack tip" width="105%">
      <br>
      RAMR refining the mesh around an advancing crack tip.
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="https://raw.githubusercontent.com/abhiguptaio/spice/main/assets/two_crevasse_coalescence.gif" alt="Two crevasses turning toward each other and coalescing at S = 15 m" width="105%">
      <br>
      Two crevasses coalescing at <i>S</i> = 15 m.
    </td>
    <td width="50%" align="center">
      <img src="https://raw.githubusercontent.com/abhiguptaio/spice/main/assets/competitive_growth.gif" alt="Competitive growth in a five-crevasse field, with interior notches arrested by stress shielding" width="105%">
      <br>
      Competitive growth in a five-crevasse field.
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="https://raw.githubusercontent.com/abhiguptaio/spice/main/assets/arcuate_fixed_margin.gif" alt="Arcuate crevasses formed under a fixed lateral margin" width="105%">
      <br>
      Arcuate crevasses under a fixed lateral margin.
    </td>
    <td width="50%" align="center">
      <img src="https://raw.githubusercontent.com/abhiguptaio/spice/main/assets/crisscross_released_margin.gif" alt="Crisscross fracture network after the lateral constraint is released" width="105%">
      <br>
      Crisscross network after the margin is released.
    </td>
  </tr>
</table>

<div align="center">
  <img src="https://raw.githubusercontent.com/abhiguptaio/spice/main/assets/kilometre_scale_field.png" alt="Kilometre-scale crevasse field" width="98.5%">
</div>

<div align="center">
  Kilometre-scale simulation of an idealized 1500 × 750 × 125 m glacier with 30 pre-existing surface notches spaced 90 m apart. A uniformly refined mesh at the 1–2 m resolution required by the phase-field length scale would need roughly one billion degrees of freedom; RAMR concentrates refinement in the fracture zones and brings the final mesh to about 13 million, completing the simulation in under ten hours on 20 CPU cores.
</div>

## Key Features

- **Recursive adaptive mesh refinement (RAMR)** — an accept–reject refinement loop inside the nonlinear solver that finds damage on its own and refines only where the phase field is nonzero. No prior guess of the crack path, no manual local refinement.
- **Stress-based phase-field fracture** — the crack driving force is built from the positive principal effective stresses, so fracture evolves only under tension, as glacier ice requires.
- **Kilometre domains at metre resolution** — orders of magnitude fewer degrees of freedom than a uniform mesh, without giving up accuracy.
- **Parallel** — MPI across assembly, solves, marking, refinement and solution transfer.
- **Configuration-driven** — every simulation is one TOML file. No code changes per study.
- **Restartable** — checkpoints store the adapted mesh with the fields, so a converged state can be continued under changed boundary conditions.

## Documentation

<https://abhiguptaio.github.io/spice/>

The formulation, the RAMR algorithm, the full input-file reference, and every case study with its results live there. To build the site locally:

```bash
cd docs && npm install && npm run docs:dev
```

## Installation

SPICE runs on the legacy FEniCS (`dolfin` v2019) stack.

```bash
conda create -n spice -c conda-forge fenics=2019 mpi4py numpy psutil
conda activate spice
```

On Python 3.7–3.10, also `pip install toml` (`tomllib` is stdlib from 3.11).

> [!TIP]
> If the activated environment throws errors — `python3` or `mpirun` resolving to
> the system copy, or `dolfin` failing to import despite being installed — the
> environment's own binaries are not first on your `PATH`. Put them there:
>
> ```bash
> export PATH="$CONDA_PREFIX/bin:$PATH"
> ```
>
> Add it to your shell profile, or re-run it after each `conda activate`.

Prefer a container? See [`docker/`](docker/).

Then clone and unpack the meshes:

```bash
git clone https://github.com/abhiguptaio/spice
cd spice
unzip data/mesh.zip -d data/
```

## Running a Simulation

One command: the solver, one TOML input file, and the mesh that file points at.

```bash
python3 main.py --input examples/4.1.accuracy/04.toml
```

In parallel:

```bash
mpirun -np 4 python3 main.py --input examples/4.3.interaction/01.toml
```

`--input` defaults to `input.toml`. Relative paths inside the TOML — mesh, output directory, checkpoints — resolve against **the directory containing that input file**, not the working directory.

Each accepted iteration prints one line and appends a row to `metrics.csv` in the output directory.

## Examples

Each directory under `examples/` reproduces one section of the paper. See the [documentation](https://abhiguptaio.github.io/spice/examples/) for parameters and expected results.

| Directory | Study |
| --- | --- |
| `4.1.accuracy` | RAMR vs. local refinement |
| `4.2.sensitivity` | Phase-field length-scale sensitivity |
| `4.3.interaction` | Two-crevasse interaction |
| `4.4.competitive` | Competitive growth in crevasse fields |
| `4.5.parallel` | Strong scaling and kilometre scale |
| `4.6.boundary` | Margin boundary conditions |

## Repository Layout

```
spice/
├── main.py               # CLI entry point
├── src/
│   ├── config.py         # TOML parsing, validation
│   ├── model.py          # constitutive relations, stress split, weak forms
│   ├── boundary.py       # named boundaries, BCs, gravity, ocean pressure
│   ├── solver.py         # function spaces, one staggered solve
│   ├── adaptivity.py     # RAMR loop, field transfer, checkpoints
│   └── metrics.py        # MPI-safe CSV writer
├── examples/             # one TOML per published simulation
├── data/mesh/            # XDMF/HDF5 meshes
├── docker/               # container recipe
└── docs/                 # documentation site
```

## Accompanying Paper

**Scalable Phase-field Implementation of Crack Evolution (SPICE) for Modeling Surface Crevasse Growth and Interaction In Glaciers.**
Abhinav Gupta, Duc Tien Nguyen, Ravindra Duddu, Meghana Ranganathan, Alexander Robel.
*Manuscript submitted to the Journal of Advances in Modeling Earth Systems (JAMES).*

Simulation data and input files: <https://doi.org/10.5281/zenodo.18435068>

## Citation

```bibtex
@article{gupta_spice_2026,
    title = {Scalable {Phase}-field {Implementation} of {Crack} {Evolution} ({SPICE}) for {Modeling} {Surface} {Crevasse} {Growth} and {Interaction} {In} {Glaciers}},
    shorttitle = {{SPICE}},
    journal = {Journal of Advances in Modeling Earth Systems},
    author = {Gupta, Abhinav and Nguyen, Duc Tien and Duddu, Ravindra and Ranganathan, Meghana and Robel, Alexander},
    year = {2026},
    note = {Manuscript submitted for publication},
}
```

## License

GNU General Public License v3.0. See [LICENSE](LICENSE).
