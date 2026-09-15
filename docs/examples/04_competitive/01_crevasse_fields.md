# Competitive Growth in Crevasse Fields

::: warning Files for this example
- **Input files:** `examples/4.4.competitive/01.toml` – `03.toml`
- **Meshes:** `data/mesh/07`, `data/mesh/08`, `data/mesh/09`
- **Manuscript section:** 4.4
:::

Real glaciers do not have one or two crevasses; they have fields of them. This study evaluates competitive growth — which pre-existing defects become dominant rifts, and which arrest.

## Setup

The same $500 \times 750 \times 125\,\mathrm{m}$ domain, gravity, and hydrostatic ocean pressure at $h_w = 0.5H$. Pre-existing surface notches are distributed uniformly along one lateral face (or along two opposing faces), with horizontal spacing $S$.

| File | Mesh | Notches | $S$ [m] | Output |
| --- | --- | --- | ---: | --- |
| `01.toml` | `07/Lx500_5C_S50.xdmf` | 5, one face | 50 | `output/01/` |
| `02.toml` | `08/Lx500_5C_S70.xdmf` | 5, one face | 70 | `output/02/` |
| `03.toml` | `09/Lx500_10C_S70.xdmf` | 5 on each of two opposing faces | 70 | `output/03/` |

All three use $\ell = 10\,\mathrm{m}$, `target_hmin = 2.5`, `damage_threshold = 0.1`, $\zeta = 1.5$, `energy_threshold = 0.5`.

## Running it

```bash
for f in examples/4.4.competitive/*.toml; do
  mpirun -np 4 python3 main.py --input "$f"
done
```

## Results

| Case | Initial DoFs | Final DoFs | Which propagate | Depth [m] |
| --- | ---: | ---: | --- | ---: |
| 5 notches, $S = 50\,\mathrm{m}$ | 30,322 | — | 1st and 5th | ~41 |
| 5 notches, $S = 70\,\mathrm{m}$ | — | — | 1st and 4th | ~40 |
| 10 notches (2 faces), $S = 70\,\mathrm{m}$ | 33,312 | 626,232 | 1st and 4th from the left, on each flank | ~41 |

In the two-sided case, the propagating crevasses coalesce with their opposing counterparts, forming through-going rifts.

## What to take from it

**Uniform defects do not give uniform outcomes.** With five identically sized and uniformly spaced notches, only two become dominant. The interior notches arrest early.

**The mechanism is stress shielding.** The growing outer crevasses reduce the tensile stress in the inner regions, suppressing fracture propagation there. Which notches win depends on the spacing: at $S = 50\,\mathrm{m}$ it is the first and fifth, at $S = 70\,\mathrm{m}$ the first and fourth.

**Depth is again insensitive.** Final crevasse depths remain comparable (~40–41 m) across the cases, consistent with [§4.3](/examples/03_interaction/01_two_crevasse_interaction). But *which* crevasses grow changes, which is why spacing is an important factor for understanding calving dynamics.

**The arrested crevasses explain the depth.** Because most notches arrest due to mutual shielding, the final depths are consistent with the LEFM model appropriate for *isolated* crevasses, rather than with the zero-stress model appropriate for *closely spaced* crevasses.

**RAMR is what makes this feasible in serial.** Capturing the growth of multiple crevasses across a domain this large would otherwise require globally refined meshes with tens of millions of finite elements. RAMR keeps the problem in the hundreds of thousands of DoFs while maintaining resolution where it matters — at the evolving fracture front.

## Next

- [Strong scaling and the kilometre-scale field](/examples/05_parallel/01_strong_scaling) — thirty crevasses over 1.5 km
