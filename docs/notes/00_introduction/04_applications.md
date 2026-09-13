# Applications in Engineering and Geophysics

SPICE was built for one problem — surface crevasse growth and interaction in glaciers — but the formulation it implements is a general brittle-fracture model for solid earth materials. This page separates what the code has been applied to from what the formulation can reach.

## Glaciers and ice shelves

This is the target application and the source of every example in this repository.

**Crevasse depth under ocean loading.** Gravity puts the near-surface ice in tension; hydrostatic pressure at the terminus suppresses it. Raising the ocean water level from $h_w = 0$ to $h_w = 0.5H$ cuts the crevasse depth from $\sim 112\,\mathrm{m}$ to $\sim 40\,\mathrm{m}$ ([§4.1](/examples/01_accuracy/01_ramr_vs_local_refinement)).

**Interaction and shielding.** Two crevasses offset by $2S$ across the glacier centerline coalesce at $S = 15\,\mathrm{m}$, curve toward each other without merging at $S = 25\,\mathrm{m}$, pass and shield each other at $S = 50\,\mathrm{m}$, and propagate independently at $S = 100\,\mathrm{m}$ ([§4.3](/examples/03_interaction/01_two_crevasse_interaction)). Depth stays nearly constant at $39$–$40\,\mathrm{m}$ throughout: spacing controls the *pattern*, not the depth.

**Competitive growth in crevasse fields.** With five uniformly spaced notches, only a subset becomes dominant; the interior notches arrest early because the growing outer crevasses shield them ([§4.4](/examples/04_competitive/01_crevasse_fields)). This is the mechanism behind rift selection in a field of near-identical defects.

**Calving-front-scale fracture patterns.** At $1500 \times 750 \times 125\,\mathrm{m}$ with 30 initial notches, the simulated pattern reproduces the arcuate (chevron / en echelon) crevasses seen where one boundary is fixed relative to the ocean boundary, and a crisscross pattern once the lateral constraint is released ([§4.6](/examples/06_boundary/01_margin_boundary_conditions)). Similar patterns are observed near the termini of Thwaites Glacier, Narsap Sermia, and the Pine Island Ice Shelf.

## Beyond glaciology

The governing equations contain nothing ice-specific: a linear elastic solid, a tensile failure surface in principal stress space, and a regularized damage field. The same implementation applies wherever brittle fracture under self-weight and pressure loading is the question — rock, sea ice, soil, and geotechnical engineering problems generally.

Natural extensions identified in the SPICE paper, none of which are implemented in this repository today:

- **Viscous and visco-elastic ice flow**, replacing the linear elastic constitutive assumption;
- **Strength-surface-based failure criteria** (e.g. Mohr–Coulomb) in place of the Rankine-type envelope, for ice-cliff stability;
- **Hydrofracture**, coupling water pressure inside the crevasse to fracture growth — relevant to surface meltwater drainage and to basal crevasses;
- **Fluid-driven fracture in the solid earth**, including hydrothermal and enhanced geothermal systems;
- **Surrogate modeling**, using ensembles of SPICE runs to train neural network fracture emulators that could be embedded in ice-sheet models.

## What it is not

SPICE is a quasi-static brittle fracture solver. There is no physical time stepping: loads are applied once, and the iteration index is a pseudo-time that advances until the fracture configuration stops changing (see [the solution strategy](/notes/03_implementation/01_weak_form)). It does not model healing, refreezing, snow bridging, or creep closure, and it does not model the ice flow that redistributes stress over years.
