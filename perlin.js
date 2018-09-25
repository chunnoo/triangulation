function Perlin(width, height) {
  this.width = width;
  this.height = height;

  this.grid = [];
  for (let i = 0; i < this.height; i++) {
    let row = [];
    for (let j = 0; j < this.width; j++) {
      let r = Math.random()*Math.PI*2;
      let v = new Vec2(Math.cos(r), Math.sin(r));
      row.push(v);
    }
    this.grid.push(row);
  }
}

Perlin.prototype = {
  clamp: function(a, b, x) {
    return Math.max(a, Math.min(b, x));
  },
  smoothstep: function(a, b, c) {
    let x = this.clamp((c - a) / (b - a), 0.0, 1.0);
    return x * x * (3 - 2 * x);
  },
  interpolate: function(a, b, w) {
    return a + this.smoothstep(0.0, 1.0, w) * (b - a);
  },
  dotGridGradient: function(ix, iy, gx, gy) {
    let d = new Vec2(gx - ix, gy - iy);
    return d.dot(this.grid[iy][ix]);
  },
  get: function(x, y) {
    let gx = x*(this.width - 1.0);
    let gy = y*(this.height - 1.0);
    let ix = Math.floor(gx);
    let iy = Math.floor(gy);
    let sx = gx - ix;
    let sy = gy - iy;

    let n0 = this.dotGridGradient(ix, iy, gx, gy);
    let n1 = this.dotGridGradient(ix + 1, iy, gx, gy);
    let ix0 = this.interpolate(n0, n1, sx);
    n0 = this.dotGridGradient(ix, iy + 1, gx, gy);
    n1 = this.dotGridGradient(ix + 1, iy + 1, gx, gy);
    let ix1 = this.interpolate(n0, n1, sx);

    return (this.interpolate(ix0, ix1, sy) / Math.SQRT2) + 0.5;
  }
}
