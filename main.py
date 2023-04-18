from flask import Flask, render_template
import os

app = Flask(__name__)

@app.route('/')
def index():
    if os.path.exists('node_modules/@mediapipe/camera_utils/camera_utils.js') and os.path.exists('node_modules/@mediapipe/drawing_utils/drawing_utils.js') \
            and os.path.exists('node_modules/@mediapipe/control_utils/control_utils.js') and os.path.exists('node_modules/@mediapipe/hands/hands.js'):
        return render_template('homepage_1.html')
    else:
        return render_template('homepage_2.html')
if __name__ == '__main__':
    app.run(debug=True)
