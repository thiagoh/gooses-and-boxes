(function(game) {

	"use strict";

	var breedCreationFunction = null;
	var creationInterval = null;
	var gun1 = null;
	var fireSeq = 0;
	var ammoIncreaseInterval = null;
	var ammoIncreaseTimeInterval = 1000;
	var timeInterval = 1300;
	var box = null;
	var ground = null;
	var controls = null;

	game.boxSizeFactor = 10;
	game.minBoxSize = 2;
	game.minGooseSize = 4;

	var _shoot = function(event) {

		var button = event.which || event.button;

		if (button !== 1) {
			return;
		}

		event.preventDefault();

		if (game.ammoCount <= 0) {
			return;
		}

		game.playGun1();

		var vector = new THREE.Vector3(
			(event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1,
			0.5);

		game.projector.unprojectVector(vector, game.camera);

		var raycaster = new THREE.Raycaster(game.camera.position, vector.sub(game.camera.position).normalize());

		var intersects = raycaster.intersectObjects(game.objects);

		if (intersects.length > 0) {

			fireSeq++;

			var object = intersects[0].object;

			var atHead = (object._type == 'goose' && raycaster.intersectObject(object.children[0]).length > 0) || object._type == 'goose-head';

			_fireObject(object);

			if (atHead) {
				game.ammoCount += 4;
			}

		} else {

			fireSeq = 0;
		}

		if (fireSeq < 5) {
			game.ammoCount--;
		}

		// console.log('fireSeq: ' + fireSeq);
	};

	var _fireObject = function(object) {

		var objectToDie;
		var _points;

		if (object._type === 'box') {

			objectToDie = object._type == 'goose-head' ? object.parent : object;
			_points = object._type === 'goose-head' ? 50 : 20;


		} else {

			objectToDie = object;
			_points = 10;
		}

		game.score += _points;
		objectToDie.dying = true;

		_balance();
	};

	var scorediff = 0;

	var _balance = function() {

		var limit = 700;

		if (game.score > 1600) {
			limit = 600;
		}

		if (game.score > 2400) {
			limit = 500;
		}

		if (game.score > 4000) {
			limit = 400;
		}

		if (timeInterval > limit) {

			if (game.score - scorediff > 50) {

				scorediff = game.score;
				timeInterval -= 100;

				if (game.boxSizeFactor > 1) {
					game.boxSizeFactor -= 0.3;
				}

				ammoIncreaseTimeInterval += 50;

				_bindIntervals();
			}
		}

		console.log("timeInterval: " + timeInterval);
	};

	var _update = function() {

		var tmp = [];

		_.map(game.objects, function(object) {

			if (object.dying) {
				//object.position.z = object.position.z - 100;
				object.scale.set(
					object.scale.x - (object.scale.x * 0.3),
					object.scale.y - (object.scale.y * 0.3),
					object.scale.y - (object.scale.z * 0.3));
			}

			if (object.dying && object.scale.x < 0.1) {
				game.scene.remove(object);
			} else {
				tmp.push(object);
			}
		});

		game.objects = tmp;
	};

	var _present = function() {

		document.getElementById('score').innerHTML = game.score + '';
		document.getElementById('ammoCount').innerHTML = '|'.repeat(game.ammoCount);
	};

	var _keydown = function() {

		event.preventDefault();

		if (game.ammoCount <= 0) {
			return;
		}

		var key = event.which;

		if (key === 32) {

			_throwBomb();

			event.preventDefault();
		}

		// console.log('key: ' + key);
	};

	var _throwBomb = function() {

		if (game.ammoCount < 8) {
			return;
		}

		var count = 5;
		var i = game.objects.length - 1;
		var arr = [];

		while (count > 0 && i >= 0) {

			var object = game.objects[_.random(0, i--)];

			if (typeof object === 'undefined' || object.type === 'goose-head' || object.dying === true) {
				continue;
			}

			count--;

			var found = _.find(arr, function(pos) {
				return pos.tag === object.tag;
			});

			console.log('found: ', found);

			if (typeof found === 'undefined')
				arr.push(object);
		}

		console.log('arr size', arr.length);

		game.playBomb();

		_.map(arr, function(object) {
			_fireObject(object);
		});

		game.ammoCount = game.ammoCount - 8;

		if (game.ammoCount < 0)
			game.ammoCount = 0;
	};

	var _bindIntervals = function() {

		clearInterval(ammoIncreaseInterval);
		clearInterval(creationInterval);

		ammoIncreaseInterval = setInterval(function() {
			game.ammoIncreaseFunction();
		}, ammoIncreaseTimeInterval);

		creationInterval = setInterval(function() {
			game.breedCreationFunction();
		}, timeInterval);
	};

	var _initEvents = function() {

		document.addEventListener('keydown', game.keydown, false);
		document.addEventListener('mousedown', game.shoot, false);

		_bindIntervals();
	};

	game.present = _present;
	game.update = _update;
	game.shoot = _shoot;
	game.keydown = _keydown;
	game.initEvents = _initEvents;

	window.addEventListener('load', game.initGame());

})(window.game);