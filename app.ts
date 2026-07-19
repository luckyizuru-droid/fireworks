import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
class Firework {

    public cloud: THREE.Points;
    public material: THREE.PointsMaterial;
    public geometry: THREE.BufferGeometry;

    private group: TWEEN.Group;

    private particleNum = 800;
    private launchX = 0;
    private launchZ = 0;

    private explodeX = 0;
    private explodeY = 0;
    private explodeZ = 0;

    private radius = 3;
    private explode() {

        const positions =
            this.geometry.getAttribute(
                "position"
            ) as THREE.BufferAttribute;

        for (let i = 0; i < this.particleNum; i++) {

            const theta =
                Math.random() * Math.PI * 2;

            const phi =
                Math.random() * Math.PI;

            const r =
                this.radius *
                (0.5 + Math.random());

            const tx =
                this.explodeX +
                r *
                Math.sin(phi) *
                Math.cos(theta);

            const ty =
                this.explodeY +
                r *
                Math.cos(phi);

            const tz =
                this.explodeZ +
                r *
                Math.sin(phi) *
                Math.sin(theta);

            const particle = { x: this.explodeX, y: this.explodeY, z: this.explodeZ };

            new TWEEN.Tween(particle, this.group)

                .to({ x: tx, y: ty, z: tz }, 1500)

                .easing(TWEEN.Easing.Cubic.Out)

                .onUpdate(() => {

                    positions.setXYZ(i, particle.x, particle.y, particle.z);

                    positions.needsUpdate = true;

                })

                .start();


        }

        this.fade();

    }
    private fade() {

        new TWEEN.Tween(this.material, this.group)
            .delay(1200)

            .to({

                opacity: 0

            }, 800)

            .onComplete(() => {

                setTimeout(() => {

                    this.start();

                }, Math.random() * 1000);

            })

            .start();

    }
    constructor(
        scene: THREE.Scene,
        group: TWEEN.Group
    ) {

        this.group = group;

        //------------------------
        // Geometry
        //------------------------

        this.geometry = new THREE.BufferGeometry();

        const vertices = new Float32Array(
            this.particleNum * 3
        );

        for (let i = 0; i < this.particleNum; i++) {

            vertices[i * 3] = 0;
            vertices[i * 3 + 1] = -8;
            vertices[i * 3 + 2] = 0;

        }

        this.geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(vertices, 3)
        );

        //------------------------
        // 色
        //------------------------

        const color = 0xffffff;
        //------------------------
        // Material
        //------------------------

        const canvas =
            document.createElement("canvas");

        canvas.width = 32;
        canvas.height = 32;

        const ctx =
            canvas.getContext("2d")!;

        const gradient =
            ctx.createRadialGradient(
                16,
                16,
                0,
                16,
                16,
                16
            );

        gradient.addColorStop(
            0,
            "rgba(255,255,255,1)"
        );

        gradient.addColorStop(
            0.2,
            "rgba(255,255,255,1)"
        );

        gradient.addColorStop(
            0.4,
            "rgba(255,255,255,0.8)"
        );

        gradient.addColorStop(
            1,
            "rgba(255,255,255,0)"
        );

        ctx.fillStyle = gradient;
        ctx.fillRect(
            0,
            0,
            32,
            32
        );

        const texture =
            new THREE.Texture(canvas);

        texture.needsUpdate = true;

        this.material =
            new THREE.PointsMaterial({

                map: texture,

                color: color,

                size: 0.18,

                transparent: true,

                opacity: 1,

                blending:
                    THREE.AdditiveBlending,

                depthWrite: false

            });

        //------------------------
        // Points
        //------------------------

        this.cloud =
            new THREE.Points(
                this.geometry,
                this.material
            );

        scene.add(this.cloud);

    }
    public start() {
        const colors = [

            0xff4444,
            0x00ffff,
            0xffff00,
            0xff00ff,
            0x44ff44,
            0xffffff,
            0xff8800

        ];

        this.material.color.setHex(

            colors[
            Math.floor(
                Math.random() * colors.length
            )
            ]

        );
        //--------------------------
        // ランダムな打ち上げ位置
        //--------------------------

        this.launchX =
            THREE.MathUtils.randFloat(-8, 8);

        this.launchZ =
            THREE.MathUtils.randFloat(-4, 4);

        //--------------------------
        // 爆発位置
        //--------------------------

        this.explodeX = this.launchX;

        this.explodeY =
            THREE.MathUtils.randFloat(4, 8);

        this.explodeZ = this.launchZ;

        //--------------------------
        // 爆発サイズ
        //--------------------------

        this.radius =
            THREE.MathUtils.randFloat(2, 5);

        this.material.opacity = 1;

        const positions =
            this.geometry.getAttribute(
                "position"
            ) as THREE.BufferAttribute;

        //--------------------------
        // 全粒子を地面へ
        //--------------------------

        for (let i = 0; i < this.particleNum; i++) {

            positions.setXYZ(

                i,

                this.launchX,

                -8,

                this.launchZ

            );

        }

        positions.needsUpdate = true;

        //--------------------------
        // 打ち上げ
        //--------------------------

        const rocket = {

            y: -8

        };

        new TWEEN.Tween(rocket, this.group)
            .to({

                y: this.explodeY

            }, 1200)

            .easing(TWEEN.Easing.Quadratic.Out)

            .onUpdate(() => {

                for (let i = 0; i < this.particleNum; i++) {

                    positions.setXYZ(i, this.launchX, rocket.y, this.launchZ);
                }

                positions.needsUpdate = true;

            })

            .onComplete(() => {

                this.explode();

            })

            .start();

    }
}
class ThreeJSContainer {

    private scene!: THREE.Scene;
    private light!: THREE.Light;

    constructor() { }

    public createRendererDOM(
        width: number,
        height: number,
        cameraPos: THREE.Vector3
    ) {

        const renderer = new THREE.WebGLRenderer({
            antialias: true
        });

        renderer.setSize(width, height);
        renderer.setClearColor(0x050515);

        const camera = new THREE.PerspectiveCamera(
            45,
            width / height,
            0.1,
            1000
        );

        camera.position.copy(cameraPos);

        const orbitControls = new OrbitControls(camera, renderer.domElement);

        this.createScene();

        const render: FrameRequestCallback = (_time) => {

            orbitControls.update();

            renderer.render(this.scene, camera);

            requestAnimationFrame(render);

        };

        requestAnimationFrame(render);

        return renderer.domElement;
    }

    private createScene() {


        this.scene = new THREE.Scene();

        //-----------------------
        // ライト
        //-----------------------

        this.light = new THREE.DirectionalLight(0xffffff);

        this.light.position.set(1, 1, 1);

        this.scene.add(this.light);
        //------------------------------------------------
        // 星空
        //------------------------------------------------

        const starGeometry = new THREE.BufferGeometry();

        const starVertices: number[] = [];

        for (let i = 0; i < 2000; i++) {

            starVertices.push(

                THREE.MathUtils.randFloatSpread(150),

                THREE.MathUtils.randFloat(3, 40),

                THREE.MathUtils.randFloatSpread(150)

            );

        }

        starGeometry.setAttribute(

            "position",

            new THREE.Float32BufferAttribute(

                starVertices,

                3

            )

        );

        const starMaterial = new THREE.PointsMaterial({

            color: 0xffffff,

            size: 0.15,

            transparent: true,

            opacity: 0.9

        });

        const stars = new THREE.Points(

            starGeometry,

            starMaterial

        );

        this.scene.add(stars);
        //------------------------------------------------
        // 月
        //------------------------------------------------

        const moonGeometry =

            new THREE.SphereGeometry(2, 32, 32);

        const moonMaterial =

            new THREE.MeshBasicMaterial({

                color: 0xffffdd

            });

        const moon = new THREE.Mesh(

            moonGeometry,

            moonMaterial

        );

        moon.position.set(-12, 14, -20);
        this.scene.add(moon);
        //------------------------------------------------
        // Firework
        //------------------------------------------------

        const group = new TWEEN.Group();

        const fireworks: Firework[] = [];

        for (let i = 0; i < 6; i++) {

            const firework =

                new Firework(

                    this.scene,

                    group

                );

            fireworks.push(

                firework

            );

        }
        //------------------------------------------------
        // 順番に打ち上げ
        //------------------------------------------------

        fireworks.forEach(

            (firework, index) => {

                setTimeout(

                    () => {

                        firework.start();

                    },

                    index * 800

                );

            }

        );
        const update: FrameRequestCallback = (

            time

        ) => {

            group.update(time);

            requestAnimationFrame(update);

        };

        requestAnimationFrame(update);
    }

}

window.addEventListener("DOMContentLoaded", init);

function init() {

    const container = new ThreeJSContainer();

    const viewport = container.createRendererDOM(
        640,
        480,
        new THREE.Vector3(0, 4, 20)
    );

    document.body.appendChild(viewport);

}