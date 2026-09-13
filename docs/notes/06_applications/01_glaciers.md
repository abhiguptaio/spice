# Glacier Crevasses: What the Simulations Show

This page synthesizes the physical findings from the SPICE glacier studies. Each section links to the corresponding example page, which gives the input files, parameters, and how to reproduce the run.

## The common setup

Every simulation uses an idealized 3-D glacier terminus: a rectangular prism representing a small region of an ice shelf, loaded by

- a **vertical body force** from gravity in the ice domain, and
- **hydrostatic ocean pressure** $p_w(z) = \rho_s g \langle h_w - z \rangle$ on the terminus (right) face,

with free-slip (roller) conditions on the bottom, left, front and back faces — displacement normal to each surface is constrained while tangential motion is free. Notches are initialized in the mesh to localize the crack and to permit comparison with LEFM. Both loads are applied at the start and held constant; the simulation terminates automatically once the crevasse tip stress is no longer tensile.

Domain dimensions are $500 \times 750 \times 125\,\mathrm{m}$ for §4.1–§4.5, and $1500 \times 750 \times 125\,\mathrm{m}$ for the kilometre-scale studies.

## Ocean pressure controls depth

Raising the ocean water level applies larger compressive stress at the terminus and suppresses deeper crevasse propagation:

| $h_w$ | Crevasse depth |
| --- | --- |
| $0$ | ~112 m |
| $0.25H$ | ~89 m |
| $0.5H$ | ~40 m |

These depths match analytical LEFM results for an isolated crevasse, which is the validation case for the model ([§4.1](/examples/01_accuracy/01_ramr_vs_local_refinement)).

## Depth is insensitive to the length scale

Varying $\ell$ over $\{5, 10, 20\}\,\mathrm{m}$ changes the width of the damage band proportionally, with negligible qualitative difference in crack path and depth — 42, 40 and 40 m respectively — while cost changes by a factor of three ([§4.2](/examples/02_sensitivity/01_length_scale)).

The implication is practical and important: $\ell$ need not be chosen as a material parameter determined strictly by ice properties. Guided by observed crevasse and rift widths and spacing, a larger $\ell$ can be chosen, which raises the minimum element size and makes glacier- and ice-shelf-scale fracture simulation tractable. The caveat is that $\ell$ must remain smaller than the spacing between crevasses.

## Spacing controls the pattern, not the depth

Two crevasses offset by $S$ on either side of the centerline (spacing $2S$) produce four distinct behaviours ([§4.3](/examples/03_interaction/01_two_crevasse_interaction)):

| $S$ | Behaviour | Depth |
| --- | --- | --- |
| 15 m | turn toward each other and **coalesce** | 39 m |
| 25 m | **curve** toward each other, do not merge | 40 m |
| 50 m | pass each other and **shield**, both arrest | 40 m |
| 100 m | propagate **independently** | 40 m |

Coalescence at small offsets occurs because the stress fields near the crack tips overlap strongly, amplifying tensile stress in the bridging zone. At larger offsets the redistribution is not sufficient to merge the cracks, and beyond that the crevasses shield each other instead.

Crevasse depth stays nearly constant at 39–40 m across all four. Spacing governs interaction in the **horizontal** plane; **vertical** propagation is governed by the magnitude of the longitudinal tensile stress, which is set by glacier height (increasing tension) and seawater height (reducing it).

## In a field of identical defects, only a few become rifts

With five uniformly spaced notches on one lateral face ([§4.4](/examples/04_competitive/01_crevasse_fields)):

- at $S = 50\,\mathrm{m}$, only the **first and fifth** notches propagate, reaching ~41 m, while the interior notches arrest early;
- at $S = 70\,\mathrm{m}$, the **first and fourth** propagate;
- with five notches on *each* of two opposing faces at $S = 70\,\mathrm{m}$, only the first and fourth from the left propagate — and coalesce with their opposing counterparts to form through-going fractures of ~41 m.

Selective growth is stress shielding: the growing outer crevasses reduce tensile stress in the inner regions and suppress fracture there. Even with uniformly sized and positioned defects, only a subset evolves into dominant rifts.

The arrested crevasses also explain why final depths are consistent with LEFM (appropriate for *isolated* crevasses) rather than with the zero-stress model (appropriate for *closely spaced* crevasses).

## Spacing sits between the classical bounds

In the kilometre-scale field of 30 crevasses spaced $90\,\mathrm{m}$ apart ([§4.5](/examples/05_parallel/01_strong_scaling)), maximum depths range from **92 to 102 m** — less than the LEFM depth of 112 m, but much greater than the Nye zero-stress depth of 62.5 m. The 90 m spacing allows only partial interaction and diminished crack-shielding.

Crevasse spacing is therefore an important parameter for determining crevasse depth, and it is not explicitly considered in either the Nye or LEFM models, which is why those models provide lower and upper limits on calving rather than predictions.

## Lateral boundary conditions reorganize everything

Changing only the treatment of the back boundary at $y = 750\,\mathrm{m}$ changes the entire fracture pattern ([§4.6](/examples/06_boundary/01_margin_boundary_conditions)):

**Fixed margin.** Tensile stresses accumulate along the constrained face and crevasses initiate immediately along it. Only a few near the terminus propagate, with **arcuate paths** curving toward the ocean boundary. A fixed lateral constraint concentrates stress along the margin and restricts crevasse development away from the ocean boundary.

**Released margin.** Releasing the constraint lets the glacier body move, producing large tensile stresses along the flow direction. The redistribution allows additional cracks to form, with propagation both parallel and perpendicular to flow: branching, merging, curved paths and multi-directional growth — a **crisscross** network.

Both patterns have field counterparts. Arcuate (chevron or en echelon) crevasses are commonly observed where one boundary is fixed relative to the ocean boundary; crisscross or checkerboard patterns are seen near the termini of rapidly calving glaciers including Thwaites Glacier, Narsap Sermia, and glaciers with likely weak lateral buttressing such as the Pine Island Ice Shelf. Away from lateral margins, where the constraint is absent, crevasses are expected to be straighter — which is what is observed.

## Why 3-D fracture modeling matters here

There are scenarios where the average crevasse depth is approximately what Nye or LEFM predicts, but the **horizontal extent** of the crevasses is not — and horizontal extent is what decides whether an iceberg detaches. A crevasse can extend through the full thickness of the glacier without producing calving if it does not connect to the calving front or to a lateral boundary. In the fixed-margin simulation, several crevasses reach full depth but only some would lead to calving, specifically for that reason.

That is the argument for tracking full 3-D fracture development rather than parameterizing a bulk crevasse depth.

## Open directions

The paper identifies several extensions: incorporating viscous creep and visco-elastic ice flow, strength-surface-based failure criteria, hydrofracture in a physically consistent manner, and using ensembles of SPICE simulations to train neural network fracture surrogates that could be embedded in ice-sheet models. See [applications](/notes/00_introduction/04_applications).
