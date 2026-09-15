# Relation to Classical Fracture Mechanics

**Griffith / LEFM.** A crack grows when the energy released per unit of new crack area reaches the material's fracture energy. In practice this is evaluated through a stress intensity factor $K$ compared against a toughness $K_c$. The crack path must be assumed.

**Variational (Francfort–Marigo) fracture.** Griffith's criterion restated as minimization of a total energy that includes a surface term proportional to crack area. Crack path is no longer assumed — it falls out of the minimization — but the surface term is still defined on an unknown surface.

**Phase-field fracture.** The surface term is regularized into a volume integral over a diffuse damage band of width $\ell$. Everything becomes a coupled PDE system on a fixed mesh. See the [energy formulation](/notes/01_variational_fracture/01_energy_formulation).

**Stress-based phase field (used here).** The crack driving force is built from the positive part of the effective stress rather than from strain energy release. It reproduces the tension–compression asymmetry that ice requires, and it makes $\ell$ a numerical rather than material parameter. See [the driving force](/notes/02_phase_field_models/01_at_models).

## Side-by-side

| | Nye (zero stress) | LEFM | Creep damage | Stress-based PFM |
| --- | --- | --- | --- | --- |
| Crack path | assumed vertical | assumed | diffuse | computed |
| Interaction between crevasses | none | none (superposition only) | partial | resolved |
| Arbitrary geometry / BCs | no | limited | yes | yes |
| Free parameters | none | $K_c$ | several fitting parameters | $\ell$, $\sigma_c$ |
| 3-D branching / coalescence | no | no | no | yes |
| Cost | negligible | negligible | moderate | high (hence RAMR) |

## The part only a 3-D model sees

Depth is not the only thing that matters. A crevasse can reach the full thickness of a glacier without producing an iceberg if it does not connect to the calving front or to a lateral boundary. In the fixed-boundary simulation of [§4.6](/examples/06_boundary/01_margin_boundary_conditions), several crevasses reach full depth but only some lead to calving, precisely for that reason. The horizontal extent and connectivity of fractures is a genuinely three-dimensional result, and it is inaccessible to models that track a single bulk depth.
