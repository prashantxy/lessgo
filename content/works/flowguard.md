---
title: FlowGuard
tag: Real-time crowd-flow CV
year: "2026"
excerpt: Turning CCTV from a recording into a warning — density, direction, congestion and counter-flow, pushed live to an operator console before a crowd becomes a crush.
stack: [TypeScript, Node.js, Express, WebSockets, Python CV, React]
---

A railway station, a stadium or a festival ground can go from busy to dangerous in minutes, and the CCTV watching it mostly just records. Someone has to be looking at the right feed at the right moment. FlowGuard's job is to make sure the important event gets noticed before it becomes an emergency.

## Beyond counting heads

A people-counter answers *how many*. FlowGuard also asks *how are they moving?* Each processed frame becomes a structured observation — count, density, flow direction and speed, congestion — and those are combined into a risk level: SAFE, WATCH, WARNING, CRITICAL.

```json
{
  "peopleCount": 153,
  "density": 0.78,
  "flow": { "direction": "north", "speed": 1.21 },
  "congestion": "high",
  "risk": "warning"
}
```

The point of the extra signals is the cases a count misses: a number of people that is safe in itself, but growing fast, or moving against the flow.

## The pipeline

```
Video / CCTV → frame extraction → detection · tracking · motion
             → crowd observation → risk engine → WebSocket → dashboard
```

Video is sampled into frames at a configurable rate, and only the observations — not the frames — travel on. A Python computer-vision layer does detection and motion; the model layer is kept separate from the application so a better detector can be swapped in without touching the backend.

## Why push, not poll

A processed video could be one HTTP request. A live camera is a stream of changes — 143 people, 147, 153, 168, *warning* — and an operator needs the warning the moment it exists. So the Node/Express backend pushes each new observation over a WebSocket to every connected console, and the dashboard is built to answer three questions at a glance: where is the problem, what is happening, and how serious is it.

## Built to grow

The processing is stateless, so camera feeds can be spread across as many CV workers as there are cameras. The dashboard never scales with the cameras; only the processing layer does. The prototype runs on uploaded video — the next step is the same pipeline on live RTSP streams, then zones with their own thresholds and predictive alerts from the growth rate.

Built at the Paytm hackathon. The live console is laid out for a desktop screen.
