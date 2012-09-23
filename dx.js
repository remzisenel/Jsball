var camera, scene, renderer, geometry, material, mesh;
var lastTime = (new Date()).getTime();


var ball = {};
var paddle1 = {};
var container = {};
var bricks = [];
var brickcount;

init();
animate();
function init() {
    scene = new THREE.Scene();
    var width = window.innerWidth -10 ;
    var height = window.innerHeight -10 ;
    camera = new THREE.PerspectiveCamera( 75, width / height, 1, 10000 );
    camera.position.z = 1000;
    scene.add( camera );

    ball.sceneObject = new THREE.Mesh(new THREE.SphereGeometry(10,8,8),new THREE.MeshBasicMaterial( { color: 0xD68D3A } ));
    ball.sceneObject.position.z = 0;
    ball.sceneObject.position.y = -200;
    scene.add( ball.sceneObject );

    paddle1.width = 150;
    paddle1.sceneObject = new THREE.Mesh( new THREE.CubeGeometry( paddle1.width, 20, 20 ), new THREE.MeshBasicMaterial( { color: 0x84915E } ));
    paddle1.sceneObject.position.y = -700;
    paddle1.sceneObject.position.z = 0;
    scene.add( paddle1.sceneObject );

    for(var i =0;i<20;i++)
    {
    	for(var j =0;j<10;j++)
    	{
    		var brick = {};
    		brick = new THREE.Mesh( new THREE.CubeGeometry( 80, 30, 20 ), new THREE.MeshBasicMaterial( { color: 0xD0E67A, wireframe: false } ));
    		brick.position.y = j * 30;
    		brick.position.x = -800 + (i * 80);
    		scene.add(brick);
    		bricks[brick.id] = brick;
    	}
    }
    brickcount = 20*10;

    container.sceneObject = new THREE.Mesh( new THREE.CubeGeometry( 2000, 2000, 1 ), new THREE.MeshBasicMaterial( { color: 0xD0E67A , wireframe: true } ));
    container.sceneObject.position.z = -10;
    scene.add( container.sceneObject );

    renderer = new THREE.CanvasRenderer();
    renderer.setSize( width,height );

    document.body.appendChild( renderer.domElement );
}

function animate() {
    // note: three.js includes requestAnimationFrame shim
    requestAnimationFrame( animate );
	curTime = (new Date()).getTime();
	deltaTime = curTime - lastTime;
    calculateBall(deltaTime);
    lastTime = curTime;
    render();
}

function render() {
    renderer.render( scene, camera );
}

function calculateBall(deltaTime)
{
	if(!ball.speed) initBall();

	totalSpeed = Math.sqrt((ball.speed.x*ball.speed.x) + (ball.speed.y*ball.speed.y));
	var distanceToGo = totalSpeed * deltaTime;


	//check collusion with paddle
	var vector = new THREE.Vector3( ball.speed.x, ball.speed.y, 0 );
	var ray = new THREE.Ray( ball.sceneObject.position, vector.normalize());
	var intersections = ray.intersectObject(paddle1.sceneObject);
	if(intersections.length > 0) 
	{
		if(intersections[0].distance < distanceToGo)
		{
			var diff = intersections[0].point.x - paddle1.sceneObject.position.x;
			var slope = diff / paddle1.width;
			ball.speed.x = slope*3;
			ball.speed.y *= -1;
		}
	}
	//check collusion with boxes
	var vector = new THREE.Vector3( ball.speed.x, ball.speed.y, 0 );
	var ray = new THREE.Ray( ball.sceneObject.position, vector.normalize());
	var boxIntersections = ray.intersectObjects(bricks);
	if(boxIntersections.length > 0) 
	{
		while(boxIntersections[0].distance < distanceToGo)
		{
			if(boxIntersections[0].face.normal.y != 0) ball.speed.y *= -1;
			if(boxIntersections[0].face.normal.x != 0) ball.speed.x *= -1;
			scene.remove( boxIntersections[0].object );
			bricks[boxIntersections[0].object.id] = null;
			brickcount--;
			if(brickcount == 0)
			{
				//ENDGAME
			}
			vector = new THREE.Vector3( ball.speed.x, ball.speed.y, 0 );
			ray = new THREE.Ray( ball.sceneObject.position, vector.normalize());
			boxIntersections = ray.intersectObjects(bricks);
		}
		
	}

	//bounce all the way!
	ball.sceneObject.position.y += ball.speed.y * deltaTime;	
	ball.sceneObject.position.x += ball.speed.x * deltaTime;
	if(ball.sceneObject.position.y > 750)
	{

		ball.sceneObject.position.y -= (ball.sceneObject.position.y - 750);
		ball.speed.y = -1*ball.speed.y;
	}
	else if(ball.sceneObject.position.y < -750)
	{
		ball.sceneObject.position.y -= (ball.sceneObject.position.y + 750);
		ball.speed.y = -1*ball.speed.y;
	}
	if(ball.sceneObject.position.x >= (999))
	{
		ball.sceneObject.position.x = (999)
		ball.speed.x = -1*ball.speed.x;
	}
	else if(ball.sceneObject.position.x <= (-999))
	{
		ball.sceneObject.position.x = (-999)
		ball.speed.x = -1*ball.speed.x;
	}
	
	

}

function initBall()
{
	ball.speed = {};
	ball.speed.x = 0.0;
	ball.speed.y = 0.6;
}


//set mouse controller
document.onmousemove = movePaddle;

function movePaddle(ev)
{
	ev = ev || window.event;
	var percentage = ev.x / window.innerWidth;
	var x = -1000+(paddle1.width/2)+((2000-paddle1.width)*percentage);

	paddle1.sceneObject.position.x = x;
}