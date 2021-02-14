
// vertices are listed in clockwise direction
import { move, rotate } from './shape.js'

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
        // [-2 * tL, 0],
        [-1.97 * tL, -0.03 * tL],
        [-0.03 * tL, -1.97 * tL],
        // [0, -2 * tL],
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
        // [0, -2 * tL],
        [0.03 * tL, -1.97 * tL],

        [1.97 * tL, -0.03 * tL],
        // [2 * tL, 0],
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
        // [0, 1 * tL],
        [-0.03 * tL, 0.97 * tL],
        [-0.97 * tL, 0.03 * tL],
        // [-1 * tL, 0],
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
        // [2 * tL, 0],
        [1.97 * tL, 0.03 * tL],
        [1.03 * tL, 0.97 * tL],
        // [1 * tL, 1 * tL]
        [1 * tL, 0.96 * tL],
        [1 * tL, 0.2 * tL],
      ],
      area: tL ** 2 / 2
    },
  ]

  let offset = [2 * tL, 2 * tL];

  // let moveArr = [
  //   [10+280, 10+570],
  //   [30+280, 10+570],
  //   [360+280, -90+570],
  //   [400+280, -90+570],
  //   [640+280, -170+570],
  //   [380+280, -90+570],
  //   [420+280, -90+570],
  // ];

  let moveArr = [
    [600+10, 300-10],
    [600+20, 300-10],
    [600, 300],
    [600+20, 300],
    [600+20, 310],
    [600+10, 300],
    [600+30, 300],
  ];

  ret.forEach(
    (obj, idx) => {
      // rotate(obj, 90, [0,0])
      move(obj, offset)
      obj.centroidOrig = obj.centroid;
      obj.orientationOrig = obj.orientation;
      move(obj, moveArr[idx])
    }
  );

  // rotate(ret[4] , -45)


  return ret;
}

