const script_path = ["hands/hands.js", "camera_utils/camera_utils.js", "control_utils/control_utils.js", "drawing_utils/drawing_utils.js"];

const localPath = "/node_modules/@mediapipe/";
const cdnUrl = "https://cdn.jsdelievr.net/npm/@mediapipe/";

// Variable utilisé par le fichier script.js pour charger le reste
let scriptPath = localPath;
let nbrLoaded = 0;

function onLoaded(ev)
{
    console.log(this.element.src + " chargé");

    nbrLoaded++;
    // Check si tous les fichiers sont chargés
    if(nbrLoaded === script_path.length)
    {
        // Chargement du script de détection de main
        const el = document.createElement("script");
        el.setAttribute("src", "script.js");
        el.setAttribute("defer", true); // Charge le script en dernier 
        el.setAttribute("type", "text/javascript");
        document.head.appendChild(el);

        console.log("script.js chargé");
     }
}

function onError(ev)
{
    document.head.removeChild(this.element);
    this.element = document.createElement("script");
    this.element.src = cdnUrl.concat(this.arg);
    this.element.onerror = null; // Evite le rebouclage d'erreur
    this.element.onload = onLoaded;
    document.head.appendChild(this.element);
    scriptPath = cdnUrl;
}

// Charge les fichiers requis pour la détection de main
for(filename of script_path)
{
    const element = document.createElement("script");
    
    element.setAttribute("src", localPath.concat(filename));
    element.setAttribute("async", true);
    element.setAttribute("type", "text/javascript");

    let bundle = {arg: filename, element, onError};

    // En cas d'erreur, charge le fichier depuis le CDN
    element.onerror = onError.bind(bundle);
    element.onload = onLoaded.bind(bundle);

    document.head.appendChild(element);
}