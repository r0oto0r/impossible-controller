import React, { useEffect } from "react";
import { createSelector } from 'reselect'
import { RootState } from "../../store/store";
import * as THREE from 'three';
import { vec3 } from "gl-matrix";
import { LeapHand, LeapHandControllerInput, LeapHandType, LeapVector } from "../../common/LeapInterfaces";
import { useAppSelector } from "../../hooks/general";
import { SocketClient } from "../../socket/SocketClient";
import { useParams } from "react-router-dom";
import { LeapSocketClient } from '../../socket/LeapSocketClient';

const boxWidth = 70;
const millisHandHasToBeClosed = 50;
const millisHandHasToBeAboveBar = 50;

LeapSocketClient.init();

function LeapHandsVisualizer(): JSX.Element {
	const { type } = useParams();
	const selectHandNumberOfHands = ({ leapTracking: state }: RootState) => {
		return state.hands?.length;
	}
	const selectHands = ({ leapTracking: state }: RootState) => state.hands
	const canvasRef = React.useRef<HTMLCanvasElement>(null);
	const rafId = React.useRef<number>(0);
	const lastTic = React.useRef<number>(0);

	const leftHandClosed = React.useRef<boolean>(false);
	const rightHandClosed = React.useRef<boolean>(false);
	const handsTouch = React.useRef<boolean>(false);
	const barTouchedLastHand = React.useRef<LeapHandType>(LeapHandType.RIGHT);
	const barTouched = React.useRef<boolean>(false);
	const leftHandHight = React.useRef<number>(0);
	const rightHandHight = React.useRef<number>(0);
	const leftHandClosedSince = React.useRef<number>(0);
	const rightHandClosedSince = React.useRef<number>(0);
	const leftHandAboveBarSince = React.useRef<number>(0);
	const rightHandAboveBarSince = React.useRef<number>(0);

	const scene = React.useRef<THREE.Scene | undefined>(undefined);
	const camera = React.useRef<THREE.PerspectiveCamera>(new THREE.PerspectiveCamera());
	const renderer = React.useRef<THREE.WebGLRenderer | undefined>(undefined);

	const leftHandFingers = React.useRef<Array<Array<THREE.Mesh>>>(new Array<Array<THREE.Mesh>>());
	const leftHandFingerTips = React.useRef<Array<THREE.Box3>>(new Array<THREE.Box3>());
	const rightHandFingers = React.useRef<Array<Array<THREE.Mesh>>>(new Array<Array<THREE.Mesh>>());
	const rightHandFingerTips = React.useRef<Array<THREE.Box3>>(new Array<THREE.Box3>());
	const leftHandCube = React.useRef<THREE.Mesh>(new THREE.Mesh());
	const rightHandCube = React.useRef<THREE.Mesh>(new THREE.Mesh());
	const heightBarCubeBox = React.useRef<THREE.Box3>(new THREE.Box3());
	const heightBarCube = React.useRef<THREE.Mesh>(new THREE.Mesh());
	const leapHands = React.useRef<Array<LeapHand>>(new Array<LeapHand>());

	const groundMesh = React.useRef<THREE.Mesh>(new THREE.Mesh());
	const frontMesh = React.useRef<THREE.Mesh>(new THREE.Mesh());
	const leftMesh = React.useRef<THREE.Mesh>(new THREE.Mesh());
	const rightMesh = React.useRef<THREE.Mesh>(new THREE.Mesh());

	const selectNumberAndHands = createSelector(
		[selectHandNumberOfHands, selectHands],
		(numberOfHands, hands) => {
			leapHands.current = hands ? hands : null;
			return numberOfHands ? numberOfHands > 0 : false;
		}
	);

	const lastLeapHandsControllerInput = React.useRef<LeapHandControllerInput>({
		leftHandClosed: false,
		rightHandClosed: false,
		bothHandsClosed: false,
		handsTouch: false,
		barTouchedLastHand: undefined,
		leftHandAboveBar: false,
		rightHandAboveBar: false,
		bothHandsAboveBar: false
	});

	useAppSelector(selectNumberAndHands);

	cancelAnimationFrame(rafId.current);

	useEffect(() => {
		if(!scene.current) {
			initScene();
		} else if(scene.current && camera.current) {
			renderer.current?.render(scene.current, camera.current);
		}
		lastTic.current = performance.now();
		rafId.current = requestAnimationFrame(draw.bind(LeapHandsVisualizer));
	});

	function initScene() {
		scene.current = new THREE.Scene();
		scene.current.fog = new THREE.Fog(0x000000, 5, 2000);

		renderer.current = new THREE.WebGLRenderer({ canvas: canvasRef.current ? canvasRef.current : undefined, antialias: true });
		renderer.current.setClearColor(0xf2f2f2);
		renderer.current.shadowMap.enabled = true;
		renderer.current.shadowMap.type = THREE.PCFSoftShadowMap;

		const width = canvasRef.current?.width ? canvasRef.current?.width : 1;
		const height = canvasRef.current?.height ? canvasRef.current?.height : 1;

		camera.current = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
		camera.current.rotateX(-28 * Math.PI / 180);
		camera.current.position.set(0, 500, 500);

		const groundPlane = new THREE.PlaneGeometry(1000, 1000);
		const groundMat = new THREE.MeshStandardMaterial({ color: 0x282c34 });
		groundMesh.current = new THREE.Mesh(groundPlane, groundMat);
		groundMesh.current.position.y = 30
		groundMesh.current.receiveShadow = true;
		groundMesh.current.rotateX(-90 * Math.PI / 180);
		scene.current.add(groundMesh.current);

		const frontPlane = new THREE.PlaneGeometry(1000, 1000);
		const frontMat = new THREE.MeshStandardMaterial({ color: 0x282c34 });
		frontMesh.current = new THREE.Mesh(frontPlane, frontMat);
		frontMesh.current.position.y = 30
		frontMesh.current.position.z = -350
		frontMesh.current.receiveShadow = true;
		scene.current.add(frontMesh.current);

		const leftPlane = new THREE.PlaneGeometry(1000, 1000);
		const leftMat = new THREE.MeshStandardMaterial({ color: 0x282c34 });
		leftMesh.current = new THREE.Mesh(leftPlane, leftMat);
		leftMesh.current.position.y = 30
		leftMesh.current.position.x = -500
		leftMesh.current.rotateY(65 * Math.PI / 180)
		leftMesh.current.rotateX(7 * Math.PI / 180)
		leftMesh.current.receiveShadow = true;
		scene.current.add(leftMesh.current);

		const rightPlane = new THREE.PlaneGeometry(1000, 1000);
		const rightMat = new THREE.MeshStandardMaterial({ color: 0x282c34 });
		rightMesh.current = new THREE.Mesh(rightPlane, rightMat);
		rightMesh.current.position.y = 30;
		rightMesh.current.position.x = 500;
		rightMesh.current.rotateY(-65 * Math.PI / 180);
		rightMesh.current.rotateX(7 * Math.PI / 180);
		rightMesh.current.receiveShadow = true;
		scene.current.add(rightMesh.current);

		const heightBarGeometry = new THREE.BoxGeometry(200, 15, 50);
		const heightBarMaterial = new THREE.MeshStandardMaterial({ color: 0xff00ff });
		heightBarCube.current = new THREE.Mesh(heightBarGeometry, heightBarMaterial);
		heightBarCube.current.position.set(0, 300 - 15, -100);
		heightBarCube.current.castShadow = true;
		heightBarCube.current.receiveShadow = true;
		scene.current.add(heightBarCube.current);

		const leftHandGeometry = new THREE.BoxGeometry(boxWidth, boxWidth, boxWidth);
		const leftHandMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
		leftHandCube.current = new THREE.Mesh(leftHandGeometry, leftHandMaterial);
		leftHandCube.current.castShadow = true;
		scene.current.add(leftHandCube.current);

		const { fingers: createdLeftHandFingers, fingerTips: createdLeftHandFingerTips } = createFingerObjects();
		leftHandFingers.current = createdLeftHandFingers;
		leftHandFingerTips.current = createdLeftHandFingerTips;
		leftHandFingers.current.forEach(finger => finger.forEach(fingerBone => scene.current?.add(fingerBone)));

		const rightHandGeometry = new THREE.BoxGeometry(boxWidth, boxWidth, boxWidth);
		const rightHandMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
		rightHandCube.current = new THREE.Mesh(rightHandGeometry, rightHandMaterial);
		rightHandCube.current.castShadow = true;
		scene.current.add(rightHandCube.current);

		const { fingers: createdRightHandFingers, fingerTips: createdRightHandFingerTips }  = createFingerObjects();
		rightHandFingers.current = createdRightHandFingers;
		rightHandFingerTips.current = createdRightHandFingerTips;
		rightHandFingers.current.forEach(finger => finger.forEach(fingerBone => scene.current?.add(fingerBone)));

		const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
		dirLight1.position.set(0, 1000, 800);
		dirLight1.target.position.set(groundMesh.current.position.x, groundMesh.current.position.y, groundMesh.current.position.z);
		dirLight1.shadow.mapSize.width = 1000;
		dirLight1.shadow.mapSize.height = 1000;
		dirLight1.shadow.camera.left = -500;
		dirLight1.shadow.camera.right = 500;
		dirLight1.shadow.camera.top = 500;
		dirLight1.shadow.camera.bottom = -500;
		dirLight1.shadow.camera.near = 1;
		dirLight1.shadow.camera.far = 1500;
		dirLight1.castShadow = true;
		scene.current.add(dirLight1);

		const ambiLight = new THREE.AmbientLight(0xc2c2c2, 0.2);
		ambiLight.position.set(0, 0, 800);
		scene.current.add(ambiLight);
	}

	function distance(prevJoint: LeapVector, nextJoint: LeapVector) {
		const prevJointVec3 = vec3.fromValues(prevJoint.x, prevJoint.y, prevJoint.z);
		const nextJointVec3 = vec3.fromValues(nextJoint.x, nextJoint.y, nextJoint.z);

		return vec3.distance(prevJointVec3, nextJointVec3);
	}

	function createFingerObjects() {
		const fingers: Array<Array<THREE.Mesh>> = new Array<Array<THREE.Mesh>>();
		const fingerTips: Array<THREE.Box3> = new Array<THREE.Box3>();

		for(let i = 0; i < 5; ++i) {
			const numBones = i === 0 ? 3 : 4;
			const fingerGeometry = new THREE.CylinderGeometry(1, 1, 1, 12, 1, false);
			const fingerMaterial = new THREE.MeshStandardMaterial({ color: 0x2596be });

			const fingerBones = new Array<THREE.Mesh>();
			for(let j = 0; j < numBones; j++) {
					const fingerBone = new THREE.Mesh(fingerGeometry.clone(), fingerMaterial.clone());
					fingerBone.castShadow = true;
					fingerBones.push(fingerBone);
			}
			const fingerTipBox = new THREE.Box3();

			fingerTips.push(fingerTipBox);
			fingers.push(fingerBones);
		}
		return { fingers, fingerTips };
	}

	function cubesCollide(cubeOne: THREE.Mesh, cubeTwo: THREE.Mesh): boolean {
		const cubeOneBox = new THREE.Box3().setFromObject(cubeOne);
		const cubeTwoBox = new THREE.Box3().setFromObject(cubeTwo);
		return cubeOneBox.intersectsBox(cubeTwoBox);	
	}

	function sendHandControllerInput() {
		let leapHandControllerInput: LeapHandControllerInput = {
			leftHandClosed: false,
			rightHandClosed: false,
			bothHandsClosed: false,
			handsTouch: false,
			barTouchedLastHand: undefined,
			leftHandAboveBar: false,
			rightHandAboveBar: false,
			bothHandsAboveBar: false
		};

		if(leftHandClosed.current && !rightHandClosed.current) {
			if(leftHandClosedSince.current === 0) {
				leftHandClosedSince.current = performance.now();
			}
			if((performance.now() - leftHandClosedSince.current > millisHandHasToBeClosed) && !rightHandClosed.current) {
				leapHandControllerInput.leftHandClosed = true;
				if(leftHandCube.current) {
					(leftHandCube.current as any).material.color.setHex(0x00ff00);
				}
			}
		} else {
			leftHandClosedSince.current = 0;
			if(leftHandCube.current) {
				(leftHandCube.current as any).material.color.setHex(0xff0000);
			}
		}

		if(rightHandClosed.current && !leftHandClosed.current) {
			if(rightHandClosedSince.current === 0) {
				rightHandClosedSince.current = performance.now();
			}
			if((performance.now() - rightHandClosedSince.current > millisHandHasToBeClosed) && !leftHandClosed.current) {
				leapHandControllerInput.rightHandClosed = true;
				if(rightHandCube.current) {
					(rightHandCube.current as any).material.color.setHex(0x00ff00);
				}
			}
		} else {
			rightHandClosedSince.current = 0;
			if(rightHandCube.current) {
				(rightHandCube.current as any).material.color.setHex(0x0000ff);
			}
		}

		if(leftHandClosed.current && rightHandClosed.current) {
			if(leftHandCube.current && rightHandCube.current) {
				(leftHandCube.current as any).material.color.setHex(0xffff00);
				(rightHandCube.current as any).material.color.setHex(0xffff00);
			}
			leapHandControllerInput.bothHandsClosed = true;
		} else if (leapHandControllerInput.leftHandClosed === false && leapHandControllerInput.rightHandClosed === false) {
			if(leftHandCube.current && rightHandCube.current) {
				(leftHandCube.current as any).material.color.setHex(0xff0000);
				(rightHandCube.current as any).material.color.setHex(0x0000ff);
			}
		}

		if(leftHandHight.current > 300) {
			if(leftHandAboveBarSince.current === 0) {
				leftHandAboveBarSince.current = performance.now();
			}
			if(performance.now() - leftHandAboveBarSince.current > millisHandHasToBeAboveBar && rightHandHight.current <= 300) {
				leapHandControllerInput.leftHandAboveBar = true;
				(heightBarCube.current as any).material.color.setHex(0xff00ff);
			}
		} else {
			leftHandAboveBarSince.current = 0;
			(heightBarCube.current as any).material.color.setHex(0xffffff);
		}

		if(rightHandHight.current > 300) {
			if(rightHandAboveBarSince.current === 0) {
				rightHandAboveBarSince.current = performance.now();
			}
			if(performance.now() - rightHandAboveBarSince.current > millisHandHasToBeAboveBar && leftHandHight.current <= 300) {
				leapHandControllerInput.rightHandAboveBar = true;
				(heightBarCube.current as any).material.color.setHex(0xff00ff);
			}
		} else if (leapHandControllerInput.leftHandAboveBar === false) {
			rightHandAboveBarSince.current = 0;
			(heightBarCube.current as any).material.color.setHex(0xffffff);
		}

		if(leftHandHight.current > 300 && rightHandHight.current > 300) {
			leapHandControllerInput.bothHandsAboveBar = true;
			(heightBarCube.current as any).material.color.setHex(0x00ff00);
		} else if (leapHandControllerInput.leftHandAboveBar === false && leapHandControllerInput.rightHandAboveBar === false) {
			(heightBarCube.current as any).material.color.setHex(0xffffff);
		}

		if(leapHandControllerInput.leftHandClosed !== lastLeapHandsControllerInput.current.leftHandClosed ||
			leapHandControllerInput.rightHandClosed !== lastLeapHandsControllerInput.current.rightHandClosed ||
			leapHandControllerInput.bothHandsClosed !== lastLeapHandsControllerInput.current.bothHandsClosed ||
			leapHandControllerInput.handsTouch !== lastLeapHandsControllerInput.current.handsTouch ||
			leapHandControllerInput.barTouchedLastHand !== lastLeapHandsControllerInput.current.barTouchedLastHand ||
			leapHandControllerInput.leftHandAboveBar !== lastLeapHandsControllerInput.current.leftHandAboveBar ||
			leapHandControllerInput.rightHandAboveBar !== lastLeapHandsControllerInput.current.rightHandAboveBar ||
			leapHandControllerInput.bothHandsAboveBar !== lastLeapHandsControllerInput.current.bothHandsAboveBar) {
			lastLeapHandsControllerInput.current = leapHandControllerInput;
			SocketClient.emit('LEAP_DATA', leapHandControllerInput);
		}
	}

	function draw() {
		const now = performance.now();
		const dt = now - lastTic.current;
		lastTic.current = now;
		rafId.current = requestAnimationFrame(draw);

		leftHandClosed.current = false;
		rightHandClosed.current = false;
		handsTouch.current = false;
		barTouched.current = false;
		leftHandHight.current = 0;
		rightHandHight.current = 0;

		leftHandCube.current.position.x = 0;
		leftHandCube.current.position.y = -1000;
		leftHandCube.current.position.z = 0;

		rightHandCube.current.position.x = 0;
		rightHandCube.current.position.y = -1000;
		rightHandCube.current.position.z = 0;

		for(const finger of leftHandFingers.current) {
			for(const fingerBone of finger) {
				fingerBone.position.x = 0;
				fingerBone.position.y = -1000;
				fingerBone.position.z = 0;
			}
		}

		for(const finger of rightHandFingers.current) {
			for(const fingerBone of finger) {
				fingerBone.position.x = 0;
				fingerBone.position.y = -1000;
				fingerBone.position.z = 0;
			}
		}

		if(leapHands.current) {
			for(const hand of leapHands.current) {
				const handType = hand.type
				const curCube = handType === LeapHandType.LEFT ? leftHandCube.current : rightHandCube.current;
				if(hand.grabStrength > 0.9) {
					if(handType === LeapHandType.LEFT) {
						leftHandClosed.current = true;
					} else {
						rightHandClosed.current = true;
					}
				} else {
					if(handType === LeapHandType.LEFT) {
						leftHandClosed.current = false;
					} else {
						rightHandClosed.current = false;
					}
				}
				curCube.position.x = hand.palm.position.x;
				curCube.position.y = hand.palm.position.y;
				curCube.position.z = hand.palm.position.z;

				if(handType === LeapHandType.LEFT) {
					leftHandHight.current = hand.palm.position.y;
				} else {
					rightHandHight.current = hand.palm.position.y
				}

				curCube.scale.x = hand.palm.width / boxWidth / 1.4;
				curCube.scale.y = hand.palm.width / boxWidth / 5;
				curCube.scale.z = hand.palm.width / boxWidth / 1.1;

				curCube.quaternion.x = hand.palm.orientation.x;
				curCube.quaternion.y = hand.palm.orientation.y;
				curCube.quaternion.z = hand.palm.orientation.z;
				curCube.quaternion.w = hand.palm.orientation.w;

				heightBarCubeBox.current.setFromObject(heightBarCube.current);

				for(let i = 0; i < hand.fingers.length; i++) {
					const curFinger = hand.fingers[i];
					const curFingerBones = handType === LeapHandType.LEFT ? leftHandFingers.current[i] : rightHandFingers.current[i];
					const numBones = i === 0 ? 3 : 4;
					for(let k = 1; k < numBones; k++) {
						const curFingerBone = curFinger.bones[k];
						const fingerBone = curFingerBones[k];

						(fingerBone as any).material.color.setHex(0x2596be);

						fingerBone.position.fromArray(Object.values(curFingerBone.nextJoint));
						fingerBone.quaternion.fromArray(Object.values(curFingerBone.rotation));

						const dist = distance(curFingerBone.prevJoint, curFingerBone.nextJoint);
						const width = curFingerBone.width;

						fingerBone.scale.fromArray([width / 2, dist, width / 2]);
						fingerBone.rotateX(90 * Math.PI / 180);

						if(k === (numBones - 1)) {
							let fingerTip = handType === LeapHandType.LEFT ? leftHandFingerTips.current[k] : rightHandFingerTips.current[k];
							fingerTip.setFromObject(fingerBone);

							if(fingerTip.intersectsBox(heightBarCubeBox.current)) {
								barTouchedLastHand.current = handType;
								barTouched.current = true;
								(heightBarCube.current as any).material.color.setHex(0x0000FF);
							} else {
							}
						}
					}
				}

				for(let i = 0; i < hand.fingers.length; i++) {
					const curFingerBones = handType === LeapHandType.LEFT ? leftHandFingers.current[i] : rightHandFingers.current[i];
					let otherFingerTips = handType !== LeapHandType.LEFT ? leftHandFingerTips.current : rightHandFingerTips.current;
					const numBones = i === 0 ? 3 : 4;
					for(let k = 1; k < numBones; k++) {
						let fingerTip = handType === LeapHandType.LEFT ? leftHandFingerTips.current[k] : rightHandFingerTips.current[k];
						for(let p = 0; p < otherFingerTips.length; p++) {
							const otherFingerTip = otherFingerTips[p];
							if(fingerTip.intersectsBox(otherFingerTip)) {
								(curFingerBones[k] as any).material.color.setHex(0x0000FF);
							}
						}

						if(fingerTip.intersectsBox(heightBarCubeBox.current)) {
							barTouchedLastHand.current = handType;
							barTouched.current = true;
							(heightBarCube.current  as any).material.color.setHex(0x0000FF);
						}
					}
				}
			}

			if(leapHands.current.length > 0) {
				if(cubesCollide(leftHandCube.current, rightHandCube.current)) {
					(leftHandCube.current  as any).material.color.setHex(0xff00ff);
					(rightHandCube.current as any).material.color.setHex(0xff00ff);
					handsTouch.current = true;
				} else {
					handsTouch.current = false;
				}
			}
		}

		if(type !== 'viewOnly') {
			sendHandControllerInput();
		}

		if(scene.current && camera.current) {
			renderer.current?.render(scene.current, camera.current);
		}
	}

	return (
		<div className="w3-display-middle">
			<canvas width="1920" height="1080" ref={canvasRef} />
		</div>
	);
}

export default LeapHandsVisualizer;
