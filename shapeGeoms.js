export const tL = 100;

// vertices are listed in clockwise direction
export const shapeGeoms = [
  {
    type: 1,
    centroid: [-0.667 * tL, -0.667 * tL],
    orientation: 180,
    flipped: false,
    vertices: [
      // [0, -0.04 * tL],
      [0, 0],
      // [-0.04 * tL, 0],
      [-1 * tL, 0],
      [-1.96 * tL, 0],
      // [-2 * tL, 0],
      [-1.97 * tL, -0.03 * tL],
      [-0.03 * tL, -1.97 * tL],
      // [0, -2 * tL],
      [0, -1.96 * tL],
      [0, -1 * tL],
    ],
  },
  {
    type: 1,
    centroid: [0.667 * tL, -0.667 * tL],
    orientation: -90,
    flipped: false,
    vertices: [
      // [0.04 * tL, 0],
      [0, 0],
      // [0, -0.04 * tL],
      // [0, -1 * tL],
      [0, -1.96 * tL],
      // [0, -2 * tL],
      [0.03 * tL, -1.97 * tL],

      [1.97 * tL, -0.03 * tL],
      // [2 * tL, 0],
      [1.96 * tL, 0],
      // [1 * tL, 0],
    ],
  },
  {
    type: 2,
    centroid: [-1 * tL, 0.5 * tL],
    orientation: 0,
    flipped: false,
    vertices: [
      // [-1.03 * tL, 0],
      [-1 * tL, 0],
      // [-0.98 * tL, 0.02 * tL],

      // [-0.5 * tL, 0.5 * tL],

      [-0.03 * tL, 0.97 * tL],
      // [0, 1 * tL],
      [-0.04 * tL, 1 * tL],

      // [-0.97 * tL, 1 * tL],
      [-1 * tL, 1 * tL],
      // [-1.02 * tL, 0.98 * tL],

      [-1.5 * tL, 0.5 * tL],
      [-1.97 * tL, 0.03 * tL],
      // [-2 * tL, 0],
      [-1.96 * tL, 0],
    ],
  },

  {
    type: 3,
    centroid: [0.5 * tL, 0.5 * tL],
    orientation: 0,
    flipped: false,
    vertices: [
      // [0, 0.04 * tL],
      [0, 0],
      // [0.04 * tL, 0],
      // [0.96 * tL, 0],
      [1 * tL, 0],
      // [1 * tL, 0.04 * tL],
      // [1 * tL, 0.96 * tL],
      [1 * tL, 1 * tL],
      // [0.96 * tL, 1 * tL],
      // [0.04 * tL, 1 * tL],
      [0, 1 * tL],
      // [0, 0.96 * tL]
    ]

  },

  {
    type: 4,
    centroid: [0, 1.333 * tL],
    orientation: -135,
    flipped: false,
    vertices: [
      [0.96 * tL, 1 * tL],
      // [1 * tL, 1 * tL],
      [0.97 * tL, 1.03 * tL],

      [0.5 * tL, 1.5 * tL],
      // [0.02 * tL, 1.96 * tL],
      [0, 2 * tL],
      // [-0.02 * tL, 1.96 * tL],
      [-0.5 * tL, 1.5 * tL],

      [-0.97 * tL, 1.03 * tL],
      // [-1 * tL, 1 * tL],
      [-0.96 * tL, 1 * tL]
    ]

  },
  {
    type: 5,
    centroid: [-0.333 * tL, 0.333 * tL],
    orientation: 90,
    flipped: false,
    vertices: [
      // [-0.04 * tL, 0],
      [0, 0],
      // [0, 0.04 * tL],
      [0, 0.7 * tL],
      [0, 0.96 * tL],
      // [0, 1 * tL],
      [-0.03 * tL, 0.97 * tL],
      [-0.97 * tL, 0.03 * tL],
      // [-1 * tL, 0],
      [-0.96 * tL, 0],
      [-0.4 * tL, 0],
    ]
  },
  {
    type: 5,
    centroid: [1.333 * tL, 0.333 * tL],
    orientation: 0,
    flipped: false,
    vertices: [
      // [1 * tL, 0.04 * tL],
      // [1.04 * tL, 0],
      [1 * tL, 0],
      [1.5 * tL, 0],
      [1.96 * tL, 0],
      // [2 * tL, 0],
      [1.97 * tL, 0.03 * tL],
      [1.03 * tL, 0.97 * tL],
      // [1 * tL, 1 * tL]
      [1 * tL, 0.96 * tL],
      [1 * tL, 0.2 * tL],
    ]
  },
]