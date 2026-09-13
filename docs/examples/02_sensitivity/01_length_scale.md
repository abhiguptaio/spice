# Length-Scale Sensitivity

> **Input files:** `examples/4.2.sensitivity/01.toml` – `03.toml`
> **Mesh:** `data/mesh/02/Lx500_1C_AD.xdmf`
> **Manuscript section:** 4.2

The phase-field length scale $\ell$ governs the width of the diffused damage zone. It is also the single largest control on cost, because it sets the minimum mesh resolution needed to resolve that zone. This study asks how much the answer actually depends on it.

## Setup

Identical to the single-crevasse adaptive case of [§4.1](/examples/01_accuracy/01_ramr_vs_local_refinement) — same domain, same notch, same boundary conditions, $h_w = 0.5H$ — with only $\ell$ varied over $\{5, 10, 20\}\,\mathrm{m}$. The minimum element size tracks it at $h = \ell/4$.

| File | $\ell$ [m] | `target_hmin` | `damage_threshold` | $\zeta$ | Output |
| --- | ---: | ---: | ---: | ---: | --- |
| `01.toml` | 5 | 1.25 | 0.1 | 0.75 | `output/01/` |
| `02.toml` | 10 | 2.5 | 0.1 | 1.5 | `output/02/` |
| `03.toml` | 20 | 5.0 | 0.01 | 3.0 | `output/03/` |

Note that `target_hmin` and $\zeta$ scale with $\ell$, and that the coarsest case lowers `damage_threshold` to 0.01 so that the marking criterion still triggers on the broader, weaker damage band.

## Running it

```bash
for f in examples/4.2.sensitivity/*.toml; do
  python3 main.py --input "$f"
done
```

The $\ell = 5\,\mathrm{m}$ case is by far the most expensive of the three; run it last if you are exploring.

## Results

| $\ell$ [m] | Final DoFs | Crevasse depth [m] | Wall clock [hr] |
| ---: | ---: | ---: | ---: |
| 5 | 745,446 | 42 | 5.4 |
| 10 | 243,655 | 40 | 2.2 |
| 20 | 97,033 | 40 | 1.6 |

## What to take from it

**The damage band scales with $\ell$; the crack does not.** As $\ell$ increases, the damage zone width increases proportionally, with negligible qualitative difference in the crack path and depth. Depth varies by 2 m across a four-fold change in $\ell$.

**Cost does not scale gently.** Going from $\ell = 20$ to $\ell = 5\,\mathrm{m}$ increases the final element count by nearly an order of magnitude and the runtime by more than a factor of three.

**So $\ell$ is a numerical choice, not a material constant.** This is the practical consequence, and it is what makes glacier-scale simulation feasible: depth predicted by the stress-based PFM is relatively insensitive to $\ell$ within a reasonable range, so $\ell$ need not be determined strictly by ice properties. Guided by observed crevasse and rift widths and spacing, an appropriate but larger $\ell$ can be chosen to capture crevasse propagation with adequate accuracy — and a larger $\ell$ permits a larger minimum element size, which is what brings ice-shelf-scale fracture simulation into range.

::: warning The caveat
$\ell$ must stay smaller than the spacing between crevasses. Observations of crevasse spacing in highly fractured near-terminus regions in Greenland and Antarctica indicate spacings of order $10^1$–$10^2$ metres, and rift spacing on ice shelves is more commonly hundreds of metres to kilometres. For realistic glacier and ice-shelf geometries spanning tens to hundreds of kilometres, SPICE can therefore be run with $\ell$ of order $10^1$ metres with reasonable accuracy.
:::

## Where it is used

The kilometre-scale studies ([§4.5](/examples/05_parallel/01_strong_scaling) and [§4.6](/examples/06_boundary/01_margin_boundary_conditions)) rely on this result: they use $\ell = 5\,\mathrm{m}$ with 1–2 m elements over a $1500 \times 750 \times 125\,\mathrm{m}$ domain, which is only affordable because adaptivity confines those elements to the fracture zones.
