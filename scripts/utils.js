(function(game) {

	"use strict";

	var tag = 0;

	var addObject = function(object) {

		object.tag = ++tag;

		game.objects.push(object);
	};

	game.addBox = function(size) {

		var box = new THREE.Mesh(
			new THREE.CubeGeometry(size, size, size),
			new THREE.MeshBasicMaterial({
				color: 0xCCCCCC,
				vertexColors: THREE.VertexColors
			})
		);

		for (var i = 0; i < 12; i += 2) {
			var r = Math.random();
			var g = Math.random();
			var b = Math.random();

			box.geometry.faces[i].color.setRGB(r, g, b);
			box.geometry.faces[i + 1].color.setRGB(r, g, b);
		}

		box.position.set((100 * Math.abs(Math.random())) - 50, (40 * Math.abs(Math.random())) - 20, 0);

		// console.log(box.position);

		box._type = 'box';
		addObject(box);

		game.scene.add(box);
	};

	game.addGoose = function(size) {

		var mesh = new THREE.Mesh(game.goose(), game.gooseMaterial());
		mesh.scale.set(size, size, size);
		mesh.position.set((80 * Math.random()) - 40, 10 * Math.random(), 0);

		var head = new THREE.Mesh(
			new THREE.CircleGeometry(size / 60),
			new THREE.MeshBasicMaterial({
				color: 0xFF0000,
				vertexColors: THREE.VertexColors
			})
		);

		head.material.transparent = true;
		head.material.opacity = 0.0;
		head.position.y = 1.2;
		head._type = 'goose-head';

		mesh.add(head);

		mesh._type = 'goose';

		addObject(mesh);
		addObject(head);

		game.scene.add(mesh);
	};

	game.playSound = function(src) {

		setTimeout(function() {

			var audio = document.createElement('audio');
			var source = document.createElement('source');

			source.src = src;
			audio.appendChild(source);
			audio.volume = 0.3;

			audio.play();

		}, 1);
	};

	game.playGun1 = function() {
		game.playSound('/sounds/gun1.ogg');
	};

	game.playGun2 = function() {
		game.playSound('/sounds/gun2.ogg');
	};

	game.playGun3 = function() {
		game.playSound('/sounds/gun3.ogg');
	};

	game.playBomb = function() {

		game.playGun3();
		game.playGun2();
		game.playGun3();

		setTimeout(function() {

			game.playGun2();
			game.playGun3();
			game.playGun2();
			game.playGun3();

		}, 5);

		setTimeout(function() {

			game.playGun2();
			game.playGun3();
			game.playGun2();
			game.playGun3();

		}, 15);

		setTimeout(function() {

			game.playGun2();
			game.playGun3();

		}, 345);

		setTimeout(function() {

			game.playGun2();
			game.playGun3();

		}, 255);
	};

	game.playDuck1 = function() {
		game.playSound('/sounds/duck1.ogg');
	};

	game.ammoIncreaseFunction = function() {

		if (game.ammoCount <= 100)
			game.ammoCount += 1;
	};

	game.breedCreationFunction = function() {

		var v = Math.random();
		var r = Math.abs(Math.random());

		if (v > 0.7) {

			game.addGoose(game.minGooseSize + (game.boxSizeFactor * r));
			game.playDuck1();

		} else if (v > 0.1) {

			game.addBox(game.minBoxSize + (game.boxSizeFactor * r));

		} else {

			game.addGoose(game.minGooseSize + (game.boxSizeFactor * r));
			game.playDuck1();
			game.addBox(game.minBoxSize + (game.boxSizeFactor * r));
		}
	};

})(window.game);