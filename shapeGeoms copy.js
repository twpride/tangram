
// vertices are listed in clockwise direction
export const shapeGeoms = (tL) => {
  const ret = [
    {
      type: 1,
      centroid: [-2 / 3 * tL, -2 / 3 * tL],
      orientation: 180,
      flipped: false,
      vertices: [
        // [0, -0.04 * tL],
        [0, 0],
        // [-0.04 * tL, 0],
        [-1 * tL, 0],
        [-1.96 * tL, 0],
        [-2 * tL, 0],
        [-1.97 * tL, -0.03 * tL],
        [-0.03 * tL, -1.97 * tL],
        [0, -2 * tL],
        [0, -1.96 * tL],
        [0, -1 * tL],
      ],
      area: (2 * tL) ** 2 / 2
    },
    {
      type: 1,
      centroid: [2 / 3 * tL, -2 / 3 * tL],
      orientation: -90,
      flipped: false,
      vertices: [
        // [0.04 * tL, 0],
        [0, 0],
        // [0, -0.04 * tL],
        // [0, -1 * tL],
        [0, -1.96 * tL],
        [0, -2 * tL],
        [0.03 * tL, -1.97 * tL],

        [1.97 * tL, -0.03 * tL],
        [2 * tL, 0],
        [1.96 * tL, 0],
        // [1 * tL, 0],
      ],
      area: (2 * tL) ** 2 / 2
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
        [0, 1 * tL],
        [-0.04 * tL, 1 * tL],

        // [-0.97 * tL, 1 * tL],
        [-1 * tL, 1 * tL],
        // [-1.02 * tL, 0.98 * tL],

        [-1.5 * tL, 0.5 * tL],
        [-1.97 * tL, 0.03 * tL],
        [-2 * tL, 0],
        [-1.96 * tL, 0],
      ],
      area: tL ** 2
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
      ],
      area: tL ** 2
    },

    {
      type: 4,
      centroid: [0, 4 / 3 * tL],
      orientation: -135,
      flipped: false,
      vertices: [
        [0.96 * tL, 1 * tL],
        [1 * tL, 1 * tL],
        [0.97 * tL, 1.03 * tL],

        [0.5 * tL, 1.5 * tL],
        // [0.02 * tL, 1.96 * tL],
        [0, 2 * tL],
        // [-0.02 * tL, 1.96 * tL],
        [-0.5 * tL, 1.5 * tL],

        [-0.97 * tL, 1.03 * tL],
        [-1 * tL, 1 * tL],
        [-0.96 * tL, 1 * tL]
      ],
      area: tL ** 2
    },
    {
      type: 5,
      centroid: [-1 / 3 * tL, 1 / 3 * tL],
      orientation: 90,
      flipped: false,
      vertices: [
        // [-0.04 * tL, 0],
        [0, 0],
        // [0, 0.04 * tL],
        [0, 0.7 * tL],
        [0, 0.96 * tL],
        [0, 1 * tL],
        [-0.03 * tL, 0.97 * tL],
        [-0.97 * tL, 0.03 * tL],
        [-1 * tL, 0],
        [-0.96 * tL, 0],
        [-0.4 * tL, 0],
      ],
      area: tL ** 2 / 2
    },

    {
      type: 5,
      centroid: [4 / 3 * tL, 1 / 3 * tL],
      orientation: 0,
      flipped: false,
      vertices: [
        // [1 * tL, 0.04 * tL],
        // [1.04 * tL, 0],
        [1 * tL, 0],
        [1.5 * tL, 0],
        [1.96 * tL, 0],
        [2 * tL, 0],
        [1.97 * tL, 0.03 * tL],
        [1.03 * tL, 0.97 * tL],
        [1 * tL, 1 * tL],
        [1 * tL, 0.96 * tL],
        [1 * tL, 0.2 * tL],
      ],
      area: tL ** 2 / 2
    },
  ]
  ret.forEach(
    obj => {
      console.log(obj)
      obj.vertices = obj.vertices.map(ele => [ele[0] + 2 * tL, ele[1] + 2 * tL])
      obj.centroid = [obj.centroid[0] + 2 * tL, obj.centroid[1] + 2 * tL];

      obj.centroidOrig = obj.centroid;
      obj.orientationOrig = obj.orientation;
    }
  );
  return ret;
}