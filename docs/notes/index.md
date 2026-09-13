# Notes

## Overview

Phase-field fracture provides a variational and computationally robust framework for modeling crack initiation, propagation, branching, and interaction without explicit crack tracking. These notes develop the formulation behind **SPICE** (Scalable Phase-field Implementation of Crack Evolution) — from the energy functional, through the stress-based crack driving force, to the recursive adaptive mesh refinement and parallel implementation that make kilometre-scale glacier fracture simulation tractable.

They are written to be read alongside the code. Wherever a formulation choice shows up in the solver, the corresponding function in `src/` is named, and wherever a parameter is exposed, its key in the input file is given.

## Who these are for

- Researchers and PhD students in solid mechanics, computational mechanics, and glaciology
- Developers implementing fracture models in FEM codes, particularly FEniCS
- Readers who understand PDEs and FEM and want an implementation-aware view of phase-field fracture

## Structure

### Introduction
What the phase field is and why it is the right tool for crevasses; what the Nye, LEFM and creep-damage models give up; where the method applies beyond glaciology; and the software, data, and reproducibility setup.

→ [What is phase-field fracture?](/notes/00_introduction/01_what_is_phase_field_fracture)

### Variational fracture mechanics
The total energy functional, the constitutive model for glacier ice, the degradation functions $g(d)$ and $\chi(d)$, and the strong form obtained by minimization.

→ [Energy formulation](/notes/01_variational_fracture/01_energy_formulation)

### Phase-field models
Why strain-energy-based models (AT1/AT2) mis-handle the tension–compression asymmetry of ice, and how the stress-based crack driving force, the Rankine-type failure envelope, and the history field replace them.

→ [The stress-based driving force](/notes/02_phase_field_models/01_at_models)

### Numerical implementation
The Galerkin weak forms, function spaces, the alternate minimization scheme, why there are no load steps, convergence criteria, and the linear solvers.

→ [Weak form and solution strategy](/notes/03_implementation/01_weak_form)

### Adaptivity
The RAMR algorithm: marking, unmarking by minimum element size, the accept–reject loop, field transfer between meshes, and deferred history-field projection.

→ [Recursive adaptive mesh refinement](/notes/04_adaptivity/01_why_amr)

### High-performance computing
Measured component-wise strong scaling, why the refinement stage does not scale, how to choose a process count, memory management, and cloud execution.

→ [Parallel performance and scaling](/notes/05_hpc/01_parallel_scaling)

### Applications
What the glacier simulations actually show, synthesized across all six case studies.

→ [Glacier crevasses](/notes/06_applications/01_glaciers)

## What you'll get out of them

- A clear understanding of the variational structure behind phase-field fracture and of the stress-based variant used for ice
- The ability to read, run, modify and debug the SPICE solver
- Practical insight into length-scale choice, parameter sensitivity, adaptivity settings and solver behaviour
- A working picture of what adaptivity and MPI buy you, and where they stop buying

## Assumed background

- Python proficiency and comfort with scientific computing
- Basic continuum mechanics and variational methods
- Familiarity with finite element discretization (weak forms, function spaces)
- No prior fracture mechanics specialization required

## The companion volume

Every case study in the manuscript has a page under [Examples](/examples/), with its input files, parameters, expected results, and the command to reproduce it.
