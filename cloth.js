function Cloth() {

    this.points = new Array();
    this.vertices = new Float32Array(((clothX + 1) * (clothY + 1)) * 3);
    this.indices = new Uint32Array(this.vertices.length * 3);
    this.colors = [];
    let cnt = 0;
   
    for (var y = 0; y <= clothY; ++y) {
        for (var x = 0; x <= clothX; ++x) {
            var point = new Point(startX + x * spacing, startY - y * spacing, 0.0, !y && !(x % 15));

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
    
    mousePressed: function() {

        for (var i = 0; i < this.points.length; ++i) {
            var point = this.points[i];
            if ((Math.abs(point.x - mouse.x) < spacing) &&
                (Math.abs(point.y - mouse.y) < spacing) &&
                mouse.down && !currentPoint) {

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

    getColor: function(){

        this.colors = [];
        
        for(let i = 0; i < this.points.length; ++i){
                
            let point = this.points[i];
            let offsetDist = this.calculateDistance(mouse, currentPoint);  
            let currentDist = this.calculateDistance(point, currentPoint);
            
            if(currentPoint){
                //let streight = Math.ceil(255 - (currentDist/maxd * 255) );
                let diff = Math.abs(offsetDist - currentDist ) /  spacing ;
                
                if( currentDist < offsetDist){
                    this.colors.push(diff, 1 / diff, 1 - diff, 1);
                }else{
                    this.colors.push(0., 1 - diff, 1 / diff, 1);
                }
                
            }else if(!mouse.down || !currentPoint){
               
                this.colors.push(0, 0, 0.59, 1);
            }
         
        }

        initColorBuffer(colorID, colorBuffer, this.colors);  
    },
}