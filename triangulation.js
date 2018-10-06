function Edge(p, q) {
  this.p = p;
  this.q = q;
  this.equal = function(e) {
    return (this.p == e.p && this.q == e.q) || (this.p == e.q && this.q == e.p);
  }
}

function Triangle(p0, p1, p2) {
  this.ps = [p0, p1, p2];
  this.getEdge = function(i) {
    return new Edge(this.ps[i], this.ps[(i+1)%3]);
  };
  this.equal = function(t) {
    let e = true;
    for (let i = 0; i < 3; i++) {
      let ex = false;
      for (let j = 0; j < 3; j++) {
        if (this.ps[i] == t.ps[j]) {
          ex = true;
        }
      }
      if (!ex) {
        e = false;
      }
    }
    return e;
  };
  this.contains = function(p) {
    let c = false;
    for (let i = 0; i < 3; i++) {
      if (this.ps[i] == p) {
        c = true;
      }
    }
    return c;
  };
  this.containsRange = function(s, e) {
    let c = false;
    for (let i = s; i <= e; i++) {
      if (this.contains(i)) {
        c = true;
      }
    }
    return c;
  };
  this.reverse = function() {
    this.ps.reverse();
  };
  this.shareEdge = function(t) {
    let share = false;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.getEdge(i).equal(t.getEdge(j))) {
          share = true;
        }
      }
    }
    return share;
  };
}

function Polygon() {
  this.es = [];
  this.addEdge = function(e) {
    this.es.push(e);
  };
}

function Triangulation() {
  this.vs = [];
  this.triangulation = [];
  this.graph = [];
  this.graphValues = [];
}

Triangulation.prototype = {
  getVertices: function() {
    let vertices = [];
    for (let i = 0; i < this.triangulation.length; i++) {
      for (let j = 0; j < 3; j++) {
        vertices.push(this.vs[this.triangulation[i].ps[j]]);
      }
    }
    return vertices;
  },
  getGraphValues: function() {
    let values = [];
    for (let i = 0; i < this.triangulation.length; i++) {
      for (let j = 0; j < 3; j++) {
        values.push(this.graphValues[this.triangulation[i].ps[j]]);
      }
    }
    return values;
  },
  generateRandomVertices: function(n, d) {
    while (this.vs.length < n) {
      let v = new Vec3(2.0*Math.random() - 1.0, 2.0*Math.random() - 1.0, 0.15*Math.random());
      let valid = true;
      for (let i = 0; i < this.vs.length; i++) {
        if (v.xyDist(this.vs[i]) < d) {
          valid = false;
        }
      }
      if (valid) {
        this.vs.push(v);
      }
    }
  },
  generateVertices: function(n, d) {
    this.vs.push(new Vec3(-1.0, -1.0, 0.0));
    this.vs.push(new Vec3(1.0, -1.0, 0.0));
    this.vs.push(new Vec3(-1.0, 1.0, 0.0));
    this.vs.push(new Vec3(0.5, -1.0, 0.0));
    this.vs.push(new Vec3(-1.0, 0.5, 0.0));
    this.vs.push(new Vec3(-0.5, -1.0, 0.0));
    this.vs.push(new Vec3(-1.0, -0.5, 0.0));
    this.vs.push(new Vec3(0.0, -1.0, 0.0));
    this.vs.push(new Vec3(-1.0, 0.0, 0.0));
    this.vs.push(new Vec3(0.25, -1.0, 0.0));
    this.vs.push(new Vec3(-1.0, 0.25, 0.0));
    this.vs.push(new Vec3(-0.25, -1.0, 0.0));
    this.vs.push(new Vec3(-1.0, -0.25, 0.0));
    this.vs.push(new Vec3(0.75, -1.0, 0.0));
    this.vs.push(new Vec3(-1.0, 0.75, 0.0));
    this.vs.push(new Vec3(-0.75, -1.0, 0.0));
    this.vs.push(new Vec3(-1.0, -0.75, 0.0));
    while (this.vs.length < n) {
      let y = 2.0*Math.random() - 1.0;
      let x = Math.sqrt(2)*Math.sqrt(-y + 1.0)*Math.random() - 1.0;
      let v = new Vec3(x + 0.1*Math.random(), y + 0.1*Math.random(), 0.15*Math.random());
      let valid = true;
      for (let i = 0; i < this.vs.length; i++) {
        if (v.xyDist(this.vs[i]) < d) {
          valid = false;
        }
      }
      if (valid) {
        this.vs.push(v);
      }
    }
  },
  generatePentagonVertices: function() {
    this.vs.push(new Vec3(-0.5, -0.5, 0.0));
    this.vs.push(new Vec3(0.5, -0.5, 0.0));
    this.vs.push(new Vec3(0.75, 0.0, 0.0));
    this.vs.push(new Vec3(0.0, 0.5, 0.0));
    this.vs.push(new Vec3(-0.75, 0.0, 0.0));
  },
  generateSquareVertices: function() {
    this.vs.push(new Vec3(-0.5, -0.5, 0.0));
    this.vs.push(new Vec3(0.5, -0.5, 0.0));
    this.vs.push(new Vec3(0.5, 0.5, 0.0));
    this.vs.push(new Vec3(-0.5, 0.5, 0.0));
  },
  insideCircumcircle: function(t, p) {
    let a = this.vs[t.ps[0]].x - this.vs[p].x;
    let b = this.vs[t.ps[0]].y - this.vs[p].y;
    let c = Math.pow(this.vs[t.ps[0]].x - this.vs[p].x, 2) + Math.pow(this.vs[t.ps[0]].y - this.vs[p].y, 2);
    let d = this.vs[t.ps[1]].x - this.vs[p].x;
    let e = this.vs[t.ps[1]].y - this.vs[p].y;
    let f = Math.pow(this.vs[t.ps[1]].x - this.vs[p].x, 2) + Math.pow(this.vs[t.ps[1]].y - this.vs[p].y, 2);
    let g = this.vs[t.ps[2]].x - this.vs[p].x;
    let h = this.vs[t.ps[2]].y - this.vs[p].y;
    let i = Math.pow(this.vs[t.ps[2]].x - this.vs[p].x, 2) + Math.pow(this.vs[t.ps[2]].y - this.vs[p].y, 2);
    return a*e*i + b*f*g + c*d*h - c*e*g - b*d*i - a*f*h > 0;
  },
  correctOrientation: function(t) {
    let a = this.vs[t.ps[0]].x;
    let b = this.vs[t.ps[0]].y;
    let c = 1;
    let d = this.vs[t.ps[1]].x;
    let e = this.vs[t.ps[1]].y;
    let f = 1;
    let g = this.vs[t.ps[2]].x;
    let h = this.vs[t.ps[2]].y;
    let i = 1;
    if (a*e*i + b*f*g + c*d*h - c*e*g - b*d*i - a*f*h > 0) {
      return t;
    } else {
      t.reverse();
      return t;
    }
  },
  generateTriangulation: function() {
    this.vs.push(new Vec3(-10000.0, -10000.0, 0.0))
    this.vs.push(new Vec3(10000.0, -10000.0, 0.0))
    this.vs.push(new Vec3(0.0, 10000.0, 0.0))
    let st = new Triangle(this.vs.length - 3, this.vs.length - 2, this.vs.length - 1);
    let t = [];
    t.push(st);
    for (let i = 0; i < this.vs.length - 3; i++) { //for each vertex in vs
      let bt = [];
      for (let j = 0; j < t.length; j++) { //for each triangle in t
        if (this.insideCircumcircle(t[j], i)) {
          bt.push(t[j]);
        }
      }
      let p = new Polygon();
      for (let j = 0; j < bt.length; j++) { //for each triangle in bt
        for (let k = 0; k < 3; k++) {//for each edge in triangle
          let shared = false;
          for (let l = 0; l < bt.length; l++) {
            if (l != j) {
              for (let m = 0; m < 3; m++) {
                if (bt[j].getEdge(k).equal(bt[l].getEdge(m))) {
                  shared = true;
                }
              }
            }
          }
          if (!shared) {
            p.addEdge(bt[j].getEdge(k));
          }
        }
      }
      for (let j = 0; j < bt.length; j++) { //for each triangle in bt remove from t
        let ti = 0;
        for (let k = 0; k < t.length; k++) {
          if (bt[j].equal(t[k])) {
            ti = k;
          }
        }
        t.splice(ti, 1);
      }
      for (let j = 0; j < p.es.length; j++) { //for each edge in p
        let newTri = new Triangle(p.es[j].p, p.es[j].q, i);
        t.push(this.correctOrientation(newTri));
      }
    }
    for (let i = t.length - 1; i >= 0; i--) {
      if (t[i].contains(this.vs.length - 3) || t[i].contains(this.vs.length - 2) || t[i].contains(this.vs.length - 1)) {
        t.splice(i, 1);
      }
    }
    this.vs.splice(this.vs.length - 3, 3);
    this.triangulation = t;
  },
  breadthFirst: function() {
    for (let i = 0; i < this.vs.length; i++) {
      this.graphValues.push(-1);
      this.graph.push(new Array());
      for (let j = 0; j < this.vs.length; j++) {
        this.graph[i].push(false);
      }
    }
    for (let i = 0; i < this.triangulation.length; i++) {
      for (let j = 0; j < 3; j++) {
        let e = this.triangulation[i].getEdge(j);
        this.graph[e.p][e.q] = true;
        this.graph[e.q][e.p] = true;
      }
    }
    let q = [];
    q.push(0);
    this.graphValues[0] = 0;
    while (q.length > 0) {
      let p = q.shift();
      for (let i = 0; i < this.graph[p].length; i++) {
        if (this.graph[p][i] && this.graphValues[i] == -1) {
          this.graphValues[i] = this.graphValues[p] + 1;
          q.push(i);
        }
      }
    }
  },
  depthFirst: function() {
    for (let i = 0; i < this.vs.length; i++) {
      this.graphValues.push(-1);
      this.graph.push(new Array());
      for (let j = 0; j < this.vs.length; j++) {
        this.graph[i].push(false);
      }
    }
    for (let i = 0; i < this.triangulation.length; i++) {
      for (let j = 0; j < 3; j++) {
        let e = this.triangulation[i].getEdge(j);
        this.graph[e.p][e.q] = true;
        this.graph[e.q][e.p] = true;
      }
    }
    let q = [];
    q.push(0);
    this.graphValues[0] = 0;
    while (q.length > 0) {
      let p = q.pop();
      for (let i = 0; i < this.graph[p].length; i++) {
        if (this.graph[p][i] && this.graphValues[i] == -1) {
          this.graphValues[i] = this.graphValues[p] + 1;
          q.push(i);
        }
      }
    }
  },
  randomSearch: function() {
    for (let i = 0; i < this.vs.length; i++) {
      this.graphValues.push(-1);
      this.graph.push(new Array());
      for (let j = 0; j < this.vs.length; j++) {
        this.graph[i].push(false);
      }
    }
    for (let i = 0; i < this.triangulation.length; i++) {
      for (let j = 0; j < 3; j++) {
        let e = this.triangulation[i].getEdge(j);
        this.graph[e.p][e.q] = true;
        this.graph[e.q][e.p] = true;
      }
    }
    let q = [];
    q.push(0);
    this.graphValues[0] = 0;
    while (q.length > 0) {
      let r = Math.floor(Math.random()*q.length)
      let p = q[r];
      q.splice(r, 1);
      for (let i = 0; i < this.graph[p].length; i++) {
        if (this.graph[p][i] && this.graphValues[i] == -1) {
          this.graphValues[i] = this.graphValues[p] + 1;
          q.push(i);
        }
      }
    }
  },
  removeOuterTriangles: function(fromIndex) {
    let outerTriangles = [];
    for (let i = 0; i < this.triangulation.length; i++) {
      let sharedEdges = 0;
      if (this.triangulation[i].containsRange(0, fromIndex - 1)) {
        sharedEdges = 3;
      } else {
        for (let j = 0; j < this.triangulation.length; j++) {
          if (i != j && this.triangulation[i].shareEdge(this.triangulation[j])) {
            sharedEdges++;
          }
        }
      }
      if (sharedEdges < 3) {
        outerTriangles.push(i);
      }
    }
    for (let i = outerTriangles.length - 1; i >= 0; i--) {
      this.triangulation.splice(outerTriangles[i], 1);
    }
  }
}
