# UNIVERSE_3D.md — Google-Earth-inspired repository universe

## Experience
3D sphere per organization. Repositories are stable spatial clusters on/around the sphere; related repos connected by arcs. Semantic zoom reveals increasing detail.

## Zoom levels
L0 organization globe and high-level risk summaries.
L1 repository clusters, dependencies, ownership.
L2 directories, modules, APIs and services.
L3 files, classes, functions, imports and calls.
L4 dataflows, trust boundaries, identities and controls.
L5 evidence-backed attack paths, hypotheses and validation details.

## Controls
Orbit/pan/dolly, click-to-focus, breadcrumbs, search, filters, back/forward, keyboard navigation, 2D graph fallback. Highlight edge direction and evidence state.

## Spatial model
Deterministic seed based on stable IDs; clustering by architecture/domain. Positions are visualization attributes, not graph truth. Preserve approximate positions between snapshots to support diff mode.

## Rendering
Three.js initially with WebGL2 fallback; WebGPU optional. Instanced meshes, LOD, batched lines, labels by relevance, raycasting picking, frustum culling, viewport subgraph streaming. No Earth map/geography required; avoid implying repos have physical coordinates.

## Security overlays
Distinct visual encoding for observed/inferred/validated/refuted edges; risk as optional overlay rather than permanent color of repositories. Never display secret values.

## Acceptance
Synthetic org with ≥20 repos; select a repo and navigate to a function and its source evidence; show at least one cross-repo edge; 2D fallback works; keyboard-accessible selection; measurable frame-time report on a declared test machine.
