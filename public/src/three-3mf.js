"use strict";

function load3d(f) {
	JSZip = f;
	for (var i = 0; i < $(".3dobj").length; i++)
		load3dmloader(i);
}

function load3dmloader(i) {
	var camera, scene, renderer;

	init(i);

	function init(i) {
		renderer = new THREE.WebGLRenderer({
			antialias: true
		});
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(600, 480); //temp
		// document.body.appendChild(renderer.domElement);
		$(".3dobj")[i].appendChild(renderer.domElement);
		scene = new THREE.Scene();
		scene.background = new THREE.Color(0x333333);
		scene.add(new THREE.AmbientLight(0xffffff, 0.2));
		camera = new THREE.PerspectiveCamera(35, 600 / 400, 1, 500);
		// Z is up for objects intended to be 3D printed.
		camera.up.set(0, 0, 1);
		camera.position.set(-80, -90, 150);
		scene.add(camera);
		var pointLight = new THREE.PointLight(0xffffff, 0.8);
		camera.add(pointLight);

		var controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.addEventListener('change', render);
		controls.minDistance = 50;
		controls.maxDistance = 300;
		controls.enablePan = false;
		controls.target.set(80, 65, 20);
		controls.update();


		var loader = new THREE.ThreeMFLoader();
		// loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/3mf/cube_gears.3mf', function (object) {
		//loader.load('https://raw.githubusercontent.com/feilongfl/pic-bed/master/201711/%E9%A3%8E%E8%BD%A6.3mf', function (object) {
		console.log($(".3dobj")[i].id);
		loader.load($(".3dobj")[i].id, function (object) {
			scene.add(object);
			render();
		});


	}

	function render() {
		renderer.render(scene, camera);
	}
}


//three
var THREE, JSZip;
$(window).on('action:ajaxify.end', function () {
	require(['https://cdnjs.cloudflare.com/ajax/libs/three.js/88/three.min.js'], function (f) {
		THREE = f;

		//obj control
		////////////////////////////////////////////////////////////////////////////////////
		/**
		 * @author qiao / https://github.com/qiao
		 * @author mrdoob / http://mrdoob.com
		 * @author alteredq / http://alteredqualia.com/
		 * @author WestLangley / http://github.com/WestLangley
		 * @author erich666 / http://erichaines.com
		 */

		// This set of controls performs orbiting, dollying (zooming), and panning.
		// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
		//
		//    Orbit - left mouse / touch: one finger move
		//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
		//    Pan - right mouse, or arrow keys / touch: three finger swipe

		THREE.OrbitControls = function (object, domElement) {

			this.object = object;

			this.domElement = (domElement !== undefined) ? domElement : document;

			// Set to false to disable this control
			this.enabled = true;

			// "target" sets the location of focus, where the object orbits around
			this.target = new THREE.Vector3();

			// How far you can dolly in and out ( PerspectiveCamera only )
			this.minDistance = 0;
			this.maxDistance = Infinity;

			// How far you can zoom in and out ( OrthographicCamera only )
			this.minZoom = 0;
			this.maxZoom = Infinity;

			// How far you can orbit vertically, upper and lower limits.
			// Range is 0 to Math.PI radians.
			this.minPolarAngle = 0; // radians
			this.maxPolarAngle = Math.PI; // radians

			// How far you can orbit horizontally, upper and lower limits.
			// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
			this.minAzimuthAngle = -Infinity; // radians
			this.maxAzimuthAngle = Infinity; // radians

			// Set to true to enable damping (inertia)
			// If damping is enabled, you must call controls.update() in your animation loop
			this.enableDamping = false;
			this.dampingFactor = 0.25;

			// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
			// Set to false to disable zooming
			this.enableZoom = true;
			this.zoomSpeed = 1.0;

			// Set to false to disable rotating
			this.enableRotate = true;
			this.rotateSpeed = 1.0;

			// Set to false to disable panning
			this.enablePan = true;
			this.keyPanSpeed = 7.0; // pixels moved per arrow key push

			// Set to true to automatically rotate around the target
			// If auto-rotate is enabled, you must call controls.update() in your animation loop
			this.autoRotate = false;
			this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

			// Set to false to disable use of the keys
			this.enableKeys = true;

			// The four arrow keys
			this.keys = {
				LEFT: 37,
				UP: 38,
				RIGHT: 39,
				BOTTOM: 40
			};

			// Mouse buttons
			this.mouseButtons = {
				ORBIT: THREE.MOUSE.LEFT,
				ZOOM: THREE.MOUSE.MIDDLE,
				PAN: THREE.MOUSE.RIGHT
			};

			// for reset
			this.target0 = this.target.clone();
			this.position0 = this.object.position.clone();
			this.zoom0 = this.object.zoom;

			//
			// public methods
			//

			this.getPolarAngle = function () {

				return spherical.phi;

			};

			this.getAzimuthalAngle = function () {

				return spherical.theta;

			};

			this.saveState = function () {

				scope.target0.copy(scope.target);
				scope.position0.copy(scope.object.position);
				scope.zoom0 = scope.object.zoom;

			};

			this.reset = function () {

				scope.target.copy(scope.target0);
				scope.object.position.copy(scope.position0);
				scope.object.zoom = scope.zoom0;

				scope.object.updateProjectionMatrix();
				scope.dispatchEvent(changeEvent);

				scope.update();

				state = STATE.NONE;

			};

			// this method is exposed, but perhaps it would be better if we can make it private...
			this.update = function () {

				var offset = new THREE.Vector3();

				// so camera.up is the orbit axis
				var quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
				var quatInverse = quat.clone().inverse();

				var lastPosition = new THREE.Vector3();
				var lastQuaternion = new THREE.Quaternion();

				return function update() {

					var position = scope.object.position;

					offset.copy(position).sub(scope.target);

					// rotate offset to "y-axis-is-up" space
					offset.applyQuaternion(quat);

					// angle from z-axis around y-axis
					spherical.setFromVector3(offset);

					if (scope.autoRotate && state === STATE.NONE) {

						rotateLeft(getAutoRotationAngle());

					}

					spherical.theta += sphericalDelta.theta;
					spherical.phi += sphericalDelta.phi;

					// restrict theta to be between desired limits
					spherical.theta = Math.max(scope.minAzimuthAngle, Math.min(scope.maxAzimuthAngle, spherical.theta));

					// restrict phi to be between desired limits
					spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));

					spherical.makeSafe();


					spherical.radius *= scale;

					// restrict radius to be between desired limits
					spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));

					// move target to panned location
					scope.target.add(panOffset);

					offset.setFromSpherical(spherical);

					// rotate offset back to "camera-up-vector-is-up" space
					offset.applyQuaternion(quatInverse);

					position.copy(scope.target).add(offset);

					scope.object.lookAt(scope.target);

					if (scope.enableDamping === true) {

						sphericalDelta.theta *= (1 - scope.dampingFactor);
						sphericalDelta.phi *= (1 - scope.dampingFactor);

					} else {

						sphericalDelta.set(0, 0, 0);

					}

					scale = 1;
					panOffset.set(0, 0, 0);

					// update condition is:
					// min(camera displacement, camera rotation in radians)^2 > EPS
					// using small-angle approximation cos(x/2) = 1 - x^2 / 8

					if (zoomChanged ||
						lastPosition.distanceToSquared(scope.object.position) > EPS ||
						8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {

						scope.dispatchEvent(changeEvent);

						lastPosition.copy(scope.object.position);
						lastQuaternion.copy(scope.object.quaternion);
						zoomChanged = false;

						return true;

					}

					return false;

				};

			}();

			this.dispose = function () {

				scope.domElement.removeEventListener('contextmenu', onContextMenu, false);
				scope.domElement.removeEventListener('mousedown', onMouseDown, false);
				scope.domElement.removeEventListener('wheel', onMouseWheel, false);

				scope.domElement.removeEventListener('touchstart', onTouchStart, false);
				scope.domElement.removeEventListener('touchend', onTouchEnd, false);
				scope.domElement.removeEventListener('touchmove', onTouchMove, false);

				document.removeEventListener('mousemove', onMouseMove, false);
				document.removeEventListener('mouseup', onMouseUp, false);

				window.removeEventListener('keydown', onKeyDown, false);

				//scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

			};

			//
			// internals
			//

			var scope = this;

			var changeEvent = {
				type: 'change'
			};
			var startEvent = {
				type: 'start'
			};
			var endEvent = {
				type: 'end'
			};

			var STATE = {
				NONE: -1,
				ROTATE: 0,
				DOLLY: 1,
				PAN: 2,
				TOUCH_ROTATE: 3,
				TOUCH_DOLLY: 4,
				TOUCH_PAN: 5
			};

			var state = STATE.NONE;

			var EPS = 0.000001;

			// current position in spherical coordinates
			var spherical = new THREE.Spherical();
			var sphericalDelta = new THREE.Spherical();

			var scale = 1;
			var panOffset = new THREE.Vector3();
			var zoomChanged = false;

			var rotateStart = new THREE.Vector2();
			var rotateEnd = new THREE.Vector2();
			var rotateDelta = new THREE.Vector2();

			var panStart = new THREE.Vector2();
			var panEnd = new THREE.Vector2();
			var panDelta = new THREE.Vector2();

			var dollyStart = new THREE.Vector2();
			var dollyEnd = new THREE.Vector2();
			var dollyDelta = new THREE.Vector2();

			function getAutoRotationAngle() {

				return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

			}

			function getZoomScale() {

				return Math.pow(0.95, scope.zoomSpeed);

			}

			function rotateLeft(angle) {

				sphericalDelta.theta -= angle;

			}

			function rotateUp(angle) {

				sphericalDelta.phi -= angle;

			}

			var panLeft = function () {

				var v = new THREE.Vector3();

				return function panLeft(distance, objectMatrix) {

					v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
					v.multiplyScalar(-distance);

					panOffset.add(v);

				};

			}();

			var panUp = function () {

				var v = new THREE.Vector3();

				return function panUp(distance, objectMatrix) {

					v.setFromMatrixColumn(objectMatrix, 1); // get Y column of objectMatrix
					v.multiplyScalar(distance);

					panOffset.add(v);

				};

			}();

			// deltaX and deltaY are in pixels; right and down are positive
			var pan = function () {

				var offset = new THREE.Vector3();

				return function pan(deltaX, deltaY) {

					var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

					if (scope.object.isPerspectiveCamera) {

						// perspective
						var position = scope.object.position;
						offset.copy(position).sub(scope.target);
						var targetDistance = offset.length();

						// half of the fov is center to top of screen
						targetDistance *= Math.tan((scope.object.fov / 2) * Math.PI / 180.0);

						// we actually don't use screenWidth, since perspective camera is fixed to screen height
						panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix);
						panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix);

					} else if (scope.object.isOrthographicCamera) {

						// orthographic
						panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix);
						panUp(deltaY * (scope.object.top - scope.object.bottom) / scope.object.zoom / element.clientHeight, scope.object.matrix);

					} else {

						// camera neither orthographic nor perspective
						console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
						scope.enablePan = false;

					}

				};

			}();

			function dollyIn(dollyScale) {

				if (scope.object.isPerspectiveCamera) {

					scale /= dollyScale;

				} else if (scope.object.isOrthographicCamera) {

					scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale));
					scope.object.updateProjectionMatrix();
					zoomChanged = true;

				} else {

					console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
					scope.enableZoom = false;

				}

			}

			function dollyOut(dollyScale) {

				if (scope.object.isPerspectiveCamera) {

					scale *= dollyScale;

				} else if (scope.object.isOrthographicCamera) {

					scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale));
					scope.object.updateProjectionMatrix();
					zoomChanged = true;

				} else {

					console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
					scope.enableZoom = false;

				}

			}

			//
			// event callbacks - update the object state
			//

			function handleMouseDownRotate(event) {

				//console.log( 'handleMouseDownRotate' );

				rotateStart.set(event.clientX, event.clientY);

			}

			function handleMouseDownDolly(event) {

				//console.log( 'handleMouseDownDolly' );

				dollyStart.set(event.clientX, event.clientY);

			}

			function handleMouseDownPan(event) {

				//console.log( 'handleMouseDownPan' );

				panStart.set(event.clientX, event.clientY);

			}

			function handleMouseMoveRotate(event) {

				//console.log( 'handleMouseMoveRotate' );

				rotateEnd.set(event.clientX, event.clientY);
				rotateDelta.subVectors(rotateEnd, rotateStart);

				var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

				// rotating across whole screen goes 360 degrees around
				rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);

				// rotating up and down along whole screen attempts to go 360, but limited to 180
				rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);

				rotateStart.copy(rotateEnd);

				scope.update();

			}

			function handleMouseMoveDolly(event) {

				//console.log( 'handleMouseMoveDolly' );

				dollyEnd.set(event.clientX, event.clientY);

				dollyDelta.subVectors(dollyEnd, dollyStart);

				if (dollyDelta.y > 0) {

					dollyIn(getZoomScale());

				} else if (dollyDelta.y < 0) {

					dollyOut(getZoomScale());

				}

				dollyStart.copy(dollyEnd);

				scope.update();

			}

			function handleMouseMovePan(event) {

				//console.log( 'handleMouseMovePan' );

				panEnd.set(event.clientX, event.clientY);

				panDelta.subVectors(panEnd, panStart);

				pan(panDelta.x, panDelta.y);

				panStart.copy(panEnd);

				scope.update();

			}

			function handleMouseUp(event) {

				// console.log( 'handleMouseUp' );

			}

			function handleMouseWheel(event) {

				// console.log( 'handleMouseWheel' );

				if (event.deltaY < 0) {

					dollyOut(getZoomScale());

				} else if (event.deltaY > 0) {

					dollyIn(getZoomScale());

				}

				scope.update();

			}

			function handleKeyDown(event) {

				//console.log( 'handleKeyDown' );

				switch (event.keyCode) {

				case scope.keys.UP:
					pan(0, scope.keyPanSpeed);
					scope.update();
					break;

				case scope.keys.BOTTOM:
					pan(0, -scope.keyPanSpeed);
					scope.update();
					break;

				case scope.keys.LEFT:
					pan(scope.keyPanSpeed, 0);
					scope.update();
					break;

				case scope.keys.RIGHT:
					pan(-scope.keyPanSpeed, 0);
					scope.update();
					break;

				}

			}

			function handleTouchStartRotate(event) {

				//console.log( 'handleTouchStartRotate' );

				rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);

			}

			function handleTouchStartDolly(event) {

				//console.log( 'handleTouchStartDolly' );

				var dx = event.touches[0].pageX - event.touches[1].pageX;
				var dy = event.touches[0].pageY - event.touches[1].pageY;

				var distance = Math.sqrt(dx * dx + dy * dy);

				dollyStart.set(0, distance);

			}

			function handleTouchStartPan(event) {

				//console.log( 'handleTouchStartPan' );

				panStart.set(event.touches[0].pageX, event.touches[0].pageY);

			}

			function handleTouchMoveRotate(event) {

				//console.log( 'handleTouchMoveRotate' );

				rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
				rotateDelta.subVectors(rotateEnd, rotateStart);

				var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

				// rotating across whole screen goes 360 degrees around
				rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);

				// rotating up and down along whole screen attempts to go 360, but limited to 180
				rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);

				rotateStart.copy(rotateEnd);

				scope.update();

			}

			function handleTouchMoveDolly(event) {

				//console.log( 'handleTouchMoveDolly' );

				var dx = event.touches[0].pageX - event.touches[1].pageX;
				var dy = event.touches[0].pageY - event.touches[1].pageY;

				var distance = Math.sqrt(dx * dx + dy * dy);

				dollyEnd.set(0, distance);

				dollyDelta.subVectors(dollyEnd, dollyStart);

				if (dollyDelta.y > 0) {

					dollyOut(getZoomScale());

				} else if (dollyDelta.y < 0) {

					dollyIn(getZoomScale());

				}

				dollyStart.copy(dollyEnd);

				scope.update();

			}

			function handleTouchMovePan(event) {

				//console.log( 'handleTouchMovePan' );

				panEnd.set(event.touches[0].pageX, event.touches[0].pageY);

				panDelta.subVectors(panEnd, panStart);

				pan(panDelta.x, panDelta.y);

				panStart.copy(panEnd);

				scope.update();

			}

			function handleTouchEnd(event) {

				//console.log( 'handleTouchEnd' );

			}

			//
			// event handlers - FSM: listen for events and reset state
			//

			function onMouseDown(event) {

				if (scope.enabled === false) return;

				event.preventDefault();

				switch (event.button) {

				case scope.mouseButtons.ORBIT:

					if (scope.enableRotate === false) return;

					handleMouseDownRotate(event);

					state = STATE.ROTATE;

					break;

				case scope.mouseButtons.ZOOM:

					if (scope.enableZoom === false) return;

					handleMouseDownDolly(event);

					state = STATE.DOLLY;

					break;

				case scope.mouseButtons.PAN:

					if (scope.enablePan === false) return;

					handleMouseDownPan(event);

					state = STATE.PAN;

					break;

				}

				if (state !== STATE.NONE) {

					document.addEventListener('mousemove', onMouseMove, false);
					document.addEventListener('mouseup', onMouseUp, false);

					scope.dispatchEvent(startEvent);

				}

			}

			function onMouseMove(event) {

				if (scope.enabled === false) return;

				event.preventDefault();

				switch (state) {

				case STATE.ROTATE:

					if (scope.enableRotate === false) return;

					handleMouseMoveRotate(event);

					break;

				case STATE.DOLLY:

					if (scope.enableZoom === false) return;

					handleMouseMoveDolly(event);

					break;

				case STATE.PAN:

					if (scope.enablePan === false) return;

					handleMouseMovePan(event);

					break;

				}

			}

			function onMouseUp(event) {

				if (scope.enabled === false) return;

				handleMouseUp(event);

				document.removeEventListener('mousemove', onMouseMove, false);
				document.removeEventListener('mouseup', onMouseUp, false);

				scope.dispatchEvent(endEvent);

				state = STATE.NONE;

			}

			function onMouseWheel(event) {

				if (scope.enabled === false || scope.enableZoom === false || (state !== STATE.NONE && state !== STATE.ROTATE)) return;

				event.preventDefault();
				event.stopPropagation();

				handleMouseWheel(event);

				scope.dispatchEvent(startEvent); // not sure why these are here...
				scope.dispatchEvent(endEvent);

			}

			function onKeyDown(event) {

				if (scope.enabled === false || scope.enableKeys === false || scope.enablePan === false) return;

				handleKeyDown(event);

			}

			function onTouchStart(event) {

				if (scope.enabled === false) return;

				switch (event.touches.length) {

				case 1: // one-fingered touch: rotate

					if (scope.enableRotate === false) return;

					handleTouchStartRotate(event);

					state = STATE.TOUCH_ROTATE;

					break;

				case 2: // two-fingered touch: dolly

					if (scope.enableZoom === false) return;

					handleTouchStartDolly(event);

					state = STATE.TOUCH_DOLLY;

					break;

				case 3: // three-fingered touch: pan

					if (scope.enablePan === false) return;

					handleTouchStartPan(event);

					state = STATE.TOUCH_PAN;

					break;

				default:

					state = STATE.NONE;

				}

				if (state !== STATE.NONE) {

					scope.dispatchEvent(startEvent);

				}

			}

			function onTouchMove(event) {

				if (scope.enabled === false) return;

				event.preventDefault();
				event.stopPropagation();

				switch (event.touches.length) {

				case 1: // one-fingered touch: rotate

					if (scope.enableRotate === false) return;
					if (state !== STATE.TOUCH_ROTATE) return; // is this needed?...

					handleTouchMoveRotate(event);

					break;

				case 2: // two-fingered touch: dolly

					if (scope.enableZoom === false) return;
					if (state !== STATE.TOUCH_DOLLY) return; // is this needed?...

					handleTouchMoveDolly(event);

					break;

				case 3: // three-fingered touch: pan

					if (scope.enablePan === false) return;
					if (state !== STATE.TOUCH_PAN) return; // is this needed?...

					handleTouchMovePan(event);

					break;

				default:

					state = STATE.NONE;

				}

			}

			function onTouchEnd(event) {

				if (scope.enabled === false) return;

				handleTouchEnd(event);

				scope.dispatchEvent(endEvent);

				state = STATE.NONE;

			}

			function onContextMenu(event) {

				if (scope.enabled === false) return;

				event.preventDefault();

			}

			//

			scope.domElement.addEventListener('contextmenu', onContextMenu, false);

			scope.domElement.addEventListener('mousedown', onMouseDown, false);
			scope.domElement.addEventListener('wheel', onMouseWheel, false);

			scope.domElement.addEventListener('touchstart', onTouchStart, false);
			scope.domElement.addEventListener('touchend', onTouchEnd, false);
			scope.domElement.addEventListener('touchmove', onTouchMove, false);

			window.addEventListener('keydown', onKeyDown, false);

			// force an update at start

			this.update();

		};

		THREE.OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype);
		THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;

		Object.defineProperties(THREE.OrbitControls.prototype, {

			center: {

				get: function () {

					console.warn('THREE.OrbitControls: .center has been renamed to .target');
					return this.target;

				}

			},

			// backward compatibility

			noZoom: {

				get: function () {

					console.warn('THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.');
					return !this.enableZoom;

				},

				set: function (value) {

					console.warn('THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.');
					this.enableZoom = !value;

				}

			},

			noRotate: {

				get: function () {

					console.warn('THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.');
					return !this.enableRotate;

				},

				set: function (value) {

					console.warn('THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.');
					this.enableRotate = !value;

				}

			},

			noPan: {

				get: function () {

					console.warn('THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.');
					return !this.enablePan;

				},

				set: function (value) {

					console.warn('THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.');
					this.enablePan = !value;

				}

			},

			noKeys: {

				get: function () {

					console.warn('THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.');
					return !this.enableKeys;

				},

				set: function (value) {

					console.warn('THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.');
					this.enableKeys = !value;

				}

			},

			staticMoving: {

				get: function () {

					console.warn('THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.');
					return !this.enableDamping;

				},

				set: function (value) {

					console.warn('THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.');
					this.enableDamping = !value;

				}

			},

			dynamicDampingFactor: {

				get: function () {

					console.warn('THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.');
					return this.dampingFactor;

				},

				set: function (value) {

					console.warn('THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.');
					this.dampingFactor = value;

				}

			}

		});

		////////////////////////////////////////////////////////////////////////////////////

		//3mf loader
		///////////////////////////////////////////////////////////////////////////////////
		/**
		 * @author technohippy / https://github.com/technohippy
		 */

		THREE.ThreeMFLoader = function (manager) {

			this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;
			this.availableExtensions = [];

		};

		THREE.ThreeMFLoader.prototype = {

			constructor: THREE.ThreeMFLoader,

			load: function (url, onLoad, onProgress, onError) {

				var scope = this;
				var loader = new THREE.FileLoader(scope.manager);
				loader.setResponseType('arraybuffer');
				loader.load(url, function (buffer) {

					onLoad(scope.parse(buffer));

				}, onProgress, onError);

			},

			parse: function (data) {

				var scope = this;

				function loadDocument(data) {

					var zip = null;
					var file = null;

					var relsName;
					var modelPartNames = [];
					var printTicketPartNames = [];
					var texturesPartNames = [];
					var otherPartNames = [];

					var rels;
					var modelParts = {};
					var printTicketParts = {};
					var texturesParts = {};
					var otherParts = {};

					try {
						zip = new JSZip(data); // eslint-disable-line no-undef
					} catch (e) {

						if (e instanceof ReferenceError) {

							console.error('THREE.ThreeMFLoader: jszip missing and file is compressed.');
							return null;

						}

					}

					for (file in zip.files) {

						if (file.match(/\.rels$/)) {

							relsName = file;

						} else if (file.match(/^3D\/.*\.model$/)) {

							modelPartNames.push(file);

						} else if (file.match(/^3D\/Metadata\/.*\.xml$/)) {

							printTicketPartNames.push(file);

						} else if (file.match(/^3D\/Textures\/.*/)) {

							texturesPartNames.push(file);

						} else if (file.match(/^3D\/Other\/.*/)) {

							otherPartNames.push(file);

						}

					}

					if (window.TextDecoder === undefined) {

						console.error('THREE.ThreeMFLoader: TextDecoder not present. Please use a TextDecoder polyfill.');
						return null;

					}

					var relsView = new DataView(zip.file(relsName).asArrayBuffer());
					var relsFileText = new TextDecoder('utf-8').decode(relsView);
					rels = parseRelsXml(relsFileText);

					for (var i = 0; i < modelPartNames.length; i++) {

						var modelPart = modelPartNames[i];
						var view = new DataView(zip.file(modelPart).asArrayBuffer());

						var fileText = new TextDecoder('utf-8').decode(view);
						var xmlData = new DOMParser().parseFromString(fileText, 'application/xml');

						if (xmlData.documentElement.nodeName.toLowerCase() !== 'model') {

							console.error('THREE.ThreeMFLoader: Error loading 3MF - no 3MF document found: ', modelPart);

						}

						var modelNode = xmlData.querySelector('model');
						var extensions = {};

						for (var i = 0; i < modelNode.attributes.length; i++) {

							var attr = modelNode.attributes[i];
							if (attr.name.match(/^xmlns:(.+)$/)) {

								extensions[attr.value] = RegExp.$1;

							}

						}

						var modelData = parseModelNode(modelNode);
						modelData['xml'] = modelNode;

						if (0 < Object.keys(extensions).length) {

							modelData['extensions'] = extensions;

						}

						modelParts[modelPart] = modelData;

					}

					for (var i = 0; i < texturesPartNames.length; i++) {

						var texturesPartName = texturesPartNames[i];
						texturesParts[texturesPartName] = zip.file(texturesPartName).asBinary();

					}

					return {
						rels: rels,
						model: modelParts,
						printTicket: printTicketParts,
						texture: texturesParts,
						other: otherParts
					};

				}

				function parseRelsXml(relsFileText) {

					var relsXmlData = new DOMParser().parseFromString(relsFileText, 'application/xml');
					var relsNode = relsXmlData.querySelector('Relationship');
					var target = relsNode.getAttribute('Target');
					var id = relsNode.getAttribute('Id');
					var type = relsNode.getAttribute('Type');

					return {
						target: target,
						id: id,
						type: type
					};

				}

				function parseMetadataNodes(metadataNodes) {

					var metadataData = {};

					for (var i = 0; i < metadataNodes.length; i++) {

						var metadataNode = metadataNodes[i];
						var name = metadataNode.getAttribute('name');
						var validNames = [
							'Title',
							'Designer',
							'Description',
							'Copyright',
							'LicenseTerms',
							'Rating',
							'CreationDate',
							'ModificationDate'
						];

						if (0 <= validNames.indexOf(name)) {

							metadataData[name] = metadataNode.textContent;

						}

					}

					return metadataData;

				}

				function parseBasematerialsNode(basematerialsNode) {}

				function parseMeshNode(meshNode, extensions) {

					var meshData = {};

					var vertices = [];
					var vertexNodes = meshNode.querySelectorAll('vertices vertex');

					for (var i = 0; i < vertexNodes.length; i++) {

						var vertexNode = vertexNodes[i];
						var x = vertexNode.getAttribute('x');
						var y = vertexNode.getAttribute('y');
						var z = vertexNode.getAttribute('z');

						vertices.push(parseFloat(x), parseFloat(y), parseFloat(z));

					}

					meshData['vertices'] = new Float32Array(vertices.length);

					for (var i = 0; i < vertices.length; i++) {

						meshData['vertices'][i] = vertices[i];

					}

					var triangleProperties = [];
					var triangles = [];
					var triangleNodes = meshNode.querySelectorAll('triangles triangle');

					for (var i = 0; i < triangleNodes.length; i++) {

						var triangleNode = triangleNodes[i];
						var v1 = triangleNode.getAttribute('v1');
						var v2 = triangleNode.getAttribute('v2');
						var v3 = triangleNode.getAttribute('v3');
						var p1 = triangleNode.getAttribute('p1');
						var p2 = triangleNode.getAttribute('p2');
						var p3 = triangleNode.getAttribute('p3');
						var pid = triangleNode.getAttribute('pid');

						triangles.push(parseInt(v1, 10), parseInt(v2, 10), parseInt(v3, 10));

						var triangleProperty = {};

						if (p1) {

							triangleProperty['p1'] = parseInt(p1, 10);

						}

						if (p2) {

							triangleProperty['p2'] = parseInt(p2, 10);

						}

						if (p3) {

							triangleProperty['p3'] = parseInt(p3, 10);

						}

						if (pid) {

							triangleProperty['pid'] = pid;

						}

						if (0 < Object.keys(triangleProperty).length) {

							triangleProperties.push(triangleProperty);

						}

					}

					meshData['triangleProperties'] = triangleProperties;
					meshData['triangles'] = new Uint32Array(triangles.length);

					for (var i = 0; i < triangles.length; i++) {

						meshData['triangles'][i] = triangles[i];

					}

					return meshData;

				}

				function parseComponentsNode(componentsNode) {

				}

				function parseObjectNode(objectNode) {

					var objectData = {
						type: objectNode.getAttribute('type')
					};

					var id = objectNode.getAttribute('id');

					if (id) {

						objectData['id'] = id;

					}

					var pid = objectNode.getAttribute('pid');

					if (pid) {

						objectData['pid'] = pid;

					}

					var pindex = objectNode.getAttribute('pindex');

					if (pindex) {

						objectData['pindex'] = pindex;

					}

					var thumbnail = objectNode.getAttribute('thumbnail');

					if (thumbnail) {

						objectData['thumbnail'] = thumbnail;

					}

					var partnumber = objectNode.getAttribute('partnumber');

					if (partnumber) {

						objectData['partnumber'] = partnumber;

					}

					var name = objectNode.getAttribute('name');

					if (name) {

						objectData['name'] = name;

					}

					var meshNode = objectNode.querySelector('mesh');

					if (meshNode) {

						objectData['mesh'] = parseMeshNode(meshNode);

					}

					var componentsNode = objectNode.querySelector('components');

					if (componentsNode) {

						objectData['components'] = parseComponentsNode(componentsNode);

					}

					return objectData;

				}

				function parseResourcesNode(resourcesNode) {

					var resourcesData = {};
					var basematerialsNode = resourcesNode.querySelector('basematerials');

					if (basematerialsNode) {

						resourcesData['basematerial'] = parseBasematerialsNode(basematerialsNode);

					}

					resourcesData['object'] = {};
					var objectNodes = resourcesNode.querySelectorAll('object');

					for (var i = 0; i < objectNodes.length; i++) {

						var objectNode = objectNodes[i];
						var objectData = parseObjectNode(objectNode);
						resourcesData['object'][objectData['id']] = objectData;

					}

					return resourcesData;

				}

				function parseBuildNode(buildNode) {

					var buildData = [];
					var itemNodes = buildNode.querySelectorAll('item');

					for (var i = 0; i < itemNodes.length; i++) {

						var itemNode = itemNodes[i];
						var buildItem = {
							objectid: itemNode.getAttribute('objectid')
						};
						var transform = itemNode.getAttribute('transform');

						if (transform) {

							var t = [];
							transform.split(' ').forEach(function (s) {

								t.push(parseFloat(s));

							});
							var mat4 = new THREE.Matrix4();
							buildItem['transform'] = mat4.set(
								t[0], t[3], t[6], t[9],
								t[1], t[4], t[7], t[10],
								t[2], t[5], t[8], t[11],
								0.0, 0.0, 0.0, 1.0
							);

						}

						buildData.push(buildItem);

					}

					return buildData;

				}

				function parseModelNode(modelNode) {

					var modelData = {
						unit: modelNode.getAttribute('unit') || 'millimeter'
					};
					var metadataNodes = modelNode.querySelectorAll('metadata');

					if (metadataNodes) {

						modelData['metadata'] = parseMetadataNodes(metadataNodes);

					}

					var resourcesNode = modelNode.querySelector('resources');

					if (resourcesNode) {

						modelData['resources'] = parseResourcesNode(resourcesNode);

					}

					var buildNode = modelNode.querySelector('build');

					if (buildNode) {

						modelData['build'] = parseBuildNode(buildNode);

					}

					return modelData;

				}

				function buildMesh(meshData, data3mf) {

					var geometry = new THREE.BufferGeometry();
					geometry.setIndex(new THREE.BufferAttribute(meshData['triangles'], 1));
					geometry.addAttribute('position', new THREE.BufferAttribute(meshData['vertices'], 3));

					if (meshData['colors']) {

						geometry.addAttribute('color', new THREE.BufferAttribute(meshData['colors'], 3));

					}

					geometry.computeBoundingSphere();

					var materialOpts = {
						flatShading: true
					};

					if (meshData['colors'] && 0 < meshData['colors'].length) {

						materialOpts['vertexColors'] = THREE.VertexColors;

					} else {

						materialOpts['color'] = 0xaaaaff;

					}

					var material = new THREE.MeshPhongMaterial(materialOpts);
					return new THREE.Mesh(geometry, material);

				}

				function applyExtensions(extensions, meshData, modelXml, data3mf) {

					if (!extensions) {

						return;

					}

					var availableExtensions = [];
					var keys = Object.keys(extensions);

					for (var i = 0; i < keys.length; i++) {

						var ns = keys[i];

						for (var j = 0; j < scope.availableExtensions.length; j++) {

							var extension = scope.availableExtensions[j];

							if (extension.ns === ns) {

								availableExtensions.push(extension);

							}

						}

					}

					for (var i = 0; i < availableExtensions.length; i++) {

						var extension = availableExtensions[i];
						extension.apply(modelXml, extensions[extension['ns']], meshData);

					}

				}

				function buildMeshes(data3mf) {

					var modelsData = data3mf.model;
					var meshes = {};
					var modelsKeys = Object.keys(modelsData);

					for (var i = 0; i < modelsKeys.length; i++) {

						var modelsKey = modelsKeys[i];
						var modelData = modelsData[modelsKey];
						var modelXml = modelData['xml'];
						var extensions = modelData['extensions'];

						var objectIds = Object.keys(modelData['resources']['object']);

						for (var j = 0; j < objectIds.length; j++) {

							var objectId = objectIds[j];
							var objectData = modelData['resources']['object'][objectId];
							var meshData = objectData['mesh'];
							applyExtensions(extensions, meshData, modelXml, data3mf);
							meshes[objectId] = buildMesh(meshData, data3mf);

						}

					}

					return meshes;

				}

				function build(meshes, refs, data3mf) {

					var group = new THREE.Group();
					var buildData = data3mf.model[refs['target'].substring(1)]['build'];

					for (var i = 0; i < buildData.length; i++) {

						var buildItem = buildData[i];
						var mesh = meshes[buildItem['objectid']];

						if (buildItem['transform']) {

							mesh.geometry.applyMatrix(buildItem['transform']);

						}

						group.add(mesh);

					}

					return group;

				}

				var data3mf = loadDocument(data);
				var meshes = buildMeshes(data3mf);

				return build(meshes, data3mf['rels'], data3mf);

			},

			addExtension: function (extension) {

				this.availableExtensions.push(extension);

			}

		};

		///////////////////////////////////////////////////////////////////////////////////

		if (!Detector.webgl) Detector.addGetWebGLMessage();
		require(['https://cdnjs.cloudflare.com/ajax/libs/jszip/2.6.1/jszip.min.js'], load3d);
	});
});
