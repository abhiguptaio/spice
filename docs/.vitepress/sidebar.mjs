export const sidebar_content = {
  "/notes/": [
    {
      text: "Introduction",
      collapsed: false,
      items: [
        {
          text: "What is Phase-Field Fracture?",
          link: "/notes/00_introduction/01_what_is_phase_field_fracture",
        },
        {
          text: "Why Phase-Field Methods for Fracture?",
          link: "/notes/00_introduction/02_why_phase_field",
        },
        {
          text: "Relation to Classical Fracture Mechanics",
          link: "/notes/00_introduction/03_classical_vs_phase_field",
        },
        {
          text: "Applications in Engineering and Geophysics",
          link: "/notes/00_introduction/04_applications",
        },
        {
          text: "Software, Data, and Reproducibility",
          link: "/notes/00_introduction/05_tools_and_reproducibility",
        },
      ],
    },
    {
      text: "Variational Fracture Mechanics",
      collapsed: false,
      items: [
        {
          text: "Energy Formulation",
          link: "/notes/01_variational_fracture/01_energy_formulation",
        },
      ],
    },
    {
      text: "Phase-Field Models",
      collapsed: false,
      items: [
        {
          text: "The Stress-Based Driving Force",
          link: "/notes/02_phase_field_models/01_at_models",
        },
      ],
    },
    {
      text: "Numerical Implementation",
      collapsed: false,
      items: [
        {
          text: "Weak Form and Solution Strategy",
          link: "/notes/03_implementation/01_weak_form",
        },
      ],
    },
    {
      text: "Adaptivity",
      collapsed: false,
      items: [
        {
          text: "Recursive Adaptive Mesh Refinement",
          link: "/notes/04_adaptivity/01_why_amr",
        },
      ],
    },
    {
      text: "High-Performance Computing",
      collapsed: false,
      items: [
        {
          text: "Parallel Performance and Scaling",
          link: "/notes/05_hpc/01_parallel_scaling",
        },
      ],
    },
    {
      text: "Applications",
      collapsed: false,
      items: [
        {
          text: "Glacier Crevasses",
          link: "/notes/06_applications/01_glaciers",
        },
      ],
    },
  ],

  "/examples/": [
    {
      text: "Getting Started",
      collapsed: false,
      items: [
        {
          text: "Running a Simulation",
          link: "/examples/00_setup/01_running_a_simulation",
        },
        {
          text: "Input File Reference",
          link: "/examples/00_setup/02_input_file_reference",
        },
        {
          text: "Meshes, Geometry, and Boundaries",
          link: "/examples/00_setup/03_meshes_and_geometry",
        },
      ],
    },
    {
      text: "Glacier Case Studies",
      collapsed: false,
      items: [
        {
          text: "4.1 Accuracy and Efficiency of RAMR",
          link: "/examples/01_accuracy/01_ramr_vs_local_refinement",
        },
        {
          text: "4.2 Length-Scale Sensitivity",
          link: "/examples/02_sensitivity/01_length_scale",
        },
        {
          text: "4.3 Two-Crevasse Interaction",
          link: "/examples/03_interaction/01_two_crevasse_interaction",
        },
        {
          text: "4.4 Competitive Growth in Crevasse Fields",
          link: "/examples/04_competitive/01_crevasse_fields",
        },
        {
          text: "4.5 Parallel Performance and Kilometre Scale",
          link: "/examples/05_parallel/01_strong_scaling",
        },
        {
          text: "4.6 Effect of Margin Boundary Conditions",
          link: "/examples/06_boundary/01_margin_boundary_conditions",
        },
      ],
    },
  ],
};
