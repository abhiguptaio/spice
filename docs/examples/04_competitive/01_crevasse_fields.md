# Competitive Growth in Crevasse Fields

::: tip Files for this example
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

## Next

- [Strong scaling and the kilometre-scale field](/examples/05_parallel/01_strong_scaling) — thirty crevasses over 1.5 km
