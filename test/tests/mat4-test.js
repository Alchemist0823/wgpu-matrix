/* global mat4 utils */

import {
  assertEqual,
  assertEqualApproximately,
  assertFalsy,
  assertIsArray,
  assertInstanceOf,
  assertStrictEqual,
  assertStrictNotEqual,
  assertTruthy,
} from '../assert.js';
import {describe, it, before} from '../mocha-support.js';

function check(Type) {
  describe('using ' + Type, () => {
    const m = [
       0,  1,  2,  3,
       4,  5,  6,  7,
       8,  9, 10, 11,
      12, 13, 14, 15,
    ];

    before(function() {
      mat4.setDefaultType(Type);
    });

    function testM4WithoutDest(func, expected) {
      const d = func();
      assertEqual(d, expected);
    }

    function testM4WithDest(func, expected) {
      expected = new Float32Array(expected);
      const d = new Float32Array(16);
      const c = func(d);
      assertStrictEqual(c, d);
      assertEqual(c, expected);
    }

    function testM4WithAndWithoutDest(func, expected) {
      if (Type === Float32Array) {
        expected = new Float32Array(expected);
      }
      testM4WithoutDest(func, expected);
      testM4WithDest(func, expected);
    }

    function testV3WithoutDest(func, expected) {
      const d = func();
      assertEqual(d, expected);
    }

    function testV3WithDest(func, expected) {
      const d = new Float32Array(3);
      const c = func(d);
      assertStrictEqual(c, d);
      assertEqual(c, expected);
    }

    function testV3WithAndWithoutDest(func, expected) {
      expected = new Float32Array(expected);
      testV3WithoutDest(func, expected);
      testV3WithDest(func, expected);
    }

    function shouldBeCloseArray(a, b, ...args) {
      const l = a.length;
      assertStrictEqual(l, b.length);
      try {
        for (let i = 0; i < l; ++i) {
          const v = a[i];
          assertEqualApproximately(v, b[i], ...args);
        }
      } catch (e) {
        throw new Error(`${e}\na: ${a}\nb: ${b}`);
      }
    }

    it('should create', () => {
      for (let i = 0; i <= 16; ++i) {
        const expected = mat4.clone(new Array(16).fill(0).map((_, ndx) => ndx < i ? ndx + 1 : 0));
        const args = new Array(Type === Array ? 16 : i).fill(0).map((_, ndx) => ndx < i ? ndx + 1 : 0);
        const m = mat4.create(...args);
        assertEqual(m, expected);
      }
    });

    it('should negate', () => {
      const expected = [
        -0,  -1,  -2,  -3,
        -4,  -5,  -6,  -7,
        -8,  -9, -10, -11,
       -12, -13, -14, -15,
      ];
      testM4WithAndWithoutDest((dst) => {
        return mat4.negate(m, dst);
      }, expected);
    });

    it('should copy', () => {
      const expected = m;
      testM4WithAndWithoutDest((dst) => {
        const result = mat4.copy(m, dst);
        assertStrictNotEqual(result, m);
        return result;
      }, expected);
    });

    it('should equals approximately', () => {
      const genAlmostEqualMat = i => new Array(16).fill(0).map((_, ndx) => ndx + (ndx === i ? 0 : utils.EPSILON * 0.5));
      const genNotAlmostEqualMat = i => new Array(16).fill(0).map((_, ndx) => ndx + (ndx === i ? 0 : 1.0001));

      for (let i = 0; i < 16; ++i) {
        assertTruthy(mat4.equalsApproximately(
          mat4.clone(genAlmostEqualMat(-1)),
          mat4.clone(genAlmostEqualMat(i))));
        assertFalsy(mat4.equalsApproximately(
          mat4.clone(genNotAlmostEqualMat(-1)),
          mat4.clone(genNotAlmostEqualMat(i))));
      }
    });

    it('should equals', () => {
      const genNotEqualMat = i => new Array(16).fill(0).map((_, ndx) => ndx + (ndx === i ? 0 : 1.0001));
      for (let i = 0; i < 16; ++i) {
        assertTruthy(mat4.equals(
          mat4.clone(genNotEqualMat(i)),
          mat4.clone(genNotEqualMat(i))));
        assertFalsy(mat4.equals(
          mat4.clone(genNotEqualMat(-1)),
          mat4.clone(genNotEqualMat(i))));
      }
    });

    it('should clone', () => {
      const expected = m;
      testM4WithAndWithoutDest((dst) => {
        const result = mat4.clone(m, dst);
        assertStrictNotEqual(result, m);
        return result;
      }, expected);
    });

    it('should make identity', () => {
      const expected = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ];
      testM4WithAndWithoutDest((dst) => {
        return mat4.identity(dst);
      }, expected);
    });

    it('should transpose', () => {
      const expected = [
        0, 4, 8, 12,
        1, 5, 9, 13,
        2, 6, 10, 14,
        3, 7, 11, 15,
      ];
      testM4WithAndWithoutDest((dst) => {
        return mat4.transpose(m, dst);
      }, expected);
    });

    function testMultiply(fn) {
      const m2 = [
        4, 5, 6, 7,
        1, 2, 3, 4,
        9, 10, 11, 12,
        -1, -2, -3, -4,
      ];
      const expected = [
        m2[0 * 4 + 0] * m[0 * 4 + 0] + m2[0 * 4 + 1] * m[1 * 4 + 0] + m2[0 * 4 + 2] * m[2 * 4 + 0] + m2[0 * 4 + 3] * m[3 * 4 + 0],
        m2[0 * 4 + 0] * m[0 * 4 + 1] + m2[0 * 4 + 1] * m[1 * 4 + 1] + m2[0 * 4 + 2] * m[2 * 4 + 1] + m2[0 * 4 + 3] * m[3 * 4 + 1],
        m2[0 * 4 + 0] * m[0 * 4 + 2] + m2[0 * 4 + 1] * m[1 * 4 + 2] + m2[0 * 4 + 2] * m[2 * 4 + 2] + m2[0 * 4 + 3] * m[3 * 4 + 2],
        m2[0 * 4 + 0] * m[0 * 4 + 3] + m2[0 * 4 + 1] * m[1 * 4 + 3] + m2[0 * 4 + 2] * m[2 * 4 + 3] + m2[0 * 4 + 3] * m[3 * 4 + 3],
        m2[1 * 4 + 0] * m[0 * 4 + 0] + m2[1 * 4 + 1] * m[1 * 4 + 0] + m2[1 * 4 + 2] * m[2 * 4 + 0] + m2[1 * 4 + 3] * m[3 * 4 + 0],
        m2[1 * 4 + 0] * m[0 * 4 + 1] + m2[1 * 4 + 1] * m[1 * 4 + 1] + m2[1 * 4 + 2] * m[2 * 4 + 1] + m2[1 * 4 + 3] * m[3 * 4 + 1],
        m2[1 * 4 + 0] * m[0 * 4 + 2] + m2[1 * 4 + 1] * m[1 * 4 + 2] + m2[1 * 4 + 2] * m[2 * 4 + 2] + m2[1 * 4 + 3] * m[3 * 4 + 2],
        m2[1 * 4 + 0] * m[0 * 4 + 3] + m2[1 * 4 + 1] * m[1 * 4 + 3] + m2[1 * 4 + 2] * m[2 * 4 + 3] + m2[1 * 4 + 3] * m[3 * 4 + 3],
        m2[2 * 4 + 0] * m[0 * 4 + 0] + m2[2 * 4 + 1] * m[1 * 4 + 0] + m2[2 * 4 + 2] * m[2 * 4 + 0] + m2[2 * 4 + 3] * m[3 * 4 + 0],
        m2[2 * 4 + 0] * m[0 * 4 + 1] + m2[2 * 4 + 1] * m[1 * 4 + 1] + m2[2 * 4 + 2] * m[2 * 4 + 1] + m2[2 * 4 + 3] * m[3 * 4 + 1],
        m2[2 * 4 + 0] * m[0 * 4 + 2] + m2[2 * 4 + 1] * m[1 * 4 + 2] + m2[2 * 4 + 2] * m[2 * 4 + 2] + m2[2 * 4 + 3] * m[3 * 4 + 2],
        m2[2 * 4 + 0] * m[0 * 4 + 3] + m2[2 * 4 + 1] * m[1 * 4 + 3] + m2[2 * 4 + 2] * m[2 * 4 + 3] + m2[2 * 4 + 3] * m[3 * 4 + 3],
        m2[3 * 4 + 0] * m[0 * 4 + 0] + m2[3 * 4 + 1] * m[1 * 4 + 0] + m2[3 * 4 + 2] * m[2 * 4 + 0] + m2[3 * 4 + 3] * m[3 * 4 + 0],
        m2[3 * 4 + 0] * m[0 * 4 + 1] + m2[3 * 4 + 1] * m[1 * 4 + 1] + m2[3 * 4 + 2] * m[2 * 4 + 1] + m2[3 * 4 + 3] * m[3 * 4 + 1],
        m2[3 * 4 + 0] * m[0 * 4 + 2] + m2[3 * 4 + 1] * m[1 * 4 + 2] + m2[3 * 4 + 2] * m[2 * 4 + 2] + m2[3 * 4 + 3] * m[3 * 4 + 2],
        m2[3 * 4 + 0] * m[0 * 4 + 3] + m2[3 * 4 + 1] * m[1 * 4 + 3] + m2[3 * 4 + 2] * m[2 * 4 + 3] + m2[3 * 4 + 3] * m[3 * 4 + 3],
      ];
      testM4WithAndWithoutDest((dst) => {
        return fn(m, m2, dst);
      }, expected);
    }

    it('should multiply', () => {
      testMultiply(mat4.multiply);
    });

    it('should mul', () => {
      testMultiply(mat4.mul);
    });

    function testInverse(fn) {
      const m = [
        2, 1, 3, 0,
        1, 2, 1, 0,
        3, 1, 2, 0,
        4, 5, 6, 1,
      ];
      const expected = [
        -0.375,
        -0.125,
        0.625,
        -0,
        -0.125,
        0.625,
        -0.125,
        -0,
        0.625,
        -0.125,
        -0.375,
        -0,
        -1.625,
        -1.875,
        0.375,
        1,
      ];
      testM4WithAndWithoutDest((dst) => {
        return fn(m, dst);
      }, expected);
    }

    it('should inverse', () => {
      testInverse(mat4.inverse);
    });

    it('should invert', () => {
      testInverse(mat4.invert);
    });

    it('should compute determinant', () => {
      function det(m) {
        const m00 = m[0 * 4 + 0];
        const m01 = m[0 * 4 + 1];
        const m02 = m[0 * 4 + 2];
        const m03 = m[0 * 4 + 3];
        const m10 = m[1 * 4 + 0];
        const m11 = m[1 * 4 + 1];
        const m12 = m[1 * 4 + 2];
        const m13 = m[1 * 4 + 3];
        const m20 = m[2 * 4 + 0];
        const m21 = m[2 * 4 + 1];
        const m22 = m[2 * 4 + 2];
        const m23 = m[2 * 4 + 3];
        const m30 = m[3 * 4 + 0];
        const m31 = m[3 * 4 + 1];
        const m32 = m[3 * 4 + 2];
        const m33 = m[3 * 4 + 3];

        return m03 * m12 * m21 * m30 - m02 * m13 * m21 * m30 - m03 * m11 * m22 * m30 + m01 * m13 * m22 * m30 +
               m02 * m11 * m23 * m30 - m01 * m12 * m23 * m30 - m03 * m12 * m20 * m31 + m02 * m13 * m20 * m31 +
               m03 * m10 * m22 * m31 - m00 * m13 * m22 * m31 - m02 * m10 * m23 * m31 + m00 * m12 * m23 * m31 +
               m03 * m11 * m20 * m32 - m01 * m13 * m20 * m32 - m03 * m10 * m21 * m32 + m00 * m13 * m21 * m32 +
               m01 * m10 * m23 * m32 - m00 * m11 * m23 * m32 - m02 * m11 * m20 * m33 + m01 * m12 * m20 * m33 +
               m02 * m10 * m21 * m33 - m00 * m12 * m21 * m33 - m01 * m10 * m22 * m33 + m00 * m11 * m22 * m33;
      }

      [
        [
          2, 1, 3, 0,
          1, 2, 1, 0,
          3, 1, 2, 0,
          4, 5, 6, 1,
        ],
        [
          2, 0, 0, 0,
          0, 3, 0, 0,
          0, 0, 4, 0,
          5, 6, 7, 1,
        ],
        mat4.perspective(0.3, 2, 0.1, 100),
        mat4.ortho(-10, -2, 10, 40, 0.1, 100),
      ].forEach(v => {
        const m = mat4.clone(v);
        assertEqual(mat4.determinant(m), det(m));
      });
    });

    it('should set translation', () => {
      const expected = [
        0,  1,  2,  3,
        4,  5,  6,  7,
        8,  9, 10, 11,
       11, 22, 33, 1,
      ];
      testM4WithAndWithoutDest((dst) => {
        return mat4.setTranslation(m, [11, 22, 33], dst);
      }, expected);
    });

    it('should get translation', () => {
      const expected = [12, 13, 14];
      testV3WithAndWithoutDest((dst) => {
        return mat4.getTranslation(m, dst);
      }, expected);
    });

    it('should get axis', () => {
      [
        [0, 1, 2],
        [4, 5, 6],
        [8, 9, 10],
      ].forEach((expected, ndx) => {
        testV3WithAndWithoutDest((dst) => {
          return mat4.getAxis(m, ndx, dst);
        }, expected);
      });
    });

    it('should set axis', () => {
      [
        [
          11, 22, 33,  3,
           4,  5,  6,  7,
           8,  9, 10, 11,
          12, 13, 14, 15,
        ],
        [
           0,  1,  2,  3,
          11, 22, 33,  7,
           8,  9, 10, 11,
          12, 13, 14, 15,
        ],
        [
           0,  1,  2,  3,
           4,  5,  6,  7,
          11, 22, 33, 11,
          12, 13, 14, 15,
        ],
      ].forEach((expected, ndx) => {
        testM4WithAndWithoutDest((dst) => {
          return mat4.setAxis(m, [11, 22, 33], ndx, dst);
        }, expected);
      });
    });

    it('should get scaling', () => {
      const m = [
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16,
      ];
      const expected = [
        Math.sqrt(1 * 1 + 2 * 2 + 3 * 3),
        Math.sqrt(5 * 5 + 6 * 6 + 7 * 7),
        Math.sqrt(9 * 9 + 10 * 10 + 11 * 11),
      ];
      testV3WithAndWithoutDest((dst) => {
        return mat4.getScaling(m, dst);
      }, expected);
    });

    it('should compute perspective', () => {
      const fov = 2;
      const aspect = 4;
      const zNear = 10;
      const zFar = 30;
      const f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
      const rangeInv = 1.0 / (zNear - zFar);
      const expected = [
        f / aspect,
        0,
        0,
        0,

        0,
        f,
        0,
        0,

        0,
        0,
        zFar * rangeInv,
        -1,

        0,
        0,
        zNear * zFar * rangeInv,
        0,
      ];
      testM4WithAndWithoutDest((dst) => {
        return mat4.perspective(fov, aspect, zNear, zFar, dst);
      }, expected);
    });

    it('should compute correct perspective', () => {
      const fov = Math.PI / 4;
      const aspect = 2;
      const zNear = 0.1;
      const zFar = 10.0;
      const m = mat4.perspective(fov, aspect, zNear, zFar);
      shouldBeCloseArray(mat4.transformPoint(m, [0, 0, -zNear]), [0, 0, 0], 0.000001);
      shouldBeCloseArray(mat4.transformPoint(m, [0, 0, -zFar]), [0, 0, 1], 0.000001);
    });

    it('should compute ortho', () => {
      const left = 2;
      const right = 4;
      const top = 10;
      const bottom = 30;
      const near = 15;
      const far = 25;
      const expected = [
        2 / (right - left),
        0,
        0,
        0,

        0,
        2 / (top - bottom),
        0,
        0,

        0,
        0,
        1 / (near - far),
        0,

        (right + left) / (left - right),
        (top + bottom) / (bottom - top),
        near / (near - far),
        1,
      ];
      testM4WithAndWithoutDest((dst) => {
        return mat4.ortho(left, right, bottom, top, near, far, dst);
      }, expected);
    });

    it('should compute correct ortho', () => {
      const left = -2;
      const right = 4;
      const top = 10;
      const bottom = 30;
      const near = 15;
      const far = 25;
      const m = mat4.ortho(left, right, bottom, top, near, far);
      shouldBeCloseArray(mat4.transformPoint(m, [left, bottom, -near]), [-1, -1, 0], 0.000001);
      shouldBeCloseArray(mat4.transformPoint(m, [right, top, -far]), [1, 1, 1], 0.000001);
    });

    it('should compute frustum', () => {
      const left = 2;
      const right = 4;
      const top = 10;
      const bottom = 30;
      const near = 15;
      const far = 25;

      const dx = (right - left);
      const dy = (top - bottom);
      const dz = (near - far);

      const expected = [
        2 * near / dx,
        0,
        0,
        0,
        0,
        2 * near / dy,
        0,
        0,
        (left + right) / dx,
        (top + bottom) / dy,
        far / dz,
        -1,
        0,
        0,
        near * far / dz,
        0,
      ];
      testM4WithAndWithoutDest((dst) => {
        return mat4.frustum(left, right, bottom, top, near, far, dst);
      }, expected);
    });

    it('should compute correct frustum', () => {
      const left = -2;
      const right = 4;
      const top = 10;
      const bottom = 30;
      const near = 15;
      const far = 25;
      const m = mat4.frustum(left, right, bottom, top, near, far);
      shouldBeCloseArray(mat4.transformPoint(m, [left, bottom, -near]), [-1, -1, 0], 0.000001);
      const centerX = (left + right) * 0.5;
      const centerY = (top + bottom) * 0.5;
      const p = mat4.transformPoint(m, [centerX, centerY, -far]);
      //shouldBeCloseArray(p, [1, 1, 1], 0.000001);
      assertEqualApproximately(p[2], 1);
    });

    it('should compute same frustum as perspective', () => {
      const lr = 4;
      const tb = 2;
      const near = 10;
      const far = 20;
      const m1 = mat4.frustum(-lr, lr, -tb, tb, near, far);
      const fov = Math.atan(tb / near) * 2;
      const aspect = lr / tb;
      const m2 = mat4.perspective(fov, aspect, near, far);
      shouldBeCloseArray(m1, m2);
    });

    it('should make lookAt matrix', () => {
      const eye = [1, 2, 3];
      const target = [11, 22, 33];
      const up = [-4, -5, -6];
      const expected = [
        0.40824833512306213,
        -0.8164966106414795,
        0.40824824571609497,
        0,
        -0.8728715181350708,
        -0.21821792423725128,
        0.4364357888698578,
        0,
        -0.26726123690605164,
        -0.5345224738121033,
        -0.8017837405204773,
        0,
        1,
        2,
        3,
        1,
      ];
      testM4WithAndWithoutDest((dst) => {
        return mat4.lookAt(eye, target, up, dst);
      }, expected);
    });

    it('should make translation matrix', () => {
      const expected = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        2, 3, 4, 1,
      ];
      testM4WithAndWithoutDest((dst) => {
        return mat4.translation([2, 3, 4], dst);
      }, expected);
    });

    it('should translate', () => {
      const expected = [
        0,  1,  2,  3,
        4,  5,  6,  7,
        8,  9, 10, 11,
       12 + 0 * 2 + 4 * 3 + 8 * 4,
       13 + 1 * 2 + 5 * 3 + 9 * 4,
       14 + 2 * 2 + 6 * 3 + 10 * 4,
       15 + 3 * 2 + 7 * 3 + 11 * 4,
      ];
      testM4WithAndWithoutDest((dst) => {
        return mat4.translate(m, [2, 3, 4], dst);
      }, expected);
    });

    it('should make x rotation matrix', () => {
      const angle = 1.23;
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const expected = [
        1,  0, 0, 0,
        0,  c, s, 0,
        0, -s, c, 0,
        0,  0, 0, 1,
      ];
      testM4WithAndWithoutDest((dst) => {
        return mat4.rotationX(angle, dst);
      }, expected);
    });

    it('should rotate x', () => {
      const angle = 1.23;
      // switch to Array type to keep precision high for expected
      const oldType = mat4.setDefaultType(Array);
      const expected = mat4.multiply(m, mat4.rotationX(angle));
      mat4.setDefaultType(oldType);

      testM4WithAndWithoutDest((dst) => {
        return mat4.rotateX(m, angle, dst);
      }, expected);
    });

    it('should make y rotation matrix', () => {
      const angle = 1.23;
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const expected = [
        c, 0, -s, 0,
        0, 1,  0, 0,
        s, 0,  c, 0,
        0, 0,  0, 1,
      ];
      testM4WithAndWithoutDest((dst) => {
        return mat4.rotationY(angle, dst);
      }, expected);
    });

    it('should rotate y', () => {
      const angle = 1.23;
      // switch to Array type to keep precision high for expected
      const oldType = mat4.setDefaultType(Array);
      const expected = mat4.multiply(m, mat4.rotationY(angle));
      mat4.setDefaultType(oldType);

      testM4WithAndWithoutDest((dst) => {
        return mat4.rotateY(m, angle, dst);
      }, expected);
    });

    it('should make z rotation matrix', () => {
      const angle = 1.23;
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const expected = [
        c, s, 0, 0,
       -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ];
      testM4WithAndWithoutDest((dst) => {
        return mat4.rotationZ(angle, dst);
      }, expected);
    });

    it('should rotate z', () => {
      const angle = 1.23;
      // switch to Array type to keep precision high for expected
      const oldType = mat4.setDefaultType(Array);
      const expected = mat4.multiply(m, mat4.rotationZ(angle));
      mat4.setDefaultType(oldType);

      testM4WithAndWithoutDest((dst) => {
        return mat4.rotateZ(m, angle, dst);
      }, expected);
    });

    it('should make axis rotation matrix', () => {
      const axis = [0.5, 0.6, -0.7];
      const angle = 1.23;
      let x = axis[0];
      let y = axis[1];
      let z = axis[2];
      const n = Math.sqrt(x * x + y * y + z * z);
      x /= n;
      y /= n;
      z /= n;
      const xx = x * x;
      const yy = y * y;
      const zz = z * z;
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const oneMinusCosine = 1 - c;
      const expected = [
        xx + (1 - xx) * c,
        x * y * oneMinusCosine + z * s,
        x * z * oneMinusCosine - y * s,
        0,

        x * y * oneMinusCosine - z * s,
        yy + (1 - yy) * c,
        y * z * oneMinusCosine + x * s,
        0,

        x * z * oneMinusCosine + y * s,
        y * z * oneMinusCosine - x * s,
        zz + (1 - zz) * c,
        0,

        0, 0, 0, 1,
      ];
      testM4WithAndWithoutDest((dst) => {
        return mat4.axisRotation(axis, angle, dst);
      }, expected);
    });

    it('should axis rotate', () => {
      const axis = [0.5, 0.6, -0.7];
      const angle = 1.23;
      // switch to Array type to keep precision high for expected
      const oldType = mat4.setDefaultType(Array);
      const expected = mat4.multiply(m, mat4.axisRotation(axis, angle));
      mat4.setDefaultType(oldType);

      testM4WithAndWithoutDest((dst) => {
        return mat4.axisRotate(m, axis, angle, dst);
      }, expected);
    });

    it('should make scaling matrix', () => {
      const expected = [
        2, 0, 0, 0,
        0, 3, 0, 0,
        0, 0, 4, 0,
        0, 0, 0, 1,
      ];
      testM4WithAndWithoutDest((dst) => {
        return mat4.scaling([2, 3, 4], dst);
      }, expected);
    });

    it('should scale', () => {
      const expected = [
         0,  2,  4,  6,
        12, 15, 18, 21,
        32, 36, 40, 44,
        12, 13, 14, 15,
      ];
      testM4WithAndWithoutDest((dst) => {
        return mat4.scale(m, [2, 3, 4], dst);
      }, expected);
    });

    it('should transform point', () => {
      const v0 = 2;
      const v1 = 3;
      const v2 = 4;
      const d = v0 * m[0 * 4 + 3] + v1 * m[1 * 4 + 3] + v2 * m[2 * 4 + 3] + m[3 * 4 + 3];
      const expected = [
        (v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0] + m[3 * 4 + 0]) / d,
        (v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1] + m[3 * 4 + 1]) / d,
        (v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2] + m[3 * 4 + 2]) / d,
      ];
      testV3WithAndWithoutDest((dst) => {
        return mat4.transformPoint(m, [2, 3, 4], dst);
      }, expected);
    });

    it('should transform direction', () => {
      const v0 = 2;
      const v1 = 3;
      const v2 = 4;
      const expected = [
        v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0],
        v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1],
        v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2],
      ];
      testV3WithAndWithoutDest((dst) => {
        return mat4.transformDirection(m, [2, 3, 4], dst);
      }, expected);
    });

    it('should transform normal', () => {
      const m  = mat4.translate(mat4.scaling([0.1, 0.2, 0.3]), [1, 2, 3]);
      const mi = mat4.inverse(m);
      const v0 = 2;
      const v1 = 3;
      const v2 = 4;
      const expected = [
        v0 * mi[0 * 4 + 0] + v1 * mi[0 * 4 + 1] + v2 * mi[0 * 4 + 2],
        v0 * mi[1 * 4 + 0] + v1 * mi[1 * 4 + 1] + v2 * mi[1 * 4 + 2],
        v0 * mi[2 * 4 + 0] + v1 * mi[2 * 4 + 1] + v2 * mi[2 * 4 + 2],
      ];
      testV3WithAndWithoutDest((dst) => {
        return mat4.transformNormal(m, [2, 3, 4], dst);
      }, expected);
    });

  });
}

describe('mat4', () => {

  it('should set default type', () => {
    mat4.setDefaultType(Array);
    let d = mat4.identity();
    assertIsArray(d);
    mat4.setDefaultType(Float32Array);
    d = mat4.identity();
    assertInstanceOf(d, Float32Array);
  });

  check(Array);
  check(Float32Array);
  check(Float64Array);
});

