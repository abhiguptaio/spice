# Examples

These pages are the practical companion to the [notes](/notes/). Where the notes develop the formulation, this section documents **the simulations themselves** — every case study published with SPICE, the exact input file that produces it, the mesh it needs, and the result to expect.

Each page corresponds to one directory of TOML inputs under `examples/` in the repository and to one section of the manuscript.

## Getting started

Start here if you have not run the solver before.

| Page | Covers |
| --- | --- |
| [Running a simulation](/examples/00_setup/01_running_a_simulation) | prerequisites, the command line, MPI, output files, restarts |
| [Input file reference](/examples/00_setup/02_input_file_reference) | every section and key the parser accepts, with defaults and validation rules |
| [Meshes, geometry, and boundaries](/examples/00_setup/03_meshes_and_geometry) | the six named faces, notch conventions, and the full mesh inventory |

## Glacier case studies

| Page | Inputs | Question it answers |
| --- | --- | --- |
| [4.1 Accuracy and efficiency of RAMR](/examples/01_accuracy/01_ramr_vs_local_refinement) | `4.1.accuracy/01–09` | Does adaptive refinement reproduce the locally refined solution, and how much does it save? |
| [4.2 Length-scale sensitivity](/examples/02_sensitivity/01_length_scale) | `4.2.sensitivity/01–03` | How much does the answer depend on $\ell$? |
| [4.3 Two-crevasse interaction](/examples/03_interaction/01_two_crevasse_interaction) | `4.3.interaction/01–04` | When do crevasses coalesce, curve, shield, or ignore each other? |
| [4.4 Competitive growth in crevasse fields](/examples/04_competitive/01_crevasse_fields) | `4.4.competitive/01–03` | With many identical defects, which become rifts? |
| [4.5 Parallel performance and kilometre scale](/examples/05_parallel/01_strong_scaling) | `4.5.parallel/01-06`, `07` | How does RAMR scale, and what does a 1.5 km simulation cost? |
| [4.6 Effect of margin boundary conditions](/examples/06_boundary/01_margin_boundary_conditions) | `4.6.boundary/01–02` | How much of the fracture pattern is set by the lateral boundary? |

## How to use them

The studies build on one another. §4.1 establishes that the method is accurate; §4.2 establishes that the length scale can be chosen for computational convenience; §4.3 and §4.4 use that freedom to study interaction and competition; §4.5 and §4.6 apply the result at kilometre scale in parallel.

The most useful thing you can do with any of them is change one parameter and watch what happens — the ocean water level, the crevasse spacing, the length scale, the marking threshold — and compare `metrics.csv` against the reference numbers on the page.

## A note on reproducibility

Nothing is hard-coded per study. Every simulation is fully specified by its TOML input and its mesh, and every run writes a `metrics.csv` recording mesh size, memory, and convergence at each step. Meshes and simulation data are archived at <https://doi.org/10.5281/zenodo.18435068>.
