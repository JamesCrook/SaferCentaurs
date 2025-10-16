gitWorld = {
  "title": "Git Graph",
  "id": "world.git",
  "type": "canvas",
  "edgeStyles": [
    {
      "id": "arrow1",
      "angle": 0,
      "width": 20,
      "startEndType": "[",
      "endEndType": "]",
      "startSlant": 0,
      "endSlant": 0,
      "fill": "#79d8",
      "outline": "#579a",
      "dot": "#f70"
    },
    {
      "id": "arrow2",
      "angle": 20,
      "width": 20,
      "startEndType": ">",
      "endEndType": ">",
      "startSlant": 0,
      "endSlant": 0,
      "fill": "#f918",
      "outline": "#a51a"
    }
  ],
  "pointStyles": [
    {
      "id": "mrk",
      "radius": 5,
      "fill": "#ff8844",
      "outline": "#ffffff"
    },
    {
      "id": "emoji",
      "radius": 30,
      "innerFont": "70% Arial",
      "fill": "#f918",
      "outline": "#a51a"
    },
    {
      "id": "emoji2",
      "radius": 30,
      "innerFont": "70% Arial",
      "fill": "#ffffff80",
      "outline": "#333333"
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
      "id": "tl",
      "name": "TL",
      "emoji": "+",
      "x": 20,
      "y": 20,
      "style": "mrk"
    },
    {
      "id": "br",
      "name": "BR",
      "emoji": "+",
      "x": 880,
      "y": 570,
      "style": "mrk"
    }
  ],
  "connections": [],
  "sankeymatch": {
    "data": [
      [
        20,
        5,
        3
      ],
      [
        8,
        12,
        2
      ],
      [
        4,
        8,
        15
      ],
      [
        6,
        3,
        9
      ]
    ],
    "sourceLabels": [
      "Alpha",
      "Beta",
      "Gamma",
      "Delta"
    ],
    "targetLabels": [
      "One",
      "Two",
      "Three"
    ]
  },
  "sankeybars": {
    "data": [
      [
        10,
        15,
        8,
        12,
        20,
        18,
        14
      ],
      [
        10,
        8,
        12,
        6,
        10,
        15,
        9
      ],
      [
        10,
        12,
        5,
        9,
        15,
        8,
        11
      ],
      [
        10,
        7,
        10,
        4,
        8,
        12,
        6
      ]
    ],
    "settings": {
      "phi": 0.8,
      "alignment": 0.0,
      "parallelStyle": 0.0,
      "curviness": 1.0,
      "opacity": 0.7
    }
  },
  "layers": [
    {
      "type": "grid",
      "spacing": 30
    },
    {
      "type": "sankey-bars",
      "from": "tl",
      "to": "br"
    },
    {
      "type": "network"
    }
  ]
};
