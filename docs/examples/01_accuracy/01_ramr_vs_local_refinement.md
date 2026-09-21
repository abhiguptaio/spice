# Accuracy and Efficiency of RAMR

::: tip Files for this example
- **Input files:** `examples/4.1.accuracy/01.toml` – `09.toml`
- **Meshes:** `data/mesh/01`, `data/mesh/02`, `data/mesh/12`
- **Manuscript section:** 4.1
:::

This is the validation study. It answers two questions: can the recursive adaptive mesh refinement (RAMR) algorithm reproduce the solution obtained on a locally refined (LR) mesh, and how much does it save in degrees of freedom and wall-clock time?

## Setup

The glacier terminus is idealized as a rectangular prism, $L_x = 500\,\mathrm{m}$, $L_y = 750\,\mathrm{m}$, $L_z = 125\,\mathrm{m}$, representing a small region of an ice shelf. A single edge notch ($l_x = 5$, $l_y = 10$, $l_z = 10\,\mathrm{m}$) is placed at the top centre of the front face. A vertical body force acts throughout the ice, and ocean pressure is applied on the right face at $x = 500\,\mathrm{m}$. Free-slip conditions hold on the bottom, left, front and back faces.

Three ocean water levels are considered: $h_w = 0$, $h_w = 0.25H$, and $h_w = 0.5H$. The pressure $p_w(z) = \rho_s g \langle h_w - z \rangle$ applies larger compressive stress as $h_w$ increases, suppressing deeper crevasse propagation.

All runs use a phase-field length scale $\ell = 10\,\mathrm{m}$ with minimum element size $h = \ell/4 = 2.5\,\mathrm{m}$. The adaptive runs start from a mesh of roughly 28,000 DoFs.

## The nine input files

| File | Mesh | Adaptivity | $h_w$ | `energy_threshold` | Output |
| --- | --- | --- | --- | --- | --- |
| `01.toml` | `01` LR reference | off | $0.5H$ | 0.5 | `output/01/` |
| `02.toml` | `01` LR reference | off | $0.25H$ | 5.0 | `output/02/` |
| `03.toml` | `01` LR reference | off | $0$ | 10.0 | `output/03/` |
| `04.toml` | `02` coarse | **on** | $0.5H$ | 0.5 | `output/04/` |
| `05.toml` | `02` coarse | **on** | $0.25H$ | 5.0 | `output/05/` |
| `06.toml` | `02` coarse | **on** | $0$ | 10.0 | `output/06/` |
| `07.toml` | `12` refined LR | off | $0.5H$ | 0.5 | `output/07/` |
| `08.toml` | `12` refined LR | off | $0.25H$ | 5.0 | `output/08/` |
| `09.toml` | `12` refined LR | off | $0$ | 10.0 | `output/09/` |

Files `01`–`03` are the locally refined reference; `04`–`06` are the matching adaptive runs; `07`–`09` repeat the same three water levels on globally-refined non-adaptive mesh.

Everything else is shared: $\ell = 10\,\mathrm{m}$, `target_hmin = 2.5`, `damage_threshold = 0.1`, $\zeta = 1.5$, $\sigma_c = 0.1185\,\mathrm{MPa}$, $\kappa = 10^{-4}$.

The $h_w = 0$ cases set `loads.hydrostatic.enabled = false` rather than only zeroing the water height, so no traction term is assembled at all.

## Running it

```bash
# adaptive, hw = 0.5H
python3 main.py --input examples/4.1.accuracy/04.toml

# the locally refined reference it is compared against
python3 main.py --input examples/4.1.accuracy/01.toml
```

The LR reference runs are expensive — tens of hours in serial — because the fine mesh exists everywhere the crack might go. That is the point of the comparison.

## What to look at in the output

Watch `hmin` in `metrics.csv` for the adaptive runs: it starts at the coarse mesh size and drops toward 2.5 m as the RAMR loop refines around the growing crevasse, while `ndof` climbs from ~28,000 to its final value. For the non-adaptive runs both stay constant, and only `ms_error` moves.

## Next

- [Length-scale sensitivity](/examples/02_sensitivity/01_length_scale) — how much $\ell$ matters
- [The RAMR algorithm](/notes/04_adaptivity/01_why_amr) — how the refinement loop works
