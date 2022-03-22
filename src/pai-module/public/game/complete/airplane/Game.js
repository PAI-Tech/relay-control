import * as THREE from '../../libs/three137/three.module.js';
import { RGBELoader } from '../../libs/three137/RGBELoader.js';
import { LoadingBar } from '../../libs/LoadingBar.js';
import { Plane } from './Plane.js';
import { Obstacles } from './Obstacles.js';
import { SFX } from '../../libs/SFX.js';




class Game {
    constructor() {
        const container = document.createElement('div');
        document.body.appendChild(container);

        this.loadingBar = new LoadingBar();
        this.loadingBar.visible = false;

        this.clock = new THREE.Clock();

        this.assetsPath = '../../assets/';

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
        this.camera.position.set(-5, 0, -5);
        this.camera.lookAt(0, 0, 6);

        this.cameraController = new THREE.Object3D();
        this.cameraController.add(this.camera);
        this.cameraTarget = new THREE.Vector3(0, 0, 6);

        this.scene = new THREE.Scene();
        this.scene.add(this.cameraController);

        const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        ambient.position.set(0.5, 1, 0.25);
        this.scene.add(ambient);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(this.renderer.domElement);
        this.setEnvironment();

        this.active = false;
        this.load();

        window.addEventListener('resize', this.resize.bind(this));

        document.addEventListener('keydown', this.keyDown.bind(this));
        document.addEventListener('keyup', this.keyUp.bind(this));

        document.addEventListener('touchstart', this.mouseDown.bind(this));
        document.addEventListener('touchend', this.mouseUp.bind(this));
        document.addEventListener('mousedown', this.mouseDown.bind(this));
        document.addEventListener('mouseup', this.mouseUp.bind(this));
        window.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        }, false);

        // document.addEventListener("sp-sensor", (e)=> {
        //     // this.pressure = e.
        //     // console.log("Event from device");
        //     console.log(e.detail.sensorData);
        // });


        document.addEventListener("air-pres", (e)=> {
            // console.log(e.detail["sensor-data"]);
            this.pressure = e.detail["sensor-data"];
            console.log(this.pressure);
            
        });

        // this.spaceKey = false;
        this.upkey = false;
        this.downkey = false;
        this.fkey = false;
        this.fuel = 100;
        this.skey = false;
        this.shield = 0;
        // this.pressure = 0;
        
        const btn = document.getElementById('playBtn');
        btn.addEventListener('click', this.startGame.bind(this));
    }

    startGame() {

        

        const gameover = document.getElementById('gameover');
        const instructions = document.getElementById('instructions');
        const btn = document.getElementById('playBtn');
        
        gameover.style.display = 'none';
        instructions.style.display = 'none';
        btn.style.display = 'none';
        
        this.score = 0;
        this.bonusScore = 0;
        this.lives = 3;
        this.shield = 0;
        this.pressure = 1000;

        let elm = document.getElementById('score');
        elm.innerHTML = this.score;

        elm = document.getElementById('lives');
        elm.innerHTML = this.lives;

        this.plane.reset();
        this.obstacles.reset();

        this.active = true;

        this.sfx.play('engine');
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    keyDown(evt) {
        switch (evt.keyCode) {
            // case 32:
            //     this.spaceKey = true;
            //     break;
            case 70:
                this.fkey = true;
                console.log('F down');
                break;
            case 38:
                // Up arrow
                this.upkey = true;
                console.log('up arrow');
                break;
            case 40:
                // Down arrow
                this.downkey = true;
                console.log('down arrow');
                break;
            case 83:
                // Down arrow
                this.skey = true;
                console.log('s down');
                break;
            case 80:
                // Down arrow
                this.pkey = true;
                console.log('p down');
                break;
            }
        }
        
        keyUp(evt) {
        evt.preventDefault();
        switch (evt.keyCode) {
            // case 32:
            //     this.spaceKey = false;
            //     break;
            case 70:
                this.fkey = false;
                console.log('F up');
                break;
            case 38:
                // Up arrow
                this.upkey = false;
                console.log('up arrow');
                break;
            case 40:
                // Down arrow
                this.downkey = false;
                console.log('down arrow');
                break;
            case 83:
                // Down arrow
                this.skey = false;
                console.log('s up');
                break;
            case 80:
                // Down arrow
                this.pkey = false;
                console.log('p up');
                break;
        }
    }

    mouseDown(evt) {
        evt.preventDefault();
        // switch (evt.which) {
        // case 1:
        // this.leftClick = true;
        // console.log('mouse down');
        // break;
        // }

        // console.log('mouse down');
    }

    mouseUp(evt) {
        // switch (evt.which) {
        // case 1:
        // this.leftClick = false;
        // console.log('mouse up');
        // break;
        // }
        // console.log('mouse up');
    }

    setEnvironment() {
        const loader = new RGBELoader().setPath(this.assetsPath);
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        pmremGenerator.compileEquirectangularShader();

        const self = this;

        loader.load('hdr/venice_sunset_1k.hdr', (texture) => {
            const envMap = pmremGenerator.fromEquirectangular(texture).texture;
            pmremGenerator.dispose();

            self.scene.environment = envMap;

        }, undefined, (err) => {
            console.error(err.message);
        });
    }

    load() {
        this.loadSkybox();
        this.loading = true;
        this.loadingBar.visible = true;

        this.plane = new Plane(this);
        this.obstacles = new Obstacles(this);

        this.loadSFX();
    }

    loadSFX() {
        this.sfx = new SFX(this.camera, this.assetsPath + 'plane/');

        this.sfx.load('explosion');
        this.sfx.load('engine', true);
        this.sfx.load('gliss');
        this.sfx.load('gameover');
        this.sfx.load('bonus');
    }

    loadSkybox() {
        this.scene.background = new THREE.CubeTextureLoader()
            .setPath(`${this.assetsPath}/plane/paintedsky/`)
            .load([
                'px.jpg',
                'nx.jpg',
                'py.jpg',
                'ny.jpg',
                'pz.jpg',
                'nz.jpg'
            ], () => {
                this.renderer.setAnimationLoop(this.render.bind(this));
            });
    }

    gameOver() {
        this.active = false;

        const gameover = document.getElementById('gameover');
        const btn = document.getElementById('playBtn');

        gameover.style.display = 'block';
        btn.style.display = 'block';

        this.plane.visible = false;

        this.sfx.stopAll();
        this.sfx.play('gameover');
    }

    incScore() {
        this.score++;

        const elm = document.getElementById('score');

        if (this.score % 3 == 0) {
            this.bonusScore += 3;
            this.sfx.play('bonus');
        } else {
            this.sfx.play('gliss');
        }

        elm.innerHTML = this.score + this.bonusScore;
    }

    decFuel(quantity) {

        const elm = document.getElementById('fuel');

        this.fuel >= 0 ? this.fuel -= quantity : this.fuel;

        elm.innerHTML = Math.ceil(this.fuel);
    }
    
    decShield(quantity) {

        const elm = document.getElementById('shield');

        this.shield >= 0 ? this.shield -= quantity : this.shield;

        elm.innerHTML = Math.ceil(this.shield);
    }
    incShield(quantity) {

        const elm = document.getElementById('shield');

        this.shield += quantity;

        elm.innerHTML = Math.ceil(this.shield);
    }
    resetShield(quantity) {

        const elm = document.getElementById('shield');

        this.shield = 0;

        elm.innerHTML = Math.ceil(this.shield);
    }
    incPressure(quantity) {

        const elm = document.getElementById('pressure');

        this.pressure >= 0 ? this.pressure += quantity : this.pressure;

        elm.innerHTML = Math.ceil(this.pressure);
    }
    decPressure(quantity) {

        const elm = document.getElementById('pressure');

        this.pressure =  this.pressure;

        elm.innerHTML = Math.ceil(this.pressure);
    }

    decLives() {
        this.lives--;

        const elm = document.getElementById('lives');

        elm.innerHTML = this.lives;

        if (this.lives == 0) setTimeout(this.gameOver.bind(this), 1200);

        this.sfx.play('explosion');
    }

    updateCamera() {
        this.cameraController.position.copy(this.plane.position);
        this.cameraController.position.y = 0;
        this.cameraTarget.copy(this.plane.position);
        this.cameraTarget.z += 6;
        this.camera.lookAt(this.cameraTarget);
    }

    render() {
        if (this.loading) {
            if (this.plane.ready && this.obstacles.ready) {
                this.loading = false;
                this.loadingBar.visible = false;
            } else {
                return;
            }
        }

        const dt = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        this.plane.update(time);
        if (this.active) {
            this.obstacles.update(this.plane.position, dt);
        }

        this.updateCamera();

        this.renderer.render(this.scene, this.camera);

    }
}

export { Game };