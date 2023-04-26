from flask import Flask, render_template, url_for
import os

app = Flask(__name__)

# Scripts mediapipe requis pour la page web
MEDIAPIPE_FILES = ['camera_utils.js', 'drawing_utils.js', 'control_utils.js', 'hands.js']

# Chemin des scripts mediapipe
CDN_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe'
LOCAL_MEDIAPIPE_PATH = 'static/node_modules/@mediapipe'

mediapipe_path = LOCAL_MEDIAPIPE_PATH

# Retourne Vrai si les packages npm de mediapipe sont installés
def check_mediapipe():

    output = os.popen('cd static ; npm list -p').read().split('\n')
    for filename in MEDIAPIPE_FILES:
        
        present = False
        for path in output:
            if path.endswith(filename.removesuffix('.js')):
                present = True
        
        if not present:
            return False
                
    return True

@app.route('/')
def homepage():
    return render_template('homepage.html', mp_path=mediapipe_path)

if check_mediapipe():
    mediapipe_path = LOCAL_MEDIAPIPE_PATH
else:
    mediapipe_path = CDN_URL

if __name__ == '__main__':
    app.run(debug=True)