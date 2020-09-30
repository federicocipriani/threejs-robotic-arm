Physijs.scripts.worker = '../libs/physijs_worker.js';
Physijs.scripts.ammo = '../libs/ammo.js';

let ground, scene, controls;

init();
createGround();
createRoboticArm();
animate();

function init() {
    // Setup scene
    scene = new Physijs.Scene();
    // scene.background = new THREE.Color(0xe0e0e0);
    scene.setGravity(new THREE.Vector3(0, -10, 0));

    // Setup camera
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(10, 10, 20);
    // camera.lookAt(new THREE.Vector3(50, 30, 10));

    // Setup renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Like a background color
    renderer.setClearColor('#e5e5e5');
    document.body.appendChild(renderer.domElement);

    // Setup geometry
    // const stoneGeom = new THREE.BoxGeometry(1, 1, 1);
    // const stone = new Physijs.BoxMesh(
    //     stoneGeom,
    //     new THREE.MeshPhongMaterial({ color: 0xff0000 })
    // );
    // stone.position.set(0, 20, 0);
    // scene.add(stone);

    const light = new THREE.PointLight(0xffffff, 1, 500);
    light.position.set(10, 10, 5);
    scene.add(light);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    // controls.update();

    //controls.update() must be called after any manual changes to the camera's transform
    camera.position.set(0, 20, 100);
}

function createGround() {
    var ground_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ color: 0xffffff }),
        0.9,
        0.3
    );

    ground = new Physijs.BoxMesh(
        new THREE.BoxGeometry(20, 0.5, 20),
        ground_material,
        0
    );
    ground.position.set(0, 0, 0);
    scene.add(ground);
}

function createRoboticArm() {
    var arm_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ color: 0xffffff }),
        0.9,
        0.3
    );

    var joint_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ color: 0xffff00 }),
        0.9,
        0.3
    );

    // --------------------------------------------------------
    // ARM BASE
    var base = new Physijs.CylinderMesh(
        new THREE.CylinderGeometry(4, 4, 1, 50),
        joint_material
    );
    base.position.set(0, 0.75, 0);

    var arm_base = new Physijs.BoxMesh(
        new THREE.BoxGeometry(1, 3, 3),
        arm_material,
        0
    );
    arm_base.position.set(0, 2, 0);

    base.add(arm_base);
    scene.add(base);

    var constraint_base = new Physijs.DOFConstraint(
        ground, // First object to be constrained
        base, // OPTIONAL second object - if omitted then physijs_mesh_1
        // will be constrained to the scene
        new THREE.Vector3(0, 1, 0) // point in the scene to apply the constraint
    );
    scene.addConstraint(constraint_base);
    constraint_base.setAngularLowerLimit(new THREE.Vector3(0, -Math.PI, 0));
    constraint_base.setAngularUpperLimit(new THREE.Vector3(0, Math.PI, 0));

    // --------------------------------------------------------
    // MIDDLE SECTION
    var arm_middle = new Physijs.BoxMesh(
        new THREE.BoxGeometry(1, 5, 3),
        arm_material,
        0
    );

    var first_joint = new Physijs.CylinderMesh(
        new THREE.CylinderGeometry(1, 1, 3, 50),
        joint_material,
        0
    );
    first_joint.rotation.x = Math.PI / 2;
    first_joint.position.set(0, -3, 0);

    arm_middle.position.set(0, 8.25, 0);
    arm_middle.add(first_joint);

    scene.add(arm_middle);

    // --------------------------------------------------------
    // CONSTRAINT FIRST JOINT - ARM MIDDLE
    var constraint_j1 = new Physijs.HingeConstraint(
        arm_middle, // First object to be constrained
        base, // OPTIONAL second object - if omitted then physijs_mesh_1
        //will be constrained to the scene
        new THREE.Vector3(0, 4.75, 0), // point in the scene to apply the constraint
        new THREE.Vector3(0, 0, 1) // Axis along which the hinge lies -
        //in this case it is the X axis
    );
    scene.addConstraint(constraint_j1);
    constraint_j1.setLimits(
        -Math.PI / 3, // minimum angle of motion, in radians
        Math.PI / 3, // maximum angle of motion, in radians
        0, // applied as a factor to constraint error
        0 // controls bounce at limit (0.0 == no bounce)
    );

    // --------------------------------------------------------
    // END SECTION
    var arm_end = new Physijs.BoxMesh(
        new THREE.BoxGeometry(1, 3, 3),
        arm_material,
        0
    );

    var second_joint = new Physijs.CylinderMesh(
        new THREE.CylinderGeometry(1, 1, 3, 50),
        joint_material,
        0
    );
    second_joint.rotation.x = Math.PI / 2;
    second_joint.position.set(0, -1.5, 0);

    arm_end.position.set(0, 13.25, 0);
    arm_end.add(second_joint);

    scene.add(arm_end);

    // --------------------------------------------------------
    // CONSTRAINT SECOND JOINT - ARM END
    var constraint_j2 = new Physijs.HingeConstraint(
        arm_middle, // First object to be constrained
        arm_end, // OPTIONAL second object - if omitted then physijs_mesh_1
        //will be constrained to the scene
        new THREE.Vector3(0, 12, 0), // point in the scene to apply the constraint
        new THREE.Vector3(0, 0, 1) // Axis along which the hinge lies -
        //in this case it is the X axis
    );
    scene.addConstraint(constraint_j2);
    constraint_j2.setLimits(
        -Math.PI / 3, // minimum angle of motion, in radians
        Math.PI / 3, // maximum angle of motion, in radians
        0, // applied as a factor to constraint error
        0 // controls bounce at limit (0.0 == no bounce)
    );
}

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();
});

function animate() {
    scene.simulate();
    renderer.render(scene, camera);
    controls.update();
    requestAnimationFrame(animate);
}

document.addEventListener('keydown', function (ev) {
    console.log(ev.keyCode);
    switch (ev.key) {
        case 77:
            // Left
            constraint_base.configureAngularMotor(
                1,
                -Math.PI / 2,
                Math.PI / 2,
                1,
                200
            );
            constraint_base.enableAngularMotor(1);
            break;
    }
});
