function Cloth() {

    this.points = new Array();
    this.vertices = new Float32Array(((clothX + 1) * (clothY + 1)) * 3);
    this.indices = new Uint32Array(this.vertices.length * 3);
    var cnt = 0;

    for (var y = 0; y <= clothY; ++y) {
        for (var x = 0; x <= clothX; ++x) {
            var point = new Point(startX + x * spacing, startY - y * spacing, 0.0, !y && !(x % 20));

            if (y != 0) point.attach(this.points[x + (y - 1) * (clothX + 1)], spacing);
            if (x != 0) point.attach(this.points[this.points.length - 1], spacing);

            if (x !== clothX && y !== clothY) {
                let b = cnt;
                cnt *= 2;

                this.indices[cnt++] = this.points.length;
                this.indices[cnt++] = this.points.length + 1;
                this.indices[cnt++] = this.points.length + clothX + 1;
                this.indices[cnt++] = this.points.length + 1;
                this.indices[cnt++] = this.points.length + clothX + 1;
                this.indices[cnt++] = this.points.length + clothX + 2;

                cnt = b;
            }
            this.points.push(point);
            this.vertices[cnt++] = point.x;
            this.vertices[cnt++] = point.y;
            this.vertices[cnt++] = point.z;


        }
    }
}

Cloth.prototype = {
    update: function(dt) {

        i = accuracy;
        while (--i) {
            this.points.forEach(point => {
                point.update_constraints();
            });

        }
        var cnt = 0;
        this.points.forEach((point) => {
            point.update(dt);
            this.vertices[cnt++] = point.x;
            this.vertices[cnt++] = point.y;
            this.vertices[cnt++] = point.z;
        });

    },

    getColor: function() {
        for (var y = 1; y < clothY; ++y) {

            for (var x = 1; x < clothX; ++x) {

                var i1 = x + (y - 1) * (clothX + 1);
                var i2 = this.points.length - 1;

                var offset = this.points[i2].x - this.points[i1].x;
                offset += this.points[i2].y - this.points[i1].y;
                offset *= 0.2;

                let coef = Math.round((Math.abs(offset) / spacing + 1) * 255);
                if (coef > 255)
                    coef = 255;


                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

                var colorUniformLocation = gl.getUniformLocation(program, "u_color");
                gl.uniform4f(colorUniformLocation, 1, 0, 0, lerp(0.2, .7, coef / 255));
            }
        }

    },

    draggedPoints: function() {
        for (var i = 0; i < this.points.length; ++i) {
            var point = this.points[i];
            if ((Math.abs(point.x - mouse.x) < spacing) &&
                (Math.abs(point.y - mouse.y) < spacing) &&
                mouse.down && !currentPoint) {

                currentPoint = point;
            }
            if (currentPoint) {
                currentPoint.x = mouse.x;
                currentPoint.y = mouse.y;

                if (pinned) {
                    currentPoint.fixed = gravity;
                } else if (unPinned) {
                    currentPoint.fixed = false;
                }
            }
        }
    }
}

function lerp(a, b, p) {
    return (b - a) * p + a;
}