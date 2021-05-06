function Cloth() {

    this.points = new Array();
    this.vertices = new Float32Array(((clothX + 1) * (clothY + 1)) * 3);
    this.indices = new Uint32Array(this.vertices.length * 3);
    this.colors = [];
    this.defaultProfile = new Array();
    this.currentProfile = new Array();
    let cnt = 0;
    

    for (var y = 0; y <= clothY; ++y) {
        for (var x = 0; x <= clothX; ++x) {
            var point = new Point(startX + x * spacing, startY - y * spacing, 0.0, 
                        !y && !(x % 15) );
            if (y != 0) {
                point.attach(this.points[x + (y - 1) * (clothX + 1)], spacing);
            }
            if (x != 0) {
                point.attach(this.points[this.points.length - 1], spacing);
            }
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
            
            this.currentProfile = [];
            
            for(let i = 0; i < this.points.length;i++){
                let point = this.points[i];
                point.update_constraints();   
                
                for(let j = 0; j < point.constraints.length; ++j){
                    this.currentProfile.push(point.constraints[j].currentDistance);
                }                 
            }      
        }
        
        var cnt = 0;
        
        this.points.forEach((point) => {
            point.update(dt);
            this.vertices[cnt++] = point.x;
            this.vertices[cnt++] = point.y;
            this.vertices[cnt++] = point.z;
        }); 
             
    },
    
    mousePressed: function() {

        for (var i = 0; i < this.points.length; ++i) {
            var point = this.points[i];
            if (this.calculateDistance(point, mouse) < spacing 
            && mouse.down && !currentPoint) {
                currentPoint = point;
            }
        }
    },

    calculateDistance: function(a, b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    },

    draggedPoint: function(){
        if (currentPoint) {

            currentPoint.x = mouse.x;
            currentPoint.y = mouse.y;

            if (pinned) {
                currentPoint.fixed = gravity;

            } else if (unPinned) {
                currentPoint.fixed = false;
            }
        }
    },
       
    updateStrain: function(){
        this.colors = [];       
        
        for(let i = 0; i < this.defaultProfile.length; ++i){
            for(let j = 0; j < this.currentProfile.length; ++j){
                let force = (this.currentProfile[j] - this.defaultProfile[i]) 
                            / (this.defaultProfile[i] * k);
          
                this.colors.push(
                    this.mix(0.25, 0.55, force), 
                    this.mix(0.55, 0.75, 0.75 - force), 
                    this.mix(0.75, 1, 1 - force), 
                    this. mix(0.25, 0.75, force
                ));
            }
        }

       initColorBuffer(colorID, colorBuffer, this.colors);
    }, 

    getDefaultProfile: function(){
        this.defaultProfile = [];
        
        for(let i = 0; i < this.points.length;i++){
            let point = this.points[i];
            
            for(let j = 0; j < point.constraints.length; ++j){
                this.defaultProfile.push(point.constraints[j].defaultDistance);
            }
        }
    },

    mix: function (x0, x1, m) {
        return x0*(1 - m) + x1 * m;
    },
}