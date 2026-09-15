# Two-Crevasse Interaction

::: tip Files for this example
- **Input files:** `examples/4.3.interaction/01.toml` – `04.toml`
- **Meshes:** `data/mesh/03` – `data/mesh/06`
- **Manuscript section:** 4.3
:::

Two surface crevasses that are close enough to feel each other's stress field do not behave like two independent cracks. This study maps out what happens as the separation is varied.

## Setup

The same $500 \times 750 \times 125\,\mathrm{m}$ prism, but with **two** surface notches introduced on the opposite lateral faces at mid-length. Each notch tip is offset by $S$ from the glacier centerline, so the crevasse spacing is $2S$. The glacier is subject to gravity and hydrostatic ocean pressure at the terminus with $h_w = 0.5H$.

| File | Mesh | $S$ [m] | Output |
| --- | --- | ---: | --- |
| `01.toml` | `03/Lx500_2C_S15.xdmf` | 15 | `output/01/` |
| `02.toml` | `04/Lx500_2C_S25.xdmf` | 25 | `output/02/` |
| `03.toml` | `05/Lx500_2C_S50.xdmf` | 50 | `output/03/` |
| `04.toml` | `06/Lx500_2C_S100.xdmf` | 100 | `output/04/` |

All four use $\ell = 10\,\mathrm{m}$, `target_hmin = 2.5`, `damage_threshold = 0.1`, $\zeta = 1.5$, `energy_threshold = 0.5`, and start from an initial mesh of roughly 28,000–30,000 DoFs. Only the mesh — that is, the notch placement — differs.

## Running it

```bash
for f in examples/4.3.interaction/*.toml; do
  python3 main.py --input "$f"
done
```

Final mesh sizes vary significantly between the four, depending on whether the crevasses coalesce or shield each other.

## Results

| $S$ [m] | Final DoFs | Crack depth [m] | Wall clock [hr] | Interaction |
| ---: | ---: | ---: | ---: | --- |
| 15 | 220,269 | 39 | 0.5 | Coalescence |
| 25 | 280,544 | 40 | 0.6 | Curved, no coalescence |
| 50 | 437,255 | 40 | 1.7 | Parallel, crossing tips |
| 100 | 630,793 | 40 | 1.9 | Independent propagation |

## The four regimes

**$S = 15\,\mathrm{m}$ — coalescence.** The crevasses propagate toward each other, turn, and merge. Coalescence occurs because the stress fields near the crack tips overlap strongly, which locally amplifies the tensile stress in the bridging zone between them.

**$S = 25\,\mathrm{m}$ — curving without merging.** The two crevasses still grow toward each other and curve as they approach, driven by the same stress redistribution, but it is no longer sufficient to cause coalescence.

**$S = 50\,\mathrm{m}$ — shielding.** The crevasses advance past each other without merging and stop growing shortly after, leaving a pair of disconnected crevasses that shield each other from growing further.

**$S = 100\,\mathrm{m}$ — independence.** Each crevasse propagates toward the opposite side of the glacier without any interaction.

## What to take from it

**Spacing decides the pattern.** Whether crevasses coalesce, curve, shield or grow independently is set by $2S$. At small spacing, the intensification of stress at interacting crack tips leads to turning and merging; at larger spacing, they shield and thwart each other or grow independently.

**Spacing does not decide the depth.** Depth remains nearly constant at 39–40 m across all four simulations. Interaction operates in the horizontal plane; vertical propagation is governed by the magnitude of the longitudinal tensile stress, which is set by the glacier height (raising tension) and the seawater height (curtailing it).

**RAMR handles all four without modification.** The same algorithm and the same settings refine appropriately for two simultaneously propagating crevasses, whichever regime they fall into. The final DoF count is itself diagnostic: coalescing crevasses need less refined volume (220k DoFs) than two independently propagating ones (631k).

## Next

- [Competitive growth in crevasse fields](/examples/04_competitive/01_crevasse_fields) — the same physics with five and ten notches
