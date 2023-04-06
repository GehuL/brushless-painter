
const videoElement = document.getElementsByClassName('input_video')[0];

const canvasCamera = document.getElementById('camera_canvas');
const canvasPainting = document.getElementById('painting_canvas');
const btnPlay = document.getElementById('btnPlay');
const cursor = document.getElementById('cursor');

const ctxCam = canvasCamera.getContext('2d');
const ctxPainting = canvasPainting.getContext('2d');

let gFirstDetect = false;
let gEraseMode = false;
let gFingerDown = false;

let gTrackPoints = [5, 6, 0];
let gDatasPoints = {};

// Angle index
let gLastAngle = 0;
let gAngleSpeed = 0;

// Lissage du dessin
let gLastPos = {'x': 0, 'y': 0, 'z': 0};
let gAvPos = {'x': 0, 'y': 0, 'z': 0};
let gMoyIndex = 0;
let gPosArray = Array(10);

let gJoints = [[5, 6, 0]];
let gTimeStart = 0;

let gIsDetect = false;

function updateAveragePos(x, y, z)
{
  gPosArray[gMoyIndex] = {'x': x, 'y': y, 'z': z};
  gMoyIndex = gMoyIndex + 1;
  
  if(gMoyIndex > gPosArray.length - 1)
    gMoyIndex = 0;
}

function getAveragePos(array)
{
  let sum_x = 0;
  let sum_y = 0;
  let sum_z = 0;

  for(let i = 0; i < array.length; i++)
  {
    sum_x += array[i].x;
    sum_y += array[i].y;
    sum_z += array[i].z;
  }

  let x = sum_x / array.length;
  let y = sum_y / array.length;
  let z = sum_z / array.length;

  return {'x': x, 'y': y, 'z': z};
}

// https://www.geeksforgeeks.org/find-all-angles-of-a-triangle-in-3d/
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

function angle_joints(joints_list, landmarks)
{
  let angles = [];

  if(landmarks)
  {
    for(let joints of joints_list)
    {
      angles.push(angle_triangle(
                    landmarks[joints[0]].x, landmarks[joints[1]].x, landmarks[joints[2]].x,
                    landmarks[joints[0]].y, landmarks[joints[1]].y, landmarks[joints[2]].y,
                    landmarks[joints[0]].z, landmarks[joints[1]].z, landmarks[joints[2]].z));
    }
  }

  return angles;
}

function processResults(results)
{
  // Acquisition des mesures
  if((results.multiHandLandmarks[0]?.length) === 21 && (results.multiHandWorldLandmarks[0]?.length === 21))
  {
    let filtered3DHand = Object.assign({}, results.multiHandWorldLandmarks[0]);

    const index_finger_pos = results.multiHandLandmarks[0][8];

    let rect = canvasPainting.getBoundingClientRect();
    
    let pos_x = (1.0 - index_finger_pos.x) * canvasPainting.width - rect.x;
    let pos_y = index_finger_pos.y * canvasPainting.height - rect.y;
    let pos_z = Math.abs(index_finger_pos.z) * canvasPainting.width * 0.2;

    if(gFirstDetect)
    {
      gPosArray.fill({'x': pos_x, 'y': pos_y, 'z': pos_z});
      gFirstDetect = false;
    }

    // Stoque les positions des points tracké
    for(points of gTrackPoints)
    {
      let datas = gDatasPoints[points];

      if(datas == null)
        datas = {'datas': Array(5).fill({'x':0, 'y':0, 'z': 0}), 'index': 0};

      const pos = results.multiHandWorldLandmarks[0][points];

      datas.datas[datas.index] = {'x': pos.x * 100, 'y': pos.y * 100, 'z': pos.z * 100};
      datas.index = (datas.index + 1) % (datas.datas.length - 1);
      
      gDatasPoints[points] = datas;
    
      filtered3DHand[points] = getAveragePos(datas.datas);
    }

    // Filtrage position
    updateAveragePos(pos_x, pos_y, pos_z);
    gAvPos = getAveragePos(gPosArray);

    // Stockage des angles dans le tableau
    let angle = angle_joints(gJoints, filtered3DHand)[0];

    // Vitesse angulaire
    let elapsedTime = performance.now() - gTimeStart;
    gTimeStart = performance.now();
    gAngleSpeed = Math.abs(angle - gLastAngle) / elapsedTime * 1000;
    gLastAngle = angle;

    // console.log(gAngleSpeed.toFixed(2));
    gIsDetect = true;
  }else
  {
    gIsDetect = false;
  }
}

function onResults(results) 
{
  ctxCam.save();
  ctxCam.clearRect(0, 0, canvasCamera.width, canvasCamera.height);

  // ctxCam.drawImage(results.image, 0, 0, canvasCamera.width, canvasCamera.height);
  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      drawConnectors(ctxCam, landmarks, HAND_CONNECTIONS,
                     {color: '#00FF00', lineWidth: 5});
      drawLandmarks(ctxCam, landmarks, {color: '#FF0000', lineWidth: 2});
    }
  }
  ctxCam.restore(); 
  

  // Mesures des données de la main
  processResults(results);

  // Partie fonctionnelle
  if(gIsDetect)
  {
    // Dessin
    if(gLastAngle > 164)
    {
      processDrawing(gAvPos.x, gAvPos.y, gAvPos.z);
    }else
    {
      gLastPos = null;
    }
    setCursor(gAvPos.x - gAvPos.z, gAvPos.y - gAvPos.z, gAvPos.z);

    // console.log('Angle vitesse:' + Math.round(gAngleSpeed) + ' Angle:' + gLastAngle);

    if(gAngleSpeed > 50 && gLastAngle < 165)
    {
      let div = document.elementFromPoint(gAvPos.x, gAvPos.y);
      div?.click();
      console.log('Click !');
    }
  }
}

function processDrawing(pos_x, pos_y, pos_z)
{
    // Drawing
    if(gLastPos !=  null)
    {
      const eraserScale = 1.5;
      
      if(gEraseMode)
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
        ctxPainting.moveTo(gLastPos.x, gLastPos.y);
        ctxPainting.lineTo(pos_x, pos_y);
        ctxPainting.stroke();
      }
    }
    gLastPos = {'x': pos_x, 'y': pos_y, 'z': pos_z};
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
    
        reset_finger_draw();
      }
    isCameraActive = !isCameraActive;

});

function resizeCanvas()
{
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  ctxCam.canvas.width = canvasWidth;
  ctxCam.canvas.height = canvasHeight;

  ctxPainting.canvas.width = canvasWidth;
  ctxPainting.canvas.height = canvasHeight;
}

function reset_finger_draw()
{
  gLastPos = null;
  gMoyIndex = 0;
  gFirstDetect = true;
}

function setCursor(x, y, w)
{
  cursor.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  cursor.style.width = w + 'px';
  cursor.style.height = w + 'px';
}

window.addEventListener('resize', resizeCanvas);

window.addEventListener('mousedown', (event) => {
  reset_finger_draw();
});
window.addEventListener('mousemove', (event) => {
  if(event?.buttons === 1){
    processDrawing(event?.x, event?.y, 10);
    setCursor(event?.x - 10, event?.y - 10, 10);
  }
});

reset_finger_draw();
resizeCanvas();