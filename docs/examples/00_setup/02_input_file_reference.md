# Input File Reference

Every simulation is described by a single TOML file, parsed and validated by `src/config.py`. This page documents every section and key the parser accepts.

**Required** means the key has no default and the run fails without it. Relative paths are resolved against the directory containing the input file.

## `[problem]`

| Key | Default | Notes |
| --- | --- | --- |
| `name` | `"phase-field problem"` | free-text label |
| `model` | `"stress_cdf"` | **only** `stress_cdf` is implemented; any other value is rejected |
| `precrack_depth_ratio` | `0.0` | parsed but not used by the solver |

## `[mesh]`

| Key | Default | Notes |
| --- | --- | --- |
| `path` | **required** | XDMF mesh file; the matching `.h5` must sit beside it |

## `[geometry]`

| Key | Default | Notes |
| --- | --- | --- |
| `Lx`, `Ly`, `Lz` | **required** | domain extents in metres; all must be positive |

These define the named boundaries and the ocean water height, so they must match the mesh.

## `[finite_element]`

| Key | Default | Notes |
| --- | --- | --- |
| `displacement_family` / `displacement_degree` | `"CG"` / `1` | vector space for $\boldsymbol{u}$ |
| `damage_family` / `damage_degree` | `"CG"` / `1` | scalar space for $d$ |
| `history_family` / `history_degree` | `"DG"` / `0` | **must be DG0** — validation rejects anything else |

## `[material]`

All five keys are **required**.

| Key | Published value | Notes |
| --- | --- | --- |
| `youngs_modulus` | `9.5e9` | Pa; must be positive |
| `poissons_ratio` | `0.35` | must lie in $(-1, 0.5)$ |
| `ice_density` | `917.0` | kg/m³; used for the gravity body force |
| `freshwater_density` | `1000.0` | kg/m³; selectable for the hydrostatic load |
| `seawater_density` | `1020.0` | kg/m³; used by all published studies |

Lamé parameters are derived internally through the shear and bulk moduli.

## `[fracture]`

| Key | Default | Notes |
| --- | --- | --- |
| `length_scale` | **required** | $\ell$ in metres; positive |
| `critical_stress` | **required** | $\sigma_c$ in Pa; positive. Published value `0.1185e6` |
| `energy_threshold` | **required** | zeroes the driving force wherever $\mathcal{C}^{+}$ does not exceed this value |
| `zeta` | `1.0` | multiplies the driving force, $\mathcal{H}^{+} \leftarrow \zeta\,\mathcal{C}^{+}$ |
| `residual_stiffness` | `1.0e-4` | $\kappa$ in $g(d) = (1-d)^2 + \kappa$; cannot be negative |

`zeta` and `energy_threshold` are numerical parameters of the implementation and are set per study — see the individual example pages for the values used.

## `[loads.gravity]`

| Key | Default | Notes |
| --- | --- | --- |
| `enabled` | `true` | when false, the body force is zero |
| `acceleration` | `9.81` | m/s² |
| `direction` | `[0.0, 0.0, -1.0]` | exactly three components |

The body force is $\rho_i\, g$ times this direction, applied only where $d \leq 0.6$ (see [$\chi(d)$](/notes/01_variational_fracture/01_energy_formulation#mechanical-equilibrium)).

## `[loads.hydrostatic]`

The ocean water pressure at the terminus, $p_w(z) = \rho\, g \langle h_w - z \rangle$, applied on one named face.

| Key | Default | Notes |
| --- | --- | --- |
| `enabled` | `true` | |
| `boundary` | `"right"` | one of `front`, `back`, `left`, `right`, `bottom`, `top` |
| `marker` | `1` | facet marker id for the traction measure |
| `density_source` | `"seawater"` | `ice`, `freshwater`, or `seawater` |
| `water_height_ratio` | `0.5` | $h_w = \texttt{ratio} \times L_z$; cannot be negative |
| `component` | `1` | which displacement component the traction acts on — **all published inputs set `0`** |
| `sign` | `-1.0` | `-1` makes the pressure compressive on the `right` face |
| `degree` | `1` | quadrature degree of the `Expression` |

## `[[boundary_conditions]]`

An array of tables, one per Dirichlet condition.

| Key | Default | Notes |
| --- | --- | --- |
| `name` | **required** | label used in error messages |
| `boundary` | **required** | one of the six named faces |
| `type` | `"dirichlet"` | the only supported type |
| `component` | none | `0`, `1` or `2` for a single component; omit for a full vector |
| `value` | **required** | scalar for a component condition; three values if `component` is omitted |

The standard free-slip (roller) set used by every study:

```toml
[[boundary_conditions]]
name = "bottom_roller"
boundary = "bottom"
component = 2
value = 0.0

[[boundary_conditions]]
name = "left_roller"
boundary = "left"
component = 0
value = 0.0

[[boundary_conditions]]
name = "front_roller"
boundary = "front"
component = 1
value = 0.0

[[boundary_conditions]]
name = "back_roller"
boundary = "back"
component = 1
value = 0.0
```

## `[adaptivity]`

| Key | Default | Notes |
| --- | --- | --- |
| `enabled` | `true` | when false, the mesh is used as given and no refinement occurs |
| `target_hmin` | **required** | minimum element size; cells finer than this are unmarked. Published studies use $\ell/4$ |
| `damage_threshold` | **required** | cells whose DG0-projected damage exceeds this are marked; must lie in $[0,1]$ |

## `[solver]`

| Key | Default |
| --- | --- |
| `linear_solver` | `"gmres"` |
| `preconditioner` | `"hypre_euclid"` |
| `projection_linear_solver` | `"gmres"` |
| `projection_preconditioner` | `"hypre_euclid"` |
| `outer_tolerance` | `1.0e-4` |
| `norm_zero_tolerance` | `1.0e-14` |

`outer_tolerance` is the convergence threshold on the relative $L^2$ change in the damage field; `norm_zero_tolerance` guards the division when the damage norm is still essentially zero.

## `[output]`

| Key | Default | Notes |
| --- | --- | --- |
| `directory` | **required** | created on rank 0 if missing |
| `filename` | `"output.xdmf"` | |
| `write_csv` | `true` | |
| `csv_filename` | `"metrics.csv"` | cannot be empty when CSV output is on |
| `write_every` | `1` | write every *N*-th accepted step; must be $\geq 1$ |
| `write_damage` | `true` | |
| `write_displacement` | `false` | published inputs enable this |
| `functions_share_mesh` | `true` | XDMF parameter |
| `rewrite_function_mesh` | `true` | XDMF parameter; must stay `true` when the mesh changes between steps |
| `flush_output` | `true` | flush after each write, so a running job can be inspected |

## `[write_checkpoint]` and `[restart_checkpoint]`

| Key | Default | Notes |
| --- | --- | --- |
| `enabled` | `false` | |
| `filename` | `<output.directory>/checkpoint.h5` (write) / `checkpoint.h5` (restart) | cannot be empty when enabled |

The write is atomic: the state goes to `<name>.tmp` and is moved into place on rank 0 only after every rank has finished writing. A checkpoint holds the mesh, displacement, damage and history fields, plus the step index, iteration counter and last error.

When `restart_checkpoint.enabled = true`, the mesh and all fields come from the checkpoint — the run continues on the adapted mesh, not the original one.

## `[logging]`

| Key | Default | Notes |
| --- | --- | --- |
| `level` | `"ERROR"` | uppercased and looked up as a dolfin `LogLevel`; an unknown name raises |
| `print_initial_hmin` | `true` | parsed but not used |
| `garbage_collect_every` | `5` | force a `gc.collect()` every *N* accepted steps; `0` disables |

## Validation

`validate_config()` rejects an input before any solve when:

- any geometry dimension is non-positive, or `youngs_modulus` is non-positive;
- `poissons_ratio` is outside $(-1, 0.5)$;
- `problem.model` is not `stress_cdf`;
- the history space is not DG0;
- `length_scale` or `critical_stress` is non-positive, or `residual_stiffness` is negative;
- `target_hmin` is non-positive, or `damage_threshold` is outside $[0,1]$;
- an unknown boundary name or hydrostatic density source is used;
- `water_height_ratio` is negative, or `hydrostatic.component` is not 0, 1 or 2;
- `write_every < 1`, or CSV output is on with an empty filename;
- `garbage_collect_every` is negative;
- a checkpoint is enabled with an empty filename;
- a boundary condition uses an unsupported type, an unknown boundary, an invalid component, or omits `component` without supplying three values.
