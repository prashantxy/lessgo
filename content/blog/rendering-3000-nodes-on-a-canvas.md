---
title: "Rendering 3,000 nodes on a canvas without dropping frames"
date: "2026-05-21"
excerpt: "SVG gave up around 800 nodes. Here's what moving the knowledge graph to canvas actually involved."
tags: ["frontend", "canvas", "performance"]
---

The knowledge graph view started in SVG because SVG is pleasant: each node is an element, you attach a click handler, the browser does hit-testing for you. It held up through demos. It fell over in production, somewhere north of 800 nodes, when panning turned into a slideshow.

The problem with SVG at that scale is that every node is a DOM element and every frame is a layout. Canvas has no DOM — you get one element and a 2D context, and you're responsible for everything, including working out what the user clicked on.

## The redraw loop

The whole view is one `<canvas>` and a render function that runs on a `requestAnimationFrame` loop *only when something changed* — a pan, a zoom, a simulation tick. A dirty flag, not a constant 60fps burn.

```
function frame() {
  if (dirty) { draw(); dirty = false; }
  raf = requestAnimationFrame(frame);
}
```

Layout comes from a force simulation that's allowed to run for a fixed number of ticks and then freezes. A graph that keeps jittering forever is exhausting to look at and expensive to draw.

## Hit-testing by hand

Clicks are the part SVG did for free. On canvas you keep the node positions in a plain array and, on click, walk it to find the nearest node within its radius. Three thousand entries is nothing for a linear scan at click time — this only becomes a quadtree problem if you're hit-testing every mousemove, which you can avoid by only doing it on click and on a throttled hover.

## Culling

Don't draw what's off-screen. Before the draw loop, filter nodes and edges to the current viewport plus a margin. At high zoom you're drawing 3,000 nodes; zoomed in you might be drawing 40, and the frame cost drops with it.

The result renders the full 3,000-node graph and pans smoothly. The code is longer and less elegant than the SVG version. That's the trade.
