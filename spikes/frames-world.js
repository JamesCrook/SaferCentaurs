framesWorld = {
  "title": "White frames for a comic book",
  "id": "world.frames",
  "edgeStyles": [
    {
      "id": "arrow1",
      "angle": 0,
      "width": 10,
      "startEndType": ">",
      "endEndType": ">",
      "startSlant": 0,
      "endSlant": 0,
      "fill": "#fff",
      "outline": "#111"
    },
    {
      "id": "blunt",
      "angle": 0,
      "width": 10,
      "startEndType": "[",
      "endEndType": "]",
      "startSlant": 0,
      "endSlant": 0,
      "fill": "#fff",
      "outline": "#111"
    }
  ],
  "pointStyles": [
    {
      "id": "emoji",
      "radius": 10,
      "innerFont": "70% Arial",
      "strength": 0,
      "fill": "#f918",
      "outline": "#a51a"
    },
    {
      "id": "pt",
      "radius": 5,
      "fill": "#0000ff",
      "outline": "#00000000"
    }
  ],
  "nodes": [
    {
      "id": "p1",
      "name": "A",
      "description": "A",
      "x": 100,
      "y": 150
    },
    {
      "id": "p2",
      "name": "B",
      "description": "A",
      "x": 800,
      "y": 150
    },
    {
      "id": "p3",
      "name": "C",
      "description": "A",
      "x": 100,
      "y": 500
    },
    {
      "id": "p4",
      "name": "D",
      "description": "A",
      "x": 800,
      "y": 500
    },
    {
      "id": "p5",
      "name": "E",
      "description": "A",
      "x": 200,
      "y": 50
    },
    {
      "id": "p6",
      "name": "F",
      "description": "A",
      "x": 200,
      "y": 550
    },
    {
      "id": "p7",
      "name": "G",
      "description": "A",
      "x": 700,
      "y": 50
    },
    {
      "id": "p8",
      "name": "H",
      "description": "A",
      "x": 700,
      "y": 550
    }
  ],
  "connections": [
    {
      "from": "p1",
      "to": "p2",
      "style": "arrow1"
    },
    {
      "from": "p3",
      "to": "p4",
      "style": "arrow1"
    },
    {
      "from": "p5",
      "to": "p6",
      "style": "arrow1"
    },
    {
      "from": "p7",
      "to": "p8",
      "style": "arrow1"
    }
  ],
  "layers": [
    {
      "type": "grid",
      "spacing": 30
    },
    {
      "type": "network",
      "fill": false
    },
    {
      "type": "network",
      "outline": false
    }
  ]
};
