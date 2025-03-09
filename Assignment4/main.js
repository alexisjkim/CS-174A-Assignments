import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, -8);

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);


class Texture_Rotate {
    vertexShader() {
        return `
        uniform sampler2D uTexture;
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
        `;
    }

    fragmentShader() {
        return `
        uniform sampler2D uTexture;
        uniform float animation_time;
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {    
            // TODO: 2.c Rotate the texture map around the center of each face at a rate of 8 rpm.
            float angle = -mod(animation_time * (8.0 / 60.0) * 2.0 * 3.14, 2.0 * 3.14);

            vec2 new_vUv = vUv - vec2(0.5);
            float x = new_vUv.x;

            new_vUv.x = new_vUv.x * cos(angle) - new_vUv.y * sin(angle);
            new_vUv.y = x * sin(angle) + new_vUv.y * cos(angle);
            new_vUv += vec2(0.5);


            // TODO: 1.b Load the texture color from the texture map
            // Hint: Use texture2D function to get the color of the texture at the current UV coordinates
            vec4 tex_color = texture2D(uTexture, new_vUv);
            
            // TODO: 2.d add the outline of a black square in the center of each texture that moves with the texture
            // Hint: Tell whether the current pixel is within the black square or not using the UV coordinates
            //       If the pixel is within the black square, set the tex_color to vec4(0.0, 0.0, 0.0, 1.0)

            bool square = false;
            // left side of square (including corners)
            if (new_vUv.x > 0.15 && new_vUv.x < 0.25 && new_vUv.y > 0.15 && new_vUv.y < 0.85) square = true;

            // right side of square (including corners)
            if (new_vUv.x > 0.75 && new_vUv.x < 0.85 && new_vUv.y > 0.15 && new_vUv.y < 0.85) square = true;

            // bottom side of square
            if (new_vUv.y > 0.15 && new_vUv.y < 0.25 && new_vUv.x > 0.15 && new_vUv.x < 0.85) square = true;

            // top side of square
            if (new_vUv.y > 0.75 && new_vUv.y < 0.85 && new_vUv.x > 0.15 && new_vUv.x < 0.85) square = true;

            if (square) {
                tex_color = vec4(0.0, 0.0, 0.0, 1.0);
            }

            gl_FragColor = tex_color;
        }
        `;
    }
}


class Texture_Scroll_X {
    vertexShader() {
        return `
        uniform sampler2D uTexture;
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
        `;
    }

    fragmentShader() {
        return `
        uniform sampler2D uTexture;
        uniform float animation_time;
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
            // TODO: 2.a Shrink the texuture by 50% so that the texture is repeated twice in each direction
            vec2 new_vUv = vUv * 2.0;


            // TODO: 2.b Translate the texture varying the s texture coordinate by 4 texture units per second, 
            new_vUv.x += animation_time * -4.0;


            // TODO: 1.b Load the texture color from the texture map
            // Hint: Use texture2D function to get the color of the texture at the current UV coordinates
            vec4 tex_color = texture2D(uTexture, new_vUv);
            

            // TODO: 2.d add the outline of a black square in the center of each texture that moves with the texture
            // Hint: Tell whether the current pixel is within the black square or not using the UV coordinates
            //       If the pixel is within the black square, set the tex_color to vec4(0.0, 0.0, 0.0, 1.0)
            
            float new_x = mod(new_vUv.x, 1.0);
            float new_y = mod(new_vUv.y, 1.0);

            bool square = false;
            // left side of square (including corners)
            if (new_x > 0.15 && new_x < 0.25 && new_y > 0.15 && new_y < 0.85) square = true;

            // right side of square (including corners)
            if (new_x > 0.75 && new_x < 0.85 && new_y > 0.15 && new_y < 0.85) square = true;

            // bottom side of square
            if (new_y > 0.15 && new_y < 0.25 && new_x > 0.15 && new_x < 0.85) square = true;

            // top side of square
            if (new_y > 0.75 && new_y < 0.85 && new_x > 0.15 && new_x < 0.85) square = true;

            if (square) {
                tex_color = vec4(0.0, 0.0, 0.0, 1.0);
            }

            gl_FragColor = tex_color;
        }
        `;
    }
}

let animation_time = 0.0;

const cube1_geometry = new THREE.BoxGeometry(2, 2, 2);

// TODO: 1.a Load texture map 
const cube1_texture = new THREE.TextureLoader().load('assets/stars.png');;

// TODO: 1.c Apply Texture Filtering Techniques to Cube 1
// Nearest Neighbor Texture Filtering
cube1_texture.minFilter = THREE.NearestFilter;
cube1_texture.magFilter = THREE.NearestFilter;


// TODO: 2.a Enable texture repeat wrapping for Cube 1
cube1_texture.wrapS = THREE.RepeatWrapping;
cube1_texture.wrapT = THREE.RepeatWrapping;

const cube1_uniforms = {
    uTexture: { value: cube1_texture },
    animation_time: { value: animation_time }
};
const cube1_shader = new Texture_Rotate();
const cube1_material = new THREE.ShaderMaterial({
    uniforms: cube1_uniforms,
    vertexShader: cube1_shader.vertexShader(),
    fragmentShader: cube1_shader.fragmentShader(),
});

const cube1_mesh = new THREE.Mesh(cube1_geometry, cube1_material);
cube1_mesh.position.set(2, 0, 0)
scene.add(cube1_mesh);

const cube2_geometry = new THREE.BoxGeometry(2, 2, 2);

// TODO: 1.a Load texture map 
const cube2_texture = new THREE.TextureLoader().load('assets/earth.gif');;

// TODO: 1.c Apply Texture Filtering Techniques to Cube 2
// Linear Mipmapping Texture Filtering
cube2_texture.minFilter = THREE.LinearMipmapLinearFilter;


// TODO: 2.a Enable texture repeat wrapping for Cube 2
cube2_texture.wrapS = THREE.RepeatWrapping;
cube2_texture.wrapT = THREE.RepeatWrapping;


const cube2_uniforms = {
    uTexture: { value: cube2_texture },
    animation_time: { value: animation_time }
};
const cube2_shader = new Texture_Scroll_X();
const cube2_material = new THREE.ShaderMaterial({
    uniforms: cube2_uniforms,
    vertexShader: cube2_shader.vertexShader(),
    fragmentShader: cube2_shader.fragmentShader(),
});

const cube2_mesh = new THREE.Mesh(cube2_geometry, cube2_material);
cube2_mesh.position.set(-2, 0, 0)
scene.add(cube2_mesh);

const clock = new THREE.Clock();

let stop = false;
let total_time = 0;

function animate() {
    controls.update();

    // TODO: 2.b&2.c Update uniform values
    let delta = clock.getDelta();
    cube1_uniforms.animation_time.value += delta;
    cube2_uniforms.animation_time.value += delta;


    // TODO: 2.e Rotate the cubes if the key 'c' is pressed to start the animation
    // Cube #1 should rotate around its own X-axis at a rate of 15 rpm.
    // Cube #2 should rotate around its own Y-axis at a rate of 40 rpm

    if (!stop) {
        total_time += delta;

        // cube1 does 1 rotation every 4 seconds
        let cube1_angle = - (total_time % 4) * (2 * Math.PI / 4);
        cube1_mesh.rotation.x = cube1_angle;

        // cube2 does 40 rotations per 60 sec -> 1 rotation per 1.5 sec
        let cube2_angle = (total_time % 1.5) * (2 * Math.PI / 4);
        cube2_mesh.rotation.y = cube2_angle;

    }


    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// TODO: 2.e Keyboard Event Listener
// Press 'c' to start and stop the rotating both cubes
window.addEventListener('keydown', onKeyPress);
function onKeyPress(event) {
    switch (event.key) {
        case 'c':
            stop = !stop;
            break;
    }
}