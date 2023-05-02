class Constraint {
    constructor(pointOne, pointTwo, length) {
        this.pointOne = pointOne;
        this.pointTwo = pointTwo;
        this.length = length;   
        this.currentDistance = calculateDistance(pointOne, pointTwo);
        this.defaultDistance = this.currentDistance;
    }

    relaxation() {
        let dx = this.pointTwo.x - this.pointOne.x;
        let dy = this.pointTwo.y - this.pointOne.y;
  
        let error = (this.currentDistance- this.length);

        var prct_of_error = error * 0.5 * (1 - this.length / this.currentDistance);

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
    }

    tick() {
        this.currentDistance = calculateDistance(this.pointOne, this.pointTwo);
    }
}

