(function(){

    "use strict";
    
    var scene=new THREE.Scene(),
        light= new THREE.AmbientLight(0xffffff),
        renderer,
        camera,
        breedCreationFunction,
        creationInterval,
        objects = [],
        raycaster,
        goose,
        gun1, 
        fireSeq = 0,
        ammoCount = 30,
        ammoIncreaseFunction,
        ammoIncreaseInterval,
        ammoIncreaseTimeInterval = 1000,
        score = 0,
        scorediff = 0,
        timeInterval = 1300,
        boxSizeFactor = 10,
        minBoxSize = 2,
        minGooseSize = 4,
        gooseMaterial,
        mesh,
        LEFT_TO_RIGHT = 1,
        BOTTOM_TO_UP = 2,
        direction = LEFT_TO_RIGHT,
        renderer = new THREE.WebGLRenderer(),
        box,
        ground,
        controls=null;

        function createBox(size) {

            var box = new THREE.Mesh(
                new THREE.CubeGeometry(size,size,size),
                new THREE.MeshBasicMaterial({color: 0xCCCCCC, vertexColors: THREE.VertexColors })
            );

            for (var i = 0; i <12; i+=2) {
                var r = Math.random(); 
                var g = Math.random(); 
                var b = Math.random(); 

                box.geometry.faces[i].color.setRGB(r,g,b);
                box.geometry.faces[i+1].color.setRGB(r,g,b);
            }

            box.position.set((100*Math.abs(Math.random()))-50,(40*Math.abs(Math.random()))-20,0);
            console.log(box.position);
            box._type = 'box';
            objects.push(box);
            scene.add(box);
        }

        function addGoose(size) {

            mesh = new THREE.Mesh(goose, gooseMaterial);
            mesh.scale.set(size, size, size);
            mesh.position.set((80*Math.random())-40,10*Math.random(),0);

            var head = new THREE.Mesh(
                new THREE.CircleGeometry(size/60),
                new THREE.MeshBasicMaterial({color: 0xFF0000, vertexColors: THREE.VertexColors })
            );

            head.material.transparent = true;
            head.material.opacity = 0.0;
            head.position.y = 1.2;
            head._type = 'goose-head';

            mesh.add(head);

            mesh._type = 'goose';
            objects.push(mesh);
            objects.push(head);
            scene.add(mesh);
        }

        function playSound(src) {
            setTimeout(function() {
                var audio = document.createElement('audio');
                var source = document.createElement('source');
                source.src = src;
                audio.appendChild(source);
                audio.play();
            }, 1);
        };

        function playGun1() {
            playSound('/sounds/gun1.ogg');
        };

        function playDuck1() {
            playSound('/sounds/duck1.ogg');
        };

        function ammoIncreaseFunction() {

            if (ammoCount <= 100)
                ammoCount++;
        }

        function breedCreationFunction() {

            var v = Math.random();
            var r = Math.abs(Math.random());

            if (v > 0.7) {

                addGoose(minGooseSize + (boxSizeFactor * r));
                playDuck1();

            } else if (v > 0.1) {

                createBox(minBoxSize + (boxSizeFactor * r));

            } else {

                addGoose(minGooseSize + (boxSizeFactor * r));
                playDuck1();
                createBox(minBoxSize + (boxSizeFactor * r));
            }
        };

        function initScene() {

            var tmp = document.createElement('audio');
            var source = document.createElement('source');
            source.src = '/sounds/gun1.ogg';
            tmp.appendChild(source);
            source.src = '/sounds/gun2.ogg';
            tmp.appendChild(source);
            source.src = '/sounds/gun3.ogg';
            tmp.appendChild(source);
            source.src = '/sounds/duck1.ogg';
            tmp.appendChild(source);
            
            renderer.setClearColor( 0x333333);
            //renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( window.innerWidth, window.innerHeight );
           
            document.getElementById("webgl-container").appendChild(renderer.domElement);

            scene.add(light);
                      
            camera = new THREE.PerspectiveCamera(
                    35,
                    window.innerWidth / window.innerHeight,
                    1,
                    1000
                );

            gooseMaterial = new THREE.MeshLambertMaterial({
                        map: THREE.ImageUtils.loadTexture('/images/goose.jpg')
                    });

            goose = (new THREE.JSONLoader()).parse(window.gooseJson).geometry;

            camera.position.set( 0, 20, 100 );
            camera.lookAt(new THREE.Vector3(0, 1, 0));

            scene.add(camera);

            var projector = new THREE.Projector();

            var shoot = function(event) {

                var button = event.which || event.button;

                if (button !== 1) {
                    return;
                }

                event.preventDefault();

                if (ammoCount <= 0) {
                    return;
                }

                playGun1();

                var vector = new THREE.Vector3(
                                (event.clientX / window.innerWidth) * 2 - 1, 
                                -(event.clientY / window.innerHeight) * 2 + 1, 
                                0.5);

                projector.unprojectVector(vector, camera);

                raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

                var intersects = raycaster.intersectObjects(objects);

                if (intersects.length > 0) {

                    fireSeq++;

                    aimObject(intersects[0].object);

                } else {

                    fireSeq = 0;
                }

                if (fireSeq < 5) {
                    ammoCount--;
                }

                console.log('fireSeq: ' + fireSeq)

                /*
                for (var i = 0; i < intersects.length; i++) {
                    aimObject(intersects[i].object);
                };
                */
            };

            document.addEventListener('keydown', keydown, false);
            document.addEventListener('mousedown', shoot, false);

            ammoIncreaseInterval = setInterval(ammoIncreaseFunction, ammoIncreaseTimeInterval);
            creationInterval = setInterval(breedCreationFunction, timeInterval);

            render()
        };

        var last = new Date().getTime();
        
        function render() {

            requestAnimationFrame(render);

            var now = new Date().getTime();    
            var delta = now - last;

            update(delta);
            present();

            renderer.render(scene, camera); 
        };

        function aimObject(object) {

            if (object._type == 'goose' || object._type == 'goose-head') {

                var atHead = (object._type == 'goose' && raycaster.intersectObject(object.children[0]).length > 0) 
                                || object._type == 'goose-head';

                var objectToDie = object._type == 'goose-head' ? object.parent : object;

                if (atHead) {

                    ammoIncreaseFunction();
                    ammoIncreaseFunction();
                    ammoIncreaseFunction();
                    ammoIncreaseFunction();

                    score += 50;
                    scorediff += 50;

                } else {

                    score += 20;
                    scorediff += 20;
                }

                objectToDie.dying = true;

            } else {

                object.dying = true;

                score += 10;
                scorediff += 10;
            }

            var limit = 700;

            if (score > 1600) {
                limit = 600;
            }

            if (score > 2400) {
                limit = 400;
            }

            if (score > 4000) {
                limit = 300;
            }

            if (timeInterval > limit) {

                if (scorediff  > 50) {
                    scorediff = 0;

                    timeInterval -= 100;

                    if (boxSizeFactor > 1)
                        boxSizeFactor -= 0.3;

                    ammoIncreaseTimeInterval += 50;

                    clearInterval(ammoIncreaseInterval);
                    clearInterval(creationInterval);

                    ammoIncreaseInterval = setInterval(ammoIncreaseFunction, ammoIncreaseTimeInterval);
                    creationInterval = setInterval(breedCreationFunction, timeInterval);
                }
            }

            console.log("timeInterval: " + timeInterval);
        };

        function update() {

            for (var i = 0; i < objects.length; i++) {
                
                var object = objects[i];

                if (object.dying) {
                    //object.position.z = object.position.z - 100;
                    object.scale.set(
                                object.scale.x - (object.scale.x*0.3), 
                                object.scale.y - (object.scale.y*0.3), 
                                object.scale.y - (object.scale.z*0.3));
                }
            };
            
            var tmp = [];

            for (var i = 0; i < objects.length; i++) {
                
                var object = objects[i];

                if (object.dying && object.scale.x < 0.1) {
                    scene.remove(object);
                } else {
                    tmp.push(object);
                }
            };

            objects = tmp;
        };

        function present() {
            document.getElementById('score').innerHTML = score + '';
            document.getElementById('ammoCount').innerHTML = '|'.repeat(ammoCount);
        };
       
        window.onload = initScene;
})();

