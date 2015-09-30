(function(window) {

	"use strict";

	window._ = require('underscore');

	var Game = function() {

		var _this = this;

		_this.scene = new THREE.Scene();
		_this.light = new THREE.AmbientLight(0xffffff);
		_this.renderer = new THREE.WebGLRenderer();
		_this.projector = new THREE.Projector();
		_this.objects = [];
		_this.camera = null;
		_this.ammoCount = 30;
		_this.score = 0;
		_this.scorediff = 0;

		_this._gooseMaterial = null;
		_this._goose = null;

		var accessible = ['goose', 'gooseMaterial'];

		_.map(accessible, function(property) {

			_this[property] = function(v) {

				_this['_' + property] = typeof v === 'undefined' ? _this['_' + property] : v;

				return _this['_' + property];
			};
		});

		console.log(_this);

		_this.initGame = function() {

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

			_this.renderer.setClearColor(0x333333);
			//_this.renderer.setPixelRatio( window.devicePixelRatio );
			_this.renderer.setSize(window.innerWidth, window.innerHeight);

			document.getElementById("webgl-container").appendChild(_this.renderer.domElement);

			_this.scene.add(_this.light);

			_this.camera = new THREE.PerspectiveCamera(
				35,
				window.innerWidth / window.innerHeight,
				1,
				1000
			);

			_this._gooseMaterial = new THREE.MeshLambertMaterial({
				map: THREE.ImageUtils.loadTexture('/images/goose.jpg')
			});

			_this._goose = (new THREE.JSONLoader()).parse(window.gooseJson).geometry;

			_this.camera.position.set(0, 20, 100);
			_this.camera.lookAt(new THREE.Vector3(0, 1, 0));

			_this.scene.add(_this.camera);

			_this.initEvents();

			_this.render();
		};

		var last = new Date().getTime();

		_this.render = function() {

			requestAnimationFrame(_this.render);

			var now = new Date().getTime();
			var delta = now - last;

			_this.update(delta);
			_this.present();

			_this.renderer.render(_this.scene, _this.camera);

			last = new Date().getTime();
		};
	};

	window.game = window.game || new Game();

})(window);