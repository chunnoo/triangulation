function Vec2(x, y) {
  this.x = x;
  this.y = y;
}

Vec2.prototype = {
  dot: function(v) {
    return this.x*v.x + this.y*v.y;
  }
}

function Vec3(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
}

Vec3.prototype = {
  dot: function(v) {
    return this.x*v.x + this.y*v.y + this.z*v.z;
  },
  cross: function(v) {
    return new Vec3(this.y*v.z - this.z*v.y, this.z*v.x - this.x*v.z, this.x*v.y - this.y*v.x);
  },
  sub: function(v) {
    return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
  },
  length: function() {
    return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
  },
  normalize: function() {
    l = this.length();
    return new Vec3(this.x / l, this.y / l, this.z / l);
  },
  getArray: function() {
    let arr = [this.x, this.y, this.z];
    return arr;
  },
  rotX: function(r) {
    let dy = this.y*Math.cos(r) - this.z*Math.sin(r);
    let dz = this.y*Math.sin(r) + this.z*Math.cos(r);
    this.y = dy;
    this.z = dz;
  },
  rotY: function(r) {
    let dx = this.x*Math.cos(r) - this.z*Math.sin(r);
    let dz = this.x*Math.sin(r) + this.z*Math.cos(r);
    this.x = dx;
    this.z = dz;
  }
}
