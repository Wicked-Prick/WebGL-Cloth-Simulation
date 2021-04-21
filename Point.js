function Point(x, y, z, fixed = false) {
    this.x = this.oldX = x;
    this.y = this.oldY = y;
    this.z = this.oldZ = z;
    this.fixed = fixed;

    this.velocityX = this.velocityY = this.velocityZ = 0;

    this.constraints = new Array();
}

Point.prototype = {

    update: function(dt) {

        this.addForce(0., gravity, 0.);

        var nextX = (this.x - this.oldX) * damping + this.velocityX * dt;
        var nextY = (this.y - this.oldY) * damping + this.velocityY * dt;

        this.oldX = this.x;
        this.oldY = this.y;

        this.velocityX = this.velocityY = this.velocityZ = 0.;

        if (!this.fixed) {
            this.x += nextX;
            this.y += nextY;
        }

        /* Limiting boundaries.
        if (this.x >= 1) {
            this.oldX = 1 + (1 - this.oldX) * bounce;
            this.x = 1;
        }

        if (this.y >= 1) {
            this.oldY = 1 + (1 - this.oldY) * bounce;
            this.y = 1;
        } else if (this.y <= -1.0) {
            this.oldY *= -1.0 * bounce;
            this.y = -1.0;
        }*/


    },

    update_constraints: function() {
        for (var i = 0; i < this.constraints.length; ++i) {
            this.constraints[i].relaxation();
        }
    },

    draw_constraints: function() {
        for (var i = 0; i < this.constraints.length; ++i) {
            this.constraints[i].draw(ctx);
        }
    },

    attach: function(point, len) {
        this.constraints.push(new Constraint(this, point, len));
        console.log(this);
    },

    addForce: function(x, y, z) {
        this.velocityX += x || 0;
        this.velocityY += y || 0;
        this.velocityZ += z || 0;
    },

}