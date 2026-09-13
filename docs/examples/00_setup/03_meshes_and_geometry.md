# Meshes, Geometry, and Boundaries

All published studies use idealized rectangular glacier domains with pre-existing surface notches built into the mesh. This page collects the conventions and the mesh inventory.

## Coordinate system and named boundaries

`src/boundary.py` defines six named faces from the `[geometry]` extents. Every `boundary` key in an input file — for Dirichlet conditions and for the hydrostatic load — refers to one of these names:

| Name | Plane | Role in the glacier setup |
| --- | --- | --- |
| `left` | $x = 0$ | upstream face; roller, $u_x = 0$ |
| `right` | $x = L_x$ | **terminus / ocean face**; hydrostatic pressure applied here |
| `front` | $y = 0$ | lateral face; roller, $u_y = 0$ |
| `back` | $y = L_y$ | lateral face / margin; roller, $u_y = 0$ |
| `bottom` | $z = 0$ | glacier base; roller, $u_z = 0$ |
| `top` | $z = L_z$ | ice surface; traction free, where crevasses initiate |

Gravity acts along $-z$. Free-slip conditions on bottom, left, front and back constrain displacement normal to each surface while allowing tangential motion — the smooth-roller supports drawn in the manuscript figures.

## The ocean load

The hydrostatic traction is built as a dolfin `Expression` and applied on the marked face:

$$
p_w(z) = \rho_s\, g\, \langle h_w - z \rangle,
\qquad h_w = \texttt{water\_height\_ratio} \times L_z .
$$

With `component = 0` and `sign = -1.0` on the `right` face, this is a compressive pressure acting in $-x$, opposing the gravity-driven tension that opens surface crevasses. Above the water line the expression evaluates to zero.

The three published water levels are `water_height_ratio` $= 0$, $0.25$ and $0.5$, i.e. $h_w = 0$, $0.25H$ and $0.5H$ where $H = L_z = 125\,\mathrm{m}$.

## Notches

Crevasses are localized by notches cut into the mesh rather than by prescribing damage. Each notch is $5\,\mathrm{m}$ wide and extends $10\,\mathrm{m}$ in the other two directions ($l_x = 5$, $l_y = 10$, $l_z = 10\,\mathrm{m}$), opening at the top surface. Initializing notches allows crack localization and benchmarking against linear elastic fracture mechanics results.

Notch placement defines the study:

- **single notch** at the top centre of the front face (§4.1, §4.2, §4.5 scaling);
- **two notches** on opposite lateral faces at mid-length, each offset $S$ from the centerline so the spacing is $2S$ (§4.3);
- **five notches** on one lateral face, uniformly spaced by $S$ (§4.4);
- **ten notches**, five on each of two opposing faces (§4.4);
- **thirty notches** spaced $90\,\mathrm{m}$ apart on the kilometre-scale domain (§4.5, §4.6).

## Mesh inventory

Meshes live in `data/mesh/NN/` as XDMF plus a matching HDF5 file. Counts below are read from the XDMF headers of the files in this repository.

| Dir | File | Domain (m) | Description | Vertices | Tetrahedra |
| --- | --- | --- | --- | ---: | ---: |
| `01` | `Lx500_1C_NA.xdmf` | 500 × 750 × 125 | 1 crevasse, locally refined reference | 388,561 | 2,257,811 |
| `02` | `Lx500_1C_AD.xdmf` | 500 × 750 × 125 | 1 crevasse, coarse start for RAMR | 7,788 | 34,535 |
| `03` | `Lx500_2C_S15.xdmf` | 500 × 750 × 125 | 2 crevasses, offset 15 m | 7,284 | 32,254 |
| `04` | `Lx500_2C_S25.xdmf` | 500 × 750 × 125 | 2 crevasses, offset 25 m | 7,290 | 32,301 |
| `05` | `Lx500_2C_S50.xdmf` | 500 × 750 × 125 | 2 crevasses, offset 50 m | 7,293 | 32,290 |
| `06` | `Lx500_2C_S100.xdmf` | 500 × 750 × 125 | 2 crevasses, offset 100 m | 7,280 | 32,270 |
| `07` | `Lx500_5C_S50.xdmf` | 500 × 750 × 125 | 5 crevasses, spacing 50 m | 10,467 | 47,296 |
| `08` | `Lx500_5C_S70.xdmf` | 500 × 750 × 125 | 5 crevasses, spacing 70 m | 10,467 | 47,234 |
| `09` | `Lx500_10C_S70.xdmf` | 500 × 750 × 125 | 10 crevasses, opposing faces, spacing 70 m | 12,715 | 56,933 |
| `10` | `Lx500_1C_NA.xdmf` | 500 × 750 × 125 | 1 crevasse, large mesh for strong scaling | 4,441,412 | 26,753,494 |
| `11` | `Lx1500_30C_S90.xdmf` | 1500 × 750 × 125 | kilometre scale, 30 crevasses, spacing 90 m | 25,054 | 116,454 |
| `12` | `Lx500_1C_NA.xdmf` | 500 × 750 × 125 | 1 crevasse, refined non-adaptive reference | 3,025,034 | 17,639,808 |

Each directory also contains a `*_outline` mesh — a coarse boundary representation of the same domain, useful as a wireframe when rendering results.

## Degrees of freedom

With the standard CG1/CG1/DG0 spaces:

$$
n_{\mathrm{dof}}^{u} = 3 \times n_{\mathrm{vertices}}, \qquad
n_{\mathrm{dof}}^{d} = n_{\mathrm{vertices}}, \qquad
n_{\mathrm{dof}}^{\mathcal{H}} = n_{\mathrm{cells}} .
$$

The `ndof` column reported in `metrics.csv` is $n_{\mathrm{dof}}^{u} + n_{\mathrm{dof}}^{d} = 4 \times n_{\mathrm{vertices}}$, so the coarse RAMR starting meshes (§4.1–§4.3) begin around 28,000–31,000 DoFs and grow from there.

## Meshing a new case

The solver reads a mesh; it does not generate one. To set up a new geometry:

1. Build the domain with the notches cut out, mesh it with tetrahedra, and write it as XDMF (`meshio` converts from Gmsh readily).
2. Keep the domain aligned with the axes and anchored at the origin, so the six named boundaries in `src/boundary.py` resolve correctly.
3. Set `[geometry]` to match the extents exactly — `Lx`, `Ly`, `Lz` are what the `near(...)` boundary tests compare against, and they also set $h_w$.
4. Start coarse. RAMR will refine where it needs to; the starting mesh only has to resolve the geometry, not the fracture.
