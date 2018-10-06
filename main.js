var _canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var _gl = canvas.getContext("webgl", {
  premultipliedAlpha: false
});

function wave(t, v) {
  return 0.1*Math.pow(Math.sin(0.5*(t/60.0 + 1.0*v)), 16);
}

function singleWave(t, v) {
  let x = t/15 - 0.75*v - 2.5;
  return 0.1*x*Math.exp(-Math.pow(x, 2));
}

function Core(canvas, gl, vsh, fsh) {
  this.canvas = canvas;
  this.gl = gl;

  this.vertexShaderSource = vsh;
  this.fragmentShaderSource = fsh;

  this.vertices = [];
  this.vertexBuffer = null;
  this.vertexShader = null;
  this.fragmentShader = null;
  this.shaderProgram = null;

  this.attribs = {};
  this.uniforms = {};
  this.mMatrix = null;
  this.vMatrix = null;
  this.pMatrix = null;

  this.lightVec = new Vec3(0, 0, 1);
  this.lightVec = this.lightVec.normalize();

  this.time = 0;

  this.drawType = this.gl.TRIANGLES;

  this.triangulation = new Triangulation();

  this.init = function() {

    /*let gridWidth = 64;
    let gridHeight = 64;
    this.generateGrid(gridWidth, gridHeight);*/
    this.triangulation.generateVertices(256, 0.075);
    //triangulation.generatePentagonVertices();
    //triangulation.generateSquareVertices();
    this.triangulation.generateTriangulation();
    this.triangulation.removeOuterTriangles(17);
    this.triangulation.breadthFirst();
    //this.triangulation.depthFirst();
    //this.triangulation.randomSearch();
    this.verticesFromTriangulation();

    //this.convertToLines();

    this.mMatrix = new Mat4();

    let translateMat = new Mat4();
    translateMat.translate(0, 0, 1);
    let scaleMat = new Mat4();
    //scaleMat.scale(1/gridWidth, 1/gridHeight, 1/gridHeight);
    scaleMat.scale(1, 1, 1);
    this.vMatrix = translateMat.multiply(scaleMat);

    this.pMatrix = new Mat4();
    //this.pMatrix.symmetricProjection(0.01, 100, 10, 10);
    this.pMatrix.simpleProjection(this.canvas.width, this.canvas.height);

    this.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STREAM_DRAW);

    this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.gl.shaderSource(this.vertexShader, this.vertexShaderSource);
    this.gl.compileShader(this.vertexShader);
    console.log(this.gl.getShaderInfoLog(this.vertexShader));

    this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(this.fragmentShader, this.fragmentShaderSource);
    this.gl.compileShader(this.fragmentShader);
    console.log(this.gl.getShaderInfoLog(this.fragmentShader));

    this.shaderProgram = this.gl.createProgram();
    this.gl.attachShader(this.shaderProgram, this.vertexShader);
    this.gl.attachShader(this.shaderProgram, this.fragmentShader);
    this.gl.linkProgram(this.shaderProgram);
    this.gl.useProgram(this.shaderProgram);

    this.attribs["vCoord"] = this.gl.getAttribLocation(this.shaderProgram, "vCoord");
    this.attribs["vNorm"] = this.gl.getAttribLocation(this.shaderProgram, "vNorm");
    this.attribs["vColor"] = this.gl.getAttribLocation(this.shaderProgram, "vColor");
    this.attribs["vTexCoord"] = this.gl.getAttribLocation(this.shaderProgram, "vTexCoord");

    this.uniforms["mvpMatrix"] = this.gl.getUniformLocation(this.shaderProgram, "mvpMatrix");
    this.gl.uniformMatrix4fv(this.uniforms["mvpMatrix"], this.gl.FALSE, this.getMvpMatrixValues());
    this.uniforms["lightVec"] = this.gl.getUniformLocation(this.shaderProgram, "lightVec");
    this.gl.uniform3fv(this.uniforms["lightVec"], this.lightVec.getArray());
    this.uniforms["time"] = this.gl.getUniformLocation(this.shaderProgram, "time");
    this.gl.uniform1f(this.uniforms["time"], this.time / 60.0);

    this.draw();
  };

  this.draw = function() {

    this.vertices = [];
    this.verticesFromTriangulation();
    //this.convertToLines();

    //this.gl.clearColor(0.125, 0.125, 0.125, 1.0);
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STREAM_DRAW);
    this.gl.useProgram(this.shaderProgram);
    this.gl.vertexAttribPointer(this.attribs["vCoord"], 3, this.gl.FLOAT, false, 4*12, 0);
    this.gl.enableVertexAttribArray(this.attribs["vCoord"]);
    this.gl.vertexAttribPointer(this.attribs["vNorm"], 3, this.gl.FLOAT, false, 4*12, 4*3);
    this.gl.enableVertexAttribArray(this.attribs["vNorm"]);
    this.gl.vertexAttribPointer(this.attribs["vColor"], 4, this.gl.FLOAT, false, 4*12, 4*6);
    this.gl.enableVertexAttribArray(this.attribs["vColor"]);
    this.gl.vertexAttribPointer(this.attribs["vTexCoord"], 2, this.gl.FLOAT, false, 4*12, 4*10);
    this.gl.enableVertexAttribArray(this.attribs["vTexCoord"]);
    this.gl.uniformMatrix4fv(this.uniforms["mvpMatrix"], this.gl.FALSE, this.getMvpMatrixValues());
    this.gl.uniform3fv(this.uniforms["lightVec"], this.lightVec.getArray());
    this.gl.uniform1f(this.uniforms["time"], this.time / 60.0);
    this.gl.drawArrays(this.drawType, 0, this.vertices.length / 12);

    this.time++;

    requestAnimationFrame(this.draw.bind(this));
  };

  this.keydown = function(keyCode) {
    if (keyCode === 37) {
      this.lightVec.rotY(Math.PI/60);
    } if (keyCode === 39) {
      this.lightVec.rotY(-Math.PI/60);
    } if (keyCode === 38) {
      this.lightVec.rotX(Math.PI/60);
    } if (keyCode === 40) {
      this.lightVec.rotX(-Math.PI/60);
    }
    /*if (keyCode === 38) {
      let newMat4 = new Mat4();
      newMat4.rotateAroundX(-Math.PI/60);
      this.mMatrix = newMat4.multiply(this.mMatrix);
    } else if (keyCode === 40) {
      let newMat4 = new Mat4();
      newMat4.rotateAroundX(Math.PI/60);
      this.mMatrix = newMat4.multiply(this.mMatrix);
    } else if (keyCode === 37) {
      let newMat4 = new Mat4();
      newMat4.rotateAroundY(-Math.PI/60);
      this.mMatrix = newMat4.multiply(this.mMatrix);
    } else if (keyCode === 39) {
      let newMat4 = new Mat4();
      newMat4.rotateAroundY(Math.PI/60);
      this.mMatrix = newMat4.multiply(this.mMatrix);
    } else if (keyCode === 87) {
      let transMat = new Mat4();
      transMat.translate(0, 0, 0.1);
      this.vMatrix = this.vMatrix.multiply(transMat);
    } else if (keyCode === 83) {
      let transMat = new Mat4();
      transMat.translate(0, 0, -0.1);
      this.vMatrix = this.vMatrix.multiply(transMat);
    }*/
  };

  this.click = function() {
    this.time = 0;
  };

  this.getMvpMatrixValues = function() {
    return this.mMatrix.multiply(this.vMatrix.multiply(this.pMatrix)).getValues();
  };

  this.verticesFromTriangulation = function() {
    let vs = this.triangulation.getVertices();
    let values = this.triangulation.getGraphValues();
    for (let i = 0; i < vs.length/3; i++) {
      let vv = values[i*3];
      let v = vs[i*3].translate(0, 0, singleWave(this.time, vv));
      let uv = values[i*3 + 1];
      let u = vs[i*3 + 1].translate(0, 0, singleWave(this.time, uv));
      let wv = values[i*3 + 2];
      let w = vs[i*3 + 2].translate(0, 0, singleWave(this.time, wv));
      let n = u.sub(v).cross(w.sub(v)).normalize();
      this.vertices.push(v.x);
      this.vertices.push(v.y);
      this.vertices.push(v.z);
      this.vertices.push(n.x);
      this.vertices.push(n.y);
      this.vertices.push(n.z);
      //color
      this.vertices.push(1.0);
      this.vertices.push(0.0);
      this.vertices.push(0.0);
      this.vertices.push(1.0);
      //texcoords
      this.vertices.push(0.0);
      this.vertices.push(0.0);

      this.vertices.push(u.x);
      this.vertices.push(u.y);
      this.vertices.push(u.z);
      this.vertices.push(n.x);
      this.vertices.push(n.y);
      this.vertices.push(n.z);
      //color
      this.vertices.push(1.0);
      this.vertices.push(0.0);
      this.vertices.push(0.0);
      this.vertices.push(1.0);
      //texcoords
      this.vertices.push(0.0);
      this.vertices.push(0.0);

      this.vertices.push(w.x);
      this.vertices.push(w.y);
      this.vertices.push(w.z);
      this.vertices.push(n.x);
      this.vertices.push(n.y);
      this.vertices.push(n.z);
      //color
      this.vertices.push(1.0);
      this.vertices.push(0.0);
      this.vertices.push(0.0);
      this.vertices.push(1.0);
      //texcoords
      this.vertices.push(0.0);
      this.vertices.push(0.0);
    }
  };

  this.generateGrid = function(gridWidth, gridHeight) {
    let perlin = new Perlin(8, 8);
    let grid = [];
    for (let i = 0; i < gridHeight; i++) {
      let row = [];
      for (let j = 0; j < gridWidth; j++) {
        let p = perlin.get(j / gridWidth, i / gridHeight)
        let vertex = new Vec3(i - gridWidth/2, j - gridHeight/2, p*8 - 4);
        row.push(vertex);
      }
      grid.push(row);
    }

    for (let i = 0; i < gridHeight - 1; i++) {
      for (let j = 0; j < gridWidth - 1; j++) {
        let v = grid[i][j];
        let u = grid[i+1][j];
        let w = grid[i+1][j+1];
        let n = u.sub(v).cross(w.sub(v)).normalize();
        this.vertices.push(v.x);
        this.vertices.push(v.y);
        this.vertices.push(v.z);
        this.vertices.push(n.x);
        this.vertices.push(n.y);
        this.vertices.push(n.z);
        //color
        this.vertices.push(1.0);
        this.vertices.push(0.0);
        this.vertices.push(0.0);
        this.vertices.push(1.0);
        //texcoords
        this.vertices.push(0.0);
        this.vertices.push(0.0);

        this.vertices.push(u.x);
        this.vertices.push(u.y);
        this.vertices.push(u.z);
        this.vertices.push(n.x);
        this.vertices.push(n.y);
        this.vertices.push(n.z);
        //color
        this.vertices.push(1.0);
        this.vertices.push(0.0);
        this.vertices.push(0.0);
        this.vertices.push(1.0);
        //texcoords
        this.vertices.push(1.0);
        this.vertices.push(0.0);

        this.vertices.push(w.x);
        this.vertices.push(w.y);
        this.vertices.push(w.z);
        this.vertices.push(n.x);
        this.vertices.push(n.y);
        this.vertices.push(n.z);
        //color
        this.vertices.push(1.0);
        this.vertices.push(0.0);
        this.vertices.push(0.0);
        this.vertices.push(1.0);
        //texcoords
        this.vertices.push(1.0);
        this.vertices.push(1.0);

        v = grid[i][j];
        u = grid[i+1][j+1];
        w = grid[i][j+1];
        n = u.sub(v).cross(w.sub(v)).normalize();
        this.vertices.push(v.x);
        this.vertices.push(v.y);
        this.vertices.push(v.z);
        this.vertices.push(n.x);
        this.vertices.push(n.y);
        this.vertices.push(n.z);
        //color
        this.vertices.push(1.0);
        this.vertices.push(0.0);
        this.vertices.push(0.0);
        this.vertices.push(1.0);
        //texcoords
        this.vertices.push(0.0);
        this.vertices.push(0.0);

        this.vertices.push(u.x);
        this.vertices.push(u.y);
        this.vertices.push(u.z);
        this.vertices.push(n.x);
        this.vertices.push(n.y);
        this.vertices.push(n.z);
        //color
        this.vertices.push(1.0);
        this.vertices.push(0.0);
        this.vertices.push(0.0);
        this.vertices.push(1.0);
        //texcoords
        this.vertices.push(1.0);
        this.vertices.push(1.0);

        this.vertices.push(w.x);
        this.vertices.push(w.y);
        this.vertices.push(w.z);
        this.vertices.push(n.x);
        this.vertices.push(n.y);
        this.vertices.push(n.z);
        //color
        this.vertices.push(1.0);
        this.vertices.push(0.0);
        this.vertices.push(0.0);
        this.vertices.push(1.0);
        //texcoords
        this.vertices.push(0.0);
        this.vertices.push(1.0);
      }
    }
  };

  this.convertToLines = function() {
    this.drawType = this.gl.LINES;
    lineVertices = [];
    for (let i = 0; i < this.vertices.length / (3*12); i++) {
      for (let j = 0; j < 12; j++) {
        lineVertices.push(this.vertices[i*3*12 + 0*12 + j]);
      }
      for (let j = 0; j < 12; j++) {
        lineVertices.push(this.vertices[i*3*12 + 1*12 + j]);
      }
      for (let j = 0; j < 12; j++) {
        lineVertices.push(this.vertices[i*3*12 + 1*12 + j]);
      }
      for (let j = 0; j < 12; j++) {
        lineVertices.push(this.vertices[i*3*12 + 2*12 + j]);
      }
      for (let j = 0; j < 12; j++) {
        lineVertices.push(this.vertices[i*3*12 + 2*12 + j]);
      }
      for (let j = 0; j < 12; j++) {
        lineVertices.push(this.vertices[i*3*12 + 0*12 + j]);
      }
    }
    this.vertices = lineVertices;
  };
}

var _core = new Core(_canvas, _gl, _vertexShaderSource, _fragmentShaderSource);

window.onkeydown = function(e) {
  e.preventDefault();
  _core.keydown(e.keyCode);
};
window.onclick = function(e) {
  e.preventDefault();
  _core.click();
}

window.onload = function() {
  _core.init();
};

//Square
/*this.vertices = [
  -0.5, -0.5, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0,
  0.5, -0.5, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0,
  -0.5, 0.5, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0,
  -0.5, 0.5, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0,
  0.5, -0.5, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0,
  0.5, 0.5, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0
];*/

//Cube
/*this.vertices = [
  -0.5, -0.5, -0.5, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, //Front face
  0.5, -0.5, -0.5, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0,
  -0.5, 0.5, -0.5, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0,
  -0.5, 0.5, -0.5, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0,
  0.5, -0.5, -0.5, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0,
  0.5, 0.5, -0.5, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0,
  -0.5, -0.5, 0.5, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, //Back face
  0.5, -0.5, 0.5, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0,
  -0.5, 0.5, 0.5, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0,
  -0.5, 0.5, 0.5, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0,
  0.5, -0.5, 0.5, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0,
  0.5, 0.5, 0.5, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0,
  -0.5, 0.5, -0.5, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0, //Top face
  0.5, 0.5, -0.5, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0,
  -0.5, 0.5, 0.5, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
  -0.5, 0.5, 0.5, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
  0.5, 0.5, -0.5, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0,
  0.5, 0.5, 0.5, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0,
  -0.5, -0.5, -0.5, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, //Bottom face
  0.5, -0.5, -0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
  -0.5, -0.5, 0.5, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0,
  -0.5, -0.5, 0.5, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0,
  0.5, -0.5, -0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
  0.5, -0.5, 0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0,
  -0.5, -0.5, -0.5, 1.0, 0.5, 0.0, 1.0, 0.0, 1.0, //Left face
  -0.5, 0.5, -0.5, 1.0, 0.5, 0.0, 1.0, 1.0, 1.0,
  -0.5, -0.5, 0.5, 1.0, 0.5, 0.0, 1.0, 0.0, 0.0,
  -0.5, -0.5, 0.5, 1.0, 0.5, 0.0, 1.0, 0.0, 0.0,
  -0.5, 0.5, -0.5, 1.0, 0.5, 0.0, 1.0, 1.0, 1.0,
  -0.5, 0.5, 0.5, 1.0, 0.5, 0.0, 1.0, 1.0, 0.0,
  0.5, -0.5, -0.5, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, //Right face
  0.5, 0.5, -0.5, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0,
  0.5, -0.5, 0.5, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
  0.5, -0.5, 0.5, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
  0.5, 0.5, -0.5, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0,
  0.5, 0.5, 0.5, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0,
];*/
