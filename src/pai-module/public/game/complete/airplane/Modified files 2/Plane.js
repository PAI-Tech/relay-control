import { Vector3 } from '../../libs/three137/three.module.js';
import { GLTFLoader } from '../../libs/three137/GLTFLoader.js';

class Plane {
    constructor(game) {
        this.assetsPath = game.assetsPath;
        this.loadingBar = game.loadingBar;
        this.game = game;
        this.scene = game.scene;
        this.load();
        this.tmpPos = new Vector3();
    }

    get position() {
        if (this.plane !== undefined) this.plane.getWorldPosition(this.tmpPos);
        return this.tmpPos;
    }

    set visible(mode) {
        this.plane.visible = mode;
    }

    load() {
        const loader = new GLTFLoader().setPath(`${this.assetsPath}plane/`);
        this.ready = false;

        // Load a glTF resource
        loader.load(
            // resource URL
            'microplane.glb',
            // called when the resource is loaded
            gltf => {

                this.scene.add(gltf.scene);
                this.plane = gltf.scene;
                this.velocity = new Vector3(0, 0, 0.1);

                this.propeller = this.plane.getObjectByName("propeller");

                this.ready = true;

            },
            // called while loading is progressing
            xhr => {

                this.loadingBar.update('plane', xhr.loaded, xhr.total);

            },
            // called when loading has errors
            err => {

                console.error(err);

            }
        );
    }

    reset() {
        this.plane.position.set(0, 0, 0);
        this.plane.visible = true;
        this.velocity.set(0, 0, 0.1);
        this.game.fuel = 100;
        this.game.shield = 0;
    }

    update(time) {
        if (this.propeller !== undefined) this.propeller.rotateZ(.20);

        if (this.game.active) {
            if (this.game.downkey) {
                console.log('Go down');
                this.velocity.y -= 0.002;
            } else if (this.game.upkey) {
                console.log('Go up');
                this.velocity.y += 0.002;
            } else if (this.game.fkey && this.game.fuel <= 99) {
                this.game.fuel += 1;
            } else if (this.game.skey) {
                this.game.shield += 1;
                this.game.incShield(0.005)
                console.log('this.game.shield');
            }
            this.game.decFuel(0.05);

            if (this.game.fuel > 1) {
                // TODO try to limit up and down
                // if (this.plane.position.y > 10) {
                //     this.velocity.y -= 0.001
                // }

                this.velocity.z += 0.000005;
                this.plane.position.x = 0;
                this.plane.rotation.set(0, 0, Math.sin(time) * 0.3, 'XYZ');
                this.plane.translateZ(this.velocity.z);
                this.plane.translateY(this.velocity.y);
                if (this.game.fuel >= 90) {
                    this.velocity.z = 0.1;
                }
            } else {
                // this.plane.rotation.set(time, time, 0, 'XYZ');
                // this.propeller.rotateZ(-.20);
                this.velocity.z = 0.01;
            }


        } else {
            this.plane.rotation.set(0, 0, Math.sin(time * 3) * 0.2, 'XYZ');
            this.plane.position.y = Math.cos(time) * 1.5;
        }

    }
}

export { Plane };