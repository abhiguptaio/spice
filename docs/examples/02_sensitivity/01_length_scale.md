# Length-Scale Sensitivity

::: tip Files for this example
- **Input files:** `examples/4.2.sensitivity/01.toml` – `03.toml`
- **Mesh:** `data/mesh/02/Lx500_1C_AD.xdmf`
- **Manuscript section:** 4.2
:::

The phase-field length scale $\ell$ governs the width of the diffused damage zone. It is also the single largest control on cost, because it sets the minimum mesh resolution needed to resolve that zone. This study asks how much the answer actually depends on it.

## Setup

Identical to the single-crevasse adaptive case of [§4.1](/examples/01_accuracy/01_ramr_vs_local_refinement) — same domain, same notch, same boundary conditions, $h_w = 0.5H$ — with only $\ell$ varied over $\{5, 10, 20\}\,\mathrm{m}$. The minimum element size tracks it at $h = \ell/4$.

| File | $\ell$ [m] | `target_hmin` | `damage_threshold` | $\zeta$ | Output |
| --- | ---: | ---: | ---: | ---: | --- |
| `01.toml` | 5 | 1.25 | 0.1 | 0.75 | `output/01/` |
| `02.toml` | 10 | 2.5 | 0.1 | 1.5 | `output/02/` |
| `03.toml` | 20 | 5.0 | 0.01 | 3.0 | `output/03/` |


## Running it

```bash
for f in examples/4.2.sensitivity/*.toml; do
  python3 main.py --input "$f"
done
```

The $\ell = 5\,\mathrm{m}$ case is by far the most expensive of the three; run it last if you are exploring.


