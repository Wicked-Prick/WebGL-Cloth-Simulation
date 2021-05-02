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

        if (mouse.down) {
            let dx = this.x - mouse.x;
            let dy = this.y - mouse.y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (mouse.down  && dist < mouse.influence) {
                this.oldX = this.x - (mouse.x - mouse.px);
                this.oldY = this.y - (mouse.y - mouse.py);
            } 
        }

        this.applyGravity(0., gravity, 0.);

        var nextX = (this.x - this.oldX) * damping + this.velocityX * dt;
        var nextY = (this.y - this.oldY) * damping + this.velocityY * dt;

        this.oldX = this.x;
        this.oldY = this.y;

        this.velocityX = this.velocityY = this.velocityZ = 0.;

        if (!this.fixed) {
            this.x += nextX;
            this.y += nextY;
        }
        //Limiting boundaries.
        this.limBound();
    },

    update_constraints: function() {
        for (var i = 0; i < this.constraints.length; ++i) {
            this.constraints[i].relaxation();
        }
    },

    attach: function(point, len) {
        this.constraints.push(new Constraint(this, point, len));
    },
    
    applyGravity: function(x, y, z) {
        this.velocityX += x || 0;
        this.velocityY += y || 0;
        this.velocityZ += z || 0;
    },

    limBound: function(){
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
        }
    }

}