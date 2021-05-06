function Point(x, y, z, fixed = false) {
    this.x = this.oldX = x;
    this.y = this.oldY = y;
    this.z = this.oldZ = z;
    this.fixed = fixed;
    this.accelerationX = this.accelerationY = this.accelerationZ = 0;
    this.velocityX = this.velocityY = this.velocityZ = 0;
    
    this.constraints = new Array();
    
}

Point.prototype = {

    update: function(dt) {

        if (mouse.down) {
            let dx = this.x - mouse.x;
            let dy = this.y - mouse.y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (mouse.down && dist < mouse.influence) {
                this.oldX = this.x - (mouse.x - mouse.px);
                this.oldY = this.y - (mouse.y - mouse.py);
            } 
        }
    
        var springForceY = -k * (this.y - this.oldY);
        var dampingForceY = damping * this.velocityY;

        this.addForce(0., springForceY + mass * gravity - dampingForceY , 0.);

        var nextX = this.Verlet(this.x, this.oldX, this.accelerationX, damping, dt);
        var nextY = this.Verlet(this.y, this.oldY, this.accelerationY, damping, dt);

        this.oldX = this.x;
        this.oldY = this.y;

        this.velocityX = this.velocityY = this.velocityZ = 0.;
      

        if (!this.fixed) {
            this.x += nextX;
            this.y += nextY;
            this.velocityy += this.accelerationX * dt;
            this.velocityY += this.accelerationY * dt;
        }
        //Limiting boundaries.
        this.limBound();
    },


    update_constraints: function() {
        for (var i = 0; i < this.constraints.length; ++i) {
            this.constraints[i].tick();
            this.constraints[i].relaxation();    
        }
    },

    Verlet: function(pos, oldPos, acceleration, c, h){
        return (pos - oldPos) * (0.99 - c) + acceleration * Math.pow(h, 2);
    },

    attach: function(point, len) {
        this.constraints.push(new Constraint(this, point, len));
    },
    
    addForce: function(x, y, z) {
        this.accelerationX += x / mass || 0;
        this.accelerationY += y / mass || 0;
        this.accelerationZ += z / mass || 0;
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
