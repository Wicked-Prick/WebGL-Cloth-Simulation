class Cloth {
   constructor(clothHeight, clothWidth){
        this.clothHeight = clothHeight;
        this.clothWidth = clothWidth;
        this.points = [];
        this.vertices = new Float32Array(((clothWidth + 1) * (clothHeight + 1)) * 3);
        this.indices = new Uint32Array(this.vertices.length * 3);
        this.colors = [];
        this.defaultProfile = [];
        this.currentProfile = [];
    }

    createCloth() {
        let count = 0; 
        for (var y = 0; y <= this.clothHeight; ++y) {
            for (var x = 0; x <= this.clothWidth; ++x) {
                var point = new Point(startX + x * spacing, startY - y * spacing, 0.0, 
                            !y && !(x % 15) );
                if (y != 0) {
                    point.attach(this.points[x + (y - 1) * (clothWidth + 1)], spacing);
                }
                if (x != 0) {
                    point.attach(this.points[this.points.length - 1], spacing);
                }
                if (x !== clothWidth && y !== clothHeight) {
                    let b = count;
                    count *= 2;
                    
                    this.indices[count++] = this.points.length;
                    this.indices[count++] = this.points.length + 1;
                    this.indices[count++] = this.points.length + clothWidth + 1;
                    this.indices[count++] = this.points.length + 1;
                    this.indices[count++] = this.points.length + clothWidth + 1;
                    this.indices[count++] = this.points.length + clothWidth + 2;
                    
                    count = b;
                }
        
                this.points.push(point);          
                this.vertices[count++] = point.x;
                this.vertices[count++] = point.y;
                this.vertices[count++] = point.z;  
            
            }
        }
    }

    update(dt) {
        let i = accuracy;
        while (--i) {
            this.currentProfile = [];
            for(let i = 0; i < this.points.length;i++){
                let point = this.points[i];
                point.updateConstraints();   
                
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
            
    }

    updateStrain() {
        this.colors = [];       
        for(let i = 0; i < this.defaultProfile.length; ++i){
            for(let j = 0; j < this.currentProfile.length; ++j){
                let force = (this.currentProfile[j] - this.defaultProfile[i]) 
                            / (this.defaultProfile[i] * k);
        
                this.colors.push(
                    this.mix(0.25, 0.55, force), 
                    this.mix(0.55, 0.75, 0.75 - force), 
                    this.mix(0.75, 1, 1 - force), 
                    this.mix(0.25, 0.75, force
                ));
            }
        }

        initColorBuffer(colorID, colorBuffer, this.colors);
    }

    getDefaultProfile() {
        this.defaultProfile = [];
        
        for(let i = 0; i < this.points.length;i++){
            let point = this.points[i];
            
            for(let j = 0; j < point.constraints.length; ++j){
                this.defaultProfile.push(point.constraints[j].defaultDistance);
            }
        }
    }

    mix(x0, x1, m) {
        return x0*(1 - m) + x1 * m;
    }
}
