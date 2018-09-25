function Mat4() {
  this.values = [
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
  ];
}

Mat4.prototype = {
  getValues: function() {
    return this.values;
  },
  setValues: function(values) {
    this.values = values;
  },
  get: function(col, row) {
    return this.values[col*4 + row];
  },
  set: function(col, row, value) {
    this.values[col*4 + row] = value;
  },
  multiply: function(m) {
    let res = new Mat4();
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let s = 0;
        for (let k = 0; k < 4; k++) {
          s += this.get(k, j) * m.get(i, k);
        }
        res.set(i, j, s);
      }
    }
    return res;
  },
  identity: function() {
    this.values = [
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    ];
  },
  translate: function(x, y, z) {
    this.set(0, 3, x);
    this.set(1, 3, y);
    this.set(2, 3, z);
  },
  rotateAroundZ: function(deg) {
    this.set(0, 0, Math.cos(deg));
    this.set(1, 0, Math.sin(deg));
    this.set(0, 1, -Math.sin(deg));
    this.set(1, 1, Math.cos(deg));
  },
  rotateAroundX: function(deg) {
    this.set(1, 1, Math.cos(deg));
    this.set(2, 1, -Math.sin(deg));
    this.set(1, 2, Math.sin(deg));
    this.set(2, 2, Math.cos(deg));
  },
  rotateAroundY: function(deg) {
    this.set(0, 0, Math.cos(deg));
    this.set(0, 2, -Math.sin(deg));
    this.set(2, 0, Math.sin(deg));
    this.set(2, 2, Math.cos(deg));
  },
  scale: function(x, y, z) {
    this.set(0, 0, x);
    this.set(1, 1, y);
    this.set(2, 2, z);
  },
  projection: function(n, f, t, b, l, r) {
    this.identity();
    this.set(0, 0, 2*n / (r - l));
    this.set(1, 1, 2*n / (t - b));
    this.set(2, 0, (r + l) / (r - l));
    this.set(2, 1, (t + b) / (t - b));
    this.set(2, 2, -(f + n) / (f - n));
    this.set(3, 2, -2*f*n / (f - n));
    this.set(2, 3, -1);
    this.set(3, 3, 0);
  },
  symmetricProjection: function(n, f, w, h) {
    this.identity();
    this.set(0, 0, 2*n / w);
    this.set(1, 1, 2*n / h);
    this.set(2, 2, -(f + n) / (f - n));
    this.set(3, 2, -2*f*n / (f - n));
    this.set(2, 3, -1);
    this.set(3, 3, 0);
  },
  simpleProjection: function(width, height) {
    //this.identity();
    let fov = Math.PI/2.0;
    let projRatio = width / height
    let nearZ = 0.01;
    let farZ = 100.0;
    let rangeZ = nearZ - farZ;
    let tanHalfFov = Math.tan(fov/2.0);

    this.set(0, 0, 1 / (tanHalfFov * projRatio));
    this.set(1, 1, 1 / tanHalfFov);
    this.set(2, 2, (-nearZ - farZ) / rangeZ);
    this.set(3, 2, 1);
    this.set(2, 3, 2 * farZ * nearZ / rangeZ);
    this.set(3, 3, 0);
  }
};
