# Effect of Margin Boundary Conditions

> **Input files:** `examples/4.6.boundary/01.toml`, `examples/4.6.boundary/02.toml`
> **Mesh:** `data/mesh/11/Lx1500_30C_S90.xdmf`
> **Manuscript section:** 4.6

Real glacier margins do not remain mechanically fixed. As the glacier flows, slides, stretches, and develops damage at the lateral margins, the boundary weakens and transitions from a fixed (stiff) condition to a slip (compliant) one. This two-part experiment represents that transition in an idealized setting, and shows how much of the fracture pattern it controls.

## Setup

The same kilometre-scale domain as [§4.5](/examples/05_parallel/01_strong_scaling) — $1500 \times 750 \times 125\,\mathrm{m}$ with 30 notches at $90\,\mathrm{m}$ spacing, $\ell = 5\,\mathrm{m}$, `target_hmin = 1.25`. Initial mesh resolution and every other boundary condition are identical between the two runs, so any difference in the crevasse pattern arises **solely** from the treatment of the back boundary at $y = 750\,\mathrm{m}$.

### Stage 1 — fixed margin (`01.toml`)

The back boundary is fully constrained. On top of the shared roller set, two extra conditions pin the remaining components:

```toml
[[boundary_conditions]]
name = "back_fixed_x"
boundary = "back"
component = 0
value = 0.0

[[boundary_conditions]]
name = "back_fixed_z"
boundary = "back"
component = 2
value = 0.0
```

Checkpointing is enabled so the converged state can be reused:

```toml
[write_checkpoint]
enabled = true
filename = "./output/01/checkpoint.h5"
```

### Stage 2 — released margin (`02.toml`)

The two extra constraints are **removed**, leaving only the standard `back_roller` ($u_y = 0$), and the run restarts from stage 1's converged state:

```toml
[restart_checkpoint]
enabled = true
filename = "./output/01/checkpoint.h5"
```

Because the checkpoint stores the adapted mesh alongside the fields and the iteration counters, stage 2 continues on the refined mesh and from the exact fracture configuration reached under the fixed margin — it does not start over.

## Running it

```bash
mpirun -np 20 python3 main.py --input examples/4.6.boundary/01.toml
mpirun -np 20 python3 main.py --input examples/4.6.boundary/02.toml
```

Stage 1 must complete before stage 2 starts; the second run reads the first run's checkpoint.

## Results

**Fixed margin.** During the fixed-boundary stage, tensile stresses accumulate along the constrained face, leading to immediate crevasse initiation at $y = 750\,\mathrm{m}$ along the lateral margin. Only a few crevasses near the terminus propagate, with **arcuate paths** that gradually curve toward the right (ocean) boundary. A fixed lateral constraint concentrates stress along the margin and restricts the development of crevasses far from the ocean boundary perpendicular to the flow direction.

**Released margin.** Releasing the constraint lets the glacier body move, producing large tensile stresses along the flow direction (left to right). The resulting stress redistribution allows additional cracks to form, creating fracture patterns with propagation **both parallel and perpendicular** to flow. Crevasses spread all through the glacier domain, featuring branching, merging, curved propagation paths and multi-directional growth — a **crisscross** network.

Throughout, RAMR keeps the global problem size below roughly **13 million DoFs**, and the full simulation completes within **two days on 20 CPU cores**. Capturing multi-directional crack branching, coalescence and curving, and interactions between closely spaced cracks at kilometre scale, would be prohibitively expensive with a uniformly refined mesh requiring on the order of a billion DoFs.

## What to take from it

**Margin conditions reorganize the entire pattern.** The same domain, the same notches, and the same material produce two qualitatively different fracture networks depending only on how one lateral face is constrained.

**Both patterns are observed in nature.** Arcuate crevasses — referred to in the glaciology community as chevron or en echelon crevasses — are commonly formed when one boundary is fixed relative to the ocean boundary. Crisscross or checkerboard patterns are seen near the termini of rapidly calving glaciers including Thwaites Glacier in Antarctica, calving outlet glaciers such as Narsap Sermia in Greenland, and glaciers with likely weak lateral buttressing such as the Pine Island Ice Shelf. Away from lateral margins, crevasses are expected to be straighter — which is what is observed.

**Depth alone is not enough.** In the fixed-margin case, even where crevasses reach the full glacier depth, only some would lead to calving — specifically because of the lack of connection to the calving front or the lateral boundary. Whether an iceberg detaches depends on the three-dimensional extent and connectivity of the fracture network, not only on how deep it goes. This is the strongest argument in the study for high-fidelity 3-D fracture modeling over parameterized bulk crevasse depth.

## Reusing the restart pattern

This two-stage construction generalizes. Any experiment of the form *"run to a converged fracture state, then change something and continue"* can be built the same way: enable `[write_checkpoint]` in the first input, point `[restart_checkpoint]` at it in the second, and change whatever you like in between — boundary conditions, ocean level, load direction. See the [input reference](/examples/00_setup/02_input_file_reference#write-checkpoint-and-restart-checkpoint).
