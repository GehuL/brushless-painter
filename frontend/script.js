
const videoElement = document.getElementsByClassName('input_video')[0];

const canvasCamera = document.getElementById('camera_canvas');
const canvasPainting = document.getElementById('painting_canvas');
const btnPlay = document.getElementById('btnPlay');
const cursor = document.getElementById('cursor');

const ctxCam = canvasCamera.getContext('2d');
const ctxPainting = canvasPainting.getContext('2d');

let firstDetect = false;
let eraseMode = false;

// Moyenne glissante angle index
let angleValues = Array(10);
let angle_index = 0;

// Lissage du dessin
let lastPos = {'x': 0, 'y': 0, 'z': 0};
let av_pos = {'x': 0, 'y': 0, 'z': 0};
let moy_index = 0;
let moy_pos = Array(15);

function updateAveragePos(x, y, z)
{
  moy_pos[moy_index] = {'x': x, 'y': y, 'z': z};
  moy_index = moy_index + 1;
  
  if(moy_index >= moy_pos.length - 1)
    moy_index = 0;
}

function getAveragePos()
{
  let sum_x = 0;
  let sum_y = 0;
  let sum_z = 0;

  for(let i = 0; i < moy_pos.length; i++)
  {
    sum_x += moy_pos[i].x;
    sum_y += moy_pos[i].y;
    sum_z += moy_pos[i].z;
  }

  let x = sum_x / moy_pos.length;
  let y = sum_y / moy_pos.length;
  let z = sum_z / moy_pos.length;

  return {'x': x, 'y': y, 'z': z};
}

function diffVec(vec1, vec2)
{
  return {'x': vec2.x - vec1.x, 'y': vec2.y - vec1.y, 'z': vec2.z - vec1.z};
}

function distanceVec(vec1, vec2)
{
  const dx = (vec2.x - vec1.x) * (vec2.x - vec1.x);
  const dy = (vec2.y - vec1.y) * (vec2.y - vec1.y);
  const dz = (vec2.z - vec1.z) * (vec2.z - vec1.z);

  return Math.sqrt(dx + dy + dz);
}

function angleBetweenVec(vec1, vec2)
{
  const dot = vec1.x * vec2.x + vec1.y * vec2.y + vec1.z * vec2.z;
  const mag1 = Math.sqrt(vec1.x * vec1.x + vec1.y * vec1.y + vec1.z * vec1.z);
  const mag2 = Math.sqrt(vec2.x * vec2.x + vec2.y * vec2.y + vec2.z * vec2.z);

  return Math.acos(dot / (mag1 * mag2));
}

function angle_triangle(x1,x2,x3,y1,y2,y3,z1,z2,z3)
{
    let num = (x2-x1)*(x3-x1)+(y2-y1)*(y3-y1)+(z2-z1)*(z3-z1) ;
   
    let den = Math.sqrt(
                (x2-x1)**2  +
                (y2-y1)**2  + 
                (z2-z1)**2) *
              Math.sqrt(
                (x3-x1)**2 +
                (y3-y1)**2 + 
                (z3-z1)**2
                );
   
    let angle = Math.acos(num / den)*(180.0/3.141592653589793238463) ;
   
    return angle ;
}

function onResults(results) 
{
  ctxCam.save();
  ctxCam.clearRect(0, 0, canvasCamera.width, canvasCamera.height);
  //ctxCam.drawImage(
  //    results.image, 0, 0, canvasCamera.width, canvasCamera.height);
  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      drawConnectors(ctxCam, landmarks, HAND_CONNECTIONS,
                     {color: '#00FF00', lineWidth: 5});
      drawLandmarks(ctxCam, landmarks, {color: '#FF0000', lineWidth: 2});
    }
  }
  ctxCam.restore(); 
  
  // Mémorise en continue chaque nouvelle position
  if(results.multiHandLandmarks[0]?.length === 21)
  {
    const index_finger_pos = results.multiHandLandmarks[0][8];

    let pos_x = (1.0 - index_finger_pos.x) * canvasPainting.width;
    let pos_y = index_finger_pos.y * canvasPainting.height;
    let pos_z = Math.abs(index_finger_pos.z) * canvasPainting.width * 0.2;
  
    if(firstDetect)
    {
      av_pos = {'x': pos_x, 'y': pos_y, 'z': pos_z};
      moy_pos.fill(av_pos);
      firstDetect = false;
    }
    
    updateAveragePos(pos_x, pos_y, pos_z);
    av_pos = getAveragePos();

    processDrawing(av_pos.x, av_pos.y, av_pos.z);
    setCursor(pos_x - av_pos.z, pos_y - av_pos.z, av_pos.z);
  }

  // Gestion du click en fonction de l'angle de l'index
  if(results.multiHandWorldLandmarks[0]?.length === 21)
  {
    const A = results.multiHandWorldLandmarks[0][6];
    const B = results.multiHandWorldLandmarks[0][7];
    const C = results.multiHandWorldLandmarks[0][5];

    const angle = angle_triangle(A.x, B.x, C.x, A.y, B.y, C.y, A.z, B.z, C.z);
    console.log(angle);

    angleValues[angle_index] = angle;
    angle_index = angle_index < angleValues.length - 1 ? ++angle_index : 0;

    let sum = 0;
    angleValues.forEach((e) => sum += e);

    console.log(sum / angleValues.length);

    if(sum / angleValues.length < 145)
    {
      let div = document.elementFromPoint(av_pos.x, av_pos.y);
      div?.click();
    }
  }
}

function processDrawing(pos_x, pos_y, pos_z)
{
    // Drawing
    if(lastPos !== null)
    {
      const eraserScale = 1.5;
      
      if(eraseMode)
      {
        const eraserwidth = pos_z * eraserScale;
        
        ctxPainting.save();
        ctxPainting.clearRect(pos_x, pos_y, eraserwidth, eraserwidth);
        ctxPainting.restore();
      }else
      {
        ctxPainting.lineWidth = pos_z;
        ctxPainting.lineCap = 'round';
        
        ctxPainting.beginPath();
        ctxPainting.moveTo(lastPos.x, lastPos.y);
        ctxPainting.lineTo(pos_x, pos_y);
        ctxPainting.stroke();
      }
    }
    lastPos = {'x': pos_x, 'y': pos_y, 'z': pos_z};
}

const hands = new Hands({locateFile: (file) => {
  //return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  return `node_modules/@mediapipe/hands/${file}`;
}});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 0,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
hands.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({image: videoElement});
  },
  facingMode: 'user',
  width: 1280,
  height: 720
});

var isCameraActive = false;

// Play stop camera 
btnPlay.addEventListener('click', () => {
   
    if(isCameraActive)
    {
        camera.stop();
        btnPlay.textContent = 'PLAY';
    }else{
        camera.start();
        btnPlay.textContent = 'STOP';
    
        ctxPainting.clearRect(0, 0 , canvasPainting.width, canvasPainting.height);
    
        init();
      }
    isCameraActive = !isCameraActive;

});

function resizeCanvas()
{
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  ctxPainting.canvas.width = ctxCam.canvas.width = canvasWidth;
  ctxPainting.canvas.height = ctxCam.canvas.height = canvasHeight;
}

function init()
{
  lastPos = null;
  moy_pos.fill({'x': 0, 'y': 0, 'z': 0});
  moy_index = 0;
  firstDetect = true;
}

function setCursor(x, y, w)
{
  cursor.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  cursor.style.width = w + 'px';
  cursor.style.height = w + 'px';
}

window.addEventListener('resize', resizeCanvas);

window.addEventListener('mousedown', (event) => {
  init();
});
window.addEventListener('mousemove', (event) => {
  if(event?.buttons === 1){
    processDrawing(event?.x, event?.y, 10);
    setCursor(event?.x - 10, event?.y - 10, 10);
  }
});

init();
resizeCanvas();