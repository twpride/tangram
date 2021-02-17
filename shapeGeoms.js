
// vertices are listed in clockwise direction
import { move, rotate } from './shape.js'

export const shapeGeoms = (tL) => {
  const ret = [
    {
      type: 1,
      centroid: [-2 / 3 * tL, -2 / 3 * tL],
      orientation: 180,
      vertices: [
        [0, 0],

        [-1.96 * tL, 0],
        // [-2 * tL, 0],
        [-1.97 * tL, -0.03 * tL],

        [-0.03 * tL, -1.97 * tL],
        // [0, -2 * tL],
        [0, -1.96 * tL],
      ],
      area: (2 * tL) ** 2 / 2
    },
    {
      type: 1,
      centroid: [2 / 3 * tL, -2 / 3 * tL],
      orientation: -90,
      vertices: [
        [0, 0],

        [0, -1.96 * tL],
        // [0, -2 * tL],
        [0.03 * tL, -1.97 * tL],

        [1.97 * tL, -0.03 * tL],
        // [2 * tL, 0],
        [1.96 * tL, 0],
      ],
      area: (2 * tL) ** 2 / 2
    },
    {
      type: 2,  // pgram
      centroid: [-1 * tL, 0.5 * tL],
      orientation: 0,
      flipped: false,
      vertices: [
        [-1 * tL, 0],


        [-0.03 * tL, 0.97 * tL],
        // [0, 1 * tL],
        [-0.04 * tL, 1 * tL],

        [-1 * tL, 1 * tL],

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
      vertices: [
        [0, 0],
        [1 * tL, 0],
        [1 * tL, 1 * tL],
        [0, 1 * tL],
      ],
      area: tL ** 2
    },

    {
      type: 4, // mid tri
      centroid: [0, 4 / 3 * tL],
      orientation: -135,
      vertices: [
        [0.96 * tL, 1 * tL],
        // [1 * tL, 1 * tL],
        [0.97 * tL, 1.03 * tL],

        [0, 2 * tL],

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
      vertices: [
        [0, 0],

        [0, 0.96 * tL],
        // [0, 1 * tL],
        [-0.03 * tL, 0.97 * tL],

        [-0.97 * tL, 0.03 * tL],
        // [-1 * tL, 0],
        [-0.96 * tL, 0],
      ],
      area: tL ** 2 / 2
    },

    {
      type: 5,
      centroid: [4 / 3 * tL, 1 / 3 * tL],
      orientation: 0,
      vertices: [
        [1 * tL, 0],

        [1.96 * tL, 0],
        // [2 * tL, 0],
        [1.97 * tL, 0.03 * tL],

        [1.03 * tL, 0.97 * tL],
        // [1 * tL, 1 * tL]
        [1 * tL, 0.96 * tL],
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
    [6*tL+0.1*tL, 3*tL-0.1*tL],
    [6*tL+0.1*tL, 3*tL-0.1*tL],
    [6*tL+0.1*tL, 3*tL-0.1*tL],
    [6*tL+0.1*tL, 3*tL-0.1*tL],
    [6*tL+0.1*tL, 3*tL-0.1*tL],
    [6*tL+0.1*tL, 3*tL-0.1*tL],
    [6*tL+0.1*tL, 3*tL-0.1*tL],
  ];

  ret.forEach(
    (obj, idx) => {
      rotate(obj, 90, [0,0])
      // move(obj, offset)
      obj.centroidOrig = obj.centroid;
      obj.orientationOrig = obj.orientation;
      // obj.centroidOrig = obj.centroid;
      // obj.orientationOrig = obj.orientation;
      // move(obj, moveArr[idx])
    }
  );

  // rotate(ret[4] , -45)


  return ret;
}

