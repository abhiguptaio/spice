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
## Next

- [Competitive growth in crevasse fields](/examples/04_competitive/01_crevasse_fields) — the same physics with five and ten notches
