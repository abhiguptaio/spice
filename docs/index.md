---
layout: home

hero:
  text: Scalable Phase-field Implementation of Crack Evolution
  tagline: A parallel, recursively adaptive phase-field fracture framework for simulating surface crevasse growth and interaction in glaciers. These pages document the formulation, the numerical implementation in FEniCS, the recursive adaptive mesh refinement algorithm that makes kilometre-scale simulation with metre-scale resolution affordable, and every published case study with the input files needed to reproduce it.
  actions:
    - theme: brand
      text: Start reading
      link: /notes/
    - theme: alt
      text: Run an example
      link: /examples/00_setup/01_running_a_simulation
    - theme: alt
      text: GitHub
      link: https://github.com/abhiguptaio/spice

features:
  - title: Variational fracture mechanics
    icon: ⊙
    details: The energetic foundations of phase-field fracture. Governing equations derived from the total energy, the role of the regularization length scale, and how the formulation connects to Griffith fracture and regularized crack representations.
    link: /notes/01_variational_fracture/01_energy_formulation

  - title: The stress-based driving force
    icon: ◈
    details: Why glacier ice needs a tension-sensitive crack driving force. Principal-stress decomposition, the Rankine-type failure envelope, irreversibility through the history field, and the implementation parameters that go with it.
    link: /notes/02_phase_field_models/01_at_models

  - title: Numerical implementation in FEniCS
    icon: ▲
    details: Weak forms, function spaces, and the alternate minimization scheme, mapped line by line onto the solver. Includes why there are no load steps in a glacier fracture problem and what convergence means without them.
    link: /notes/03_implementation/01_weak_form

  - title: Recursive adaptive mesh refinement
    icon: ⌂
    details: The RAMR algorithm — an accept–reject refinement loop inside the solver that resolves metre-scale fracture zones in kilometre-scale domains without any prior knowledge of the crack path. Marking, transfer, and history-field projection.
    link: /notes/04_adaptivity/01_why_amr

  - title: High-performance and parallel computing
    icon: ⎈
    details: Measured component-wise strong scaling for a 13.4 million DoF problem, why parallel refinement is the bottleneck, how to choose a process count, and what it takes to run a 13 million DoF glacier simulation in under ten hours.
    link: /notes/05_hpc/01_parallel_scaling

  - title: Glacier case studies
    icon: ❖
    details: What the simulations show — ocean pressure controls crevasse depth, spacing controls the pattern, stress shielding selects which defects become rifts, and lateral margin conditions produce curved or crisscross fracture networks.
    link: /notes/06_applications/01_glaciers

---
