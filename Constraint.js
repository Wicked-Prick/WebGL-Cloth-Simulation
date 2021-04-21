function Constraint(pointOne, pointTwo, length) {
    this.pointOne = pointOne;
    this.pointTwo = pointTwo;
    this.length = length;
}

Constraint.prototype = {

    relaxation: function() {
        let dx = this.pointTwo.x - this.pointOne.x;
        let dy = this.pointTwo.y - this.pointOne.y;

        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.length) return;

        var error = (dist - this.length);
        var prct_of_error = error * 0.5 * (1 - this.length / dist);

        var normalizeX = dx * prct_of_error,
            normalizeY = dy * prct_of_error;

        if (!this.pointOne.fixed) {
            this.pointOne.x += normalizeX;
            this.pointOne.y += normalizeY;
        }

        if (!this.pointTwo.fixed) {
            this.pointTwo.x -= normalizeX;
            this.pointTwo.y -= normalizeY;
        }
    },

}