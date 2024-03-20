import React, { useEffect } from "react";
import { SocketClient } from "../../socket/SocketClient";
import { AvatarCameraPosition, LiveLinkData, getLiveLinkData, setLiveLinkData, setTrigger } from "../../slices/liveLinkDataSlice";
import * as THREE from 'three';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FaceBlendShape } from "./LiveLinkAnalyzer";
import { useAppDispatch, useAppSelector } from "../../hooks/general";

const maxEyeYaw = 0.2;
const minEyeYaw = -0.2;
const maxEyePitch = 0.2;
const minEyePitch = -0.2;
const maxEyeRoll = 0.2;
const minEyeRoll = -0.2;

function LiveLinkVRM(): JSX.Element {
	const dispatch = useAppDispatch();
	const { avatar, mouseModeActive, triggerLeft, triggerRight, triggerUp, triggerDown } = useAppSelector((state) => getLiveLinkData(state));
	const canvasRef = React.useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if(!canvasRef.current) {
			return;
		}

		const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
		renderer.setSize(canvasRef.current.width, canvasRef.current.height);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setClearColor(0x282c34, 1.0);
		let cleared = true;

		const camera = new THREE.PerspectiveCamera(30.0, canvasRef.current.width / canvasRef.current.height, 0.1, 20.0);
	
		camera.position.set(AvatarCameraPosition[avatar].x, AvatarCameraPosition[avatar].y, AvatarCameraPosition[avatar].z);

		const scene = new THREE.Scene();

		const light = new THREE.DirectionalLight(0xffffff, 0.7);
		light.position.set(1.0, 1.0, 1.0).normalize();
		scene.add(light);

		let currentVrm: any = undefined;
		const loader = new GLTFLoader();
		loader.crossOrigin = 'anonymous';

		loader.register((parser) => {
			return new VRMLoaderPlugin(parser);
		});

		loader.load(
			`/avatars/${avatar}.vrm`,
			(gltf) => {
				const vrm = gltf.userData.vrm;

				VRMUtils.removeUnnecessaryVertices(gltf.scene);
				VRMUtils.removeUnnecessaryJoints(gltf.scene);

				vrm.scene.traverse((obj: any) => {
					obj.frustumCulled = false;
				});
				vrm.scene.rotation.y = Math.PI;

				scene.add(vrm.scene);

				currentVrm = vrm;

				currentVrm.scene.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1));

				currentVrm.humanoid.getNormalizedBoneNode('leftUpperArm').rotation.z = Math.PI / 2;
				currentVrm.humanoid.getNormalizedBoneNode('rightUpperArm').rotation.z = -Math.PI / 2;
			},
			(progress) => console.log(`Loading model...${100.0 * (progress.loaded / progress.total)}%`),
			(error) => console.error(error)
		);

		function processLiveLinkData(liveLinkData: LiveLinkData) {
			if(liveLinkData && currentVrm) {
				cleared = false;
				for(let i = 0; i < liveLinkData.blendShapes.length; i++) {
					const expressionName = FaceBlendShape[i];
					if(currentVrm.expressionManager.expressions.find((expression: any) => expression.expressionName === expressionName)) {
						currentVrm.expressionManager.setValue(expressionName, liveLinkData.blendShapes[i]);
					}
				}

				if(!mouseModeActive) {
					currentVrm.humanoid.getNormalizedBoneNode('neck').rotation.y = liveLinkData.blendShapes[FaceBlendShape.HeadYaw];
					currentVrm.humanoid.getNormalizedBoneNode('neck').rotation.x = liveLinkData.blendShapes[FaceBlendShape.HeadPitch];
					currentVrm.humanoid.getNormalizedBoneNode('neck').rotation.z = -liveLinkData.blendShapes[FaceBlendShape.HeadRoll];
	
					if(liveLinkData.blendShapes[FaceBlendShape.LeftEyeYaw] <= maxEyeYaw && liveLinkData.blendShapes[FaceBlendShape.LeftEyeYaw] >= minEyeYaw) {
						currentVrm.humanoid.getNormalizedBoneNode('leftEye').rotation.y = -liveLinkData.blendShapes[FaceBlendShape.LeftEyeYaw];
					}
					if(liveLinkData.blendShapes[FaceBlendShape.LeftEyePitch] <= maxEyePitch && liveLinkData.blendShapes[FaceBlendShape.LeftEyePitch] >= minEyePitch) {
						currentVrm.humanoid.getNormalizedBoneNode('leftEye').rotation.x = -liveLinkData.blendShapes[FaceBlendShape.LeftEyePitch];
					}
					if(liveLinkData.blendShapes[FaceBlendShape.LeftEyeRoll] <= maxEyeRoll && liveLinkData.blendShapes[FaceBlendShape.LeftEyeRoll] >= minEyeRoll) {
						currentVrm.humanoid.getNormalizedBoneNode('leftEye').rotation.z = -liveLinkData.blendShapes[FaceBlendShape.LeftEyeRoll];
					}
	
					if(liveLinkData.blendShapes[FaceBlendShape.RightEyeYaw] <= maxEyeYaw && liveLinkData.blendShapes[FaceBlendShape.RightEyeYaw] >= minEyeYaw) {
						currentVrm.humanoid.getNormalizedBoneNode('rightEye').rotation.y = -liveLinkData.blendShapes[FaceBlendShape.RightEyeYaw];
					}
					if(liveLinkData.blendShapes[FaceBlendShape.RightEyePitch] <= maxEyePitch && liveLinkData.blendShapes[FaceBlendShape.RightEyePitch] >= minEyePitch) {
						currentVrm.humanoid.getNormalizedBoneNode('rightEye').rotation.x = -liveLinkData.blendShapes[FaceBlendShape.RightEyePitch];
					}
					if(liveLinkData.blendShapes[FaceBlendShape.RightEyeRoll] <= maxEyeRoll && liveLinkData.blendShapes[FaceBlendShape.RightEyeRoll] >= minEyeRoll) {
						currentVrm.humanoid.getNormalizedBoneNode('rightEye').rotation.z = -liveLinkData.blendShapes[FaceBlendShape.RightEyeRoll];
					}

					dispatch(setTrigger({
						leftTrigger: liveLinkData.blendShapes[FaceBlendShape.HeadYaw] < -0.2,
						rightTrigger: liveLinkData.blendShapes[FaceBlendShape.HeadYaw] > 0.2,
						upTrigger: liveLinkData.blendShapes[FaceBlendShape.HeadPitch] < -0.2,
						downTrigger: liveLinkData.blendShapes[FaceBlendShape.HeadPitch] > 0.2
					}));
				}
			} else {
				if(cleared) {
					return;
				}
				for(const { expressionName } of currentVrm.expressionManager.expressions) {
					currentVrm.expressionManager.setValue(expressionName, 0);
				}

				currentVrm.humanoid.getNormalizedBoneNode('neck').rotation.y = 0;
				currentVrm.humanoid.getNormalizedBoneNode('neck').rotation.x = 0;
				currentVrm.humanoid.getNormalizedBoneNode('neck').rotation.z = 0;

				currentVrm.humanoid.getNormalizedBoneNode('leftEye').rotation.y = 0;
				currentVrm.humanoid.getNormalizedBoneNode('leftEye').rotation.x = 0;
				currentVrm.humanoid.getNormalizedBoneNode('leftEye').rotation.z = 0;

				currentVrm.humanoid.getNormalizedBoneNode('rightEye').rotation.y = 0;
				currentVrm.humanoid.getNormalizedBoneNode('rightEye').rotation.x = 0;
				currentVrm.humanoid.getNormalizedBoneNode('rightEye').rotation.z = 0;

				cleared = true;
			}
		}

		const followMouse = (event: MouseEvent) => {
			if(currentVrm) {
				const x = (event.clientX / window.innerWidth) * 2 - 1;
				const y = -(event.clientY / window.innerHeight) * 2 + 1;
				const vector = new THREE.Vector3(x, y, 0);
				vector.unproject(camera);
				const dir = vector.sub(camera.position).normalize();
				const distance = -camera.position.z / dir.z;
				const pos = camera.position.clone().add(dir.multiplyScalar(distance));
				currentVrm.humanoid.getNormalizedBoneNode('neck').lookAt(pos);
				currentVrm.humanoid.getNormalizedBoneNode('neck').rotation.y = -currentVrm.humanoid.getNormalizedBoneNode('neck').rotation.y;
				currentVrm.humanoid.getNormalizedBoneNode('neck').rotation.x = -currentVrm.humanoid.getNormalizedBoneNode('neck').rotation.x;
				currentVrm.humanoid.getNormalizedBoneNode('neck').rotation.z = -currentVrm.humanoid.getNormalizedBoneNode('neck').rotation.z;

				let liveLinkDataDummy = { blendShapes: [Object.values(FaceBlendShape).length] } as LiveLinkData;
				liveLinkDataDummy.blendShapes[FaceBlendShape.HeadYaw] = -currentVrm.humanoid.getNormalizedBoneNode('neck').rotation.y;
				liveLinkDataDummy.blendShapes[FaceBlendShape.HeadPitch] = -currentVrm.humanoid.getNormalizedBoneNode('neck').rotation.x;
				liveLinkDataDummy.blendShapes[FaceBlendShape.HeadRoll] = -currentVrm.humanoid.getNormalizedBoneNode('neck').rotation.z;

				SocketClient.emit('LIVE_LINK_TEST_MOVE_MOUSE', {
					x: -currentVrm.humanoid.getNormalizedBoneNode('neck').rotation.y,
					y: -currentVrm.humanoid.getNormalizedBoneNode('neck').rotation.x
				});

				dispatch(setLiveLinkData(liveLinkDataDummy));
				dispatch(setTrigger({
					leftTrigger: liveLinkDataDummy.blendShapes[FaceBlendShape.HeadYaw] < -0.2,
					rightTrigger: liveLinkDataDummy.blendShapes[FaceBlendShape.HeadYaw] > 0.2,
					upTrigger: liveLinkDataDummy.blendShapes[FaceBlendShape.HeadPitch] < -0.2,
					downTrigger: liveLinkDataDummy.blendShapes[FaceBlendShape.HeadPitch] > 0.2
				}));
			}
		}

		if(mouseModeActive) {
			window.addEventListener('mousemove', followMouse);
		}

		SocketClient.on('LIVE_LINK_DATA', processLiveLinkData);

		const clock = new THREE.Clock();
		function animate() {
			requestAnimationFrame(animate);
			const deltaTime = clock.getDelta();
			if(currentVrm) {
				currentVrm.update(deltaTime);
			}
			renderer.render(scene, camera);
		}
		animate();

		return () => {
			SocketClient.off('LIVE_LINK_DATA', processLiveLinkData);
			if(mouseModeActive) {
				window.removeEventListener('mousemove', followMouse);
				dispatch(setTrigger({
					leftTrigger: false,
					rightTrigger: false,
					upTrigger: false,
					downTrigger: false
				}));
			}
		};
	}, [ avatar, mouseModeActive, dispatch ]);

	return (
		<React.Fragment>
			<div style={{ position: 'relative', width: '1000', height: '1000' }}>
				<canvas width="1000" height="1000" ref={canvasRef} />
				<div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)' }}>
					<span style={{ display: 'inline-block', width: '120px', height: '120px', border: 'solid', borderWidth: '0 16px 16px 0', borderColor: triggerUp ? 'green' : '#9c27b0', transform: 'rotate(-135deg)'}}></span> {/* Up */}
				</div>
				<div style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)' }}>
					<span style={{ display: 'inline-block', width: '120px', height: '120px', border: 'solid', borderWidth: '0 16px 16px 0', borderColor: triggerDown ? 'green' : '#9c27b0', transform: 'rotate(45deg)'}}></span> {/* Down */}
				</div>
				<div style={{ position: 'absolute', top: '50%', left: '0', transform: 'translate(-50%, -50%)' }}>
					<span style={{ display: 'inline-block', width: '120px', height: '120px', border: 'solid', borderWidth: '0 16px 16px 0', borderColor: triggerLeft ? 'green' : '#9c27b0', transform: 'rotate(135deg)'}}></span> {/* Left */}
				</div>
				<div style={{ position: 'absolute', top: '50%', right: '0', transform: 'translate(50%, -50%)' }}>
					<span style={{ display: 'inline-block', width: '120px', height: '120px', border: 'solid', borderWidth: '0 16px 16px 0', borderColor: triggerRight ? 'green' : '#9c27b0', transform: 'rotate(-45deg)'}}></span> {/* Right */}
				</div>
			</div>
		</React.Fragment>
	);
}

export default LiveLinkVRM;
