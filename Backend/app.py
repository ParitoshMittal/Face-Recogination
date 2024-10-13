import os
import csv
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from utils import load_encodings, save_new_face, recognize_faces_and_mark_attendance

app = Flask(__name__)
CORS(app)

encoding_file = "known_face_encodings.pkl"
attendance_file = "attendance.csv"

known_face_encodings, known_face_names, known_face_enrollment = load_encodings(encoding_file)

@app.route('/register_person', methods=['POST'])
def register_person_api():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided."}), 400

    if 'name' not in request.form:
        return jsonify({"error": "No name provided."}), 400

    if 'enrollment_no' not in request.form:
        return jsonify({"error": "No enrollment number provided."}), 400

    image_file = request.files['image']
    name = request.form['name']
    enrollment_no = request.form['enrollment_no']  # Get the enrollment number

    if image_file.filename == '':
        return jsonify({"error": "No selected file."}), 400

    if image_file:
        uploads_folder = "uploads"
        os.makedirs(uploads_folder, exist_ok=True)

        filename = secure_filename(image_file.filename)
        image_path = os.path.join(uploads_folder, filename)
        image_file.save(image_path)

        known_faces_folder = "known_faces"
        os.makedirs(known_faces_folder, exist_ok=True)

        result = save_new_face(image_path, encoding_file, known_faces_folder, name, enrollment_no)

        os.remove(image_path)

        # Reload encodings after saving a new face
        global known_face_encodings, known_face_names, known_face_enrollment
        known_face_encodings, known_face_names, known_face_enrollment = load_encodings(encoding_file)

        return jsonify({"message": result}), 200

@app.route('/mark_attendance', methods=['POST'])
def mark_attendance_api():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided."}), 400

    image_file = request.files['image']

    if image_file.filename == '':
        return jsonify({"error": "No selected file."}), 400

    if image_file:
        filename = secure_filename(image_file.filename)
        image_path = os.path.join("uploads", filename)
        image_file.save(image_path)

        result = recognize_faces_and_mark_attendance(image_path, known_face_encodings, known_face_names, known_face_enrollment, attendance_file)

        os.remove(image_path)

        if "Attendance marked" in result:
            return jsonify({"message": result}), 200
        else:
            return jsonify({"error": result}), 400
        
@app.route('/attendance_list', methods=['GET'])
def get_attendance_list():
    if not os.path.exists(attendance_file):
        return jsonify({"error": "Attendance file not found"}), 404

    attendance_list = []
    with open(attendance_file, 'r') as file:
        csv_reader = csv.reader(file)
        for row in csv_reader:
            attendance_list.append({
                "name": row[0],
                "enrollment": row[1],
                "date_time": row[2]
            })

    return jsonify(attendance_list), 200

if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')

    app.run(debug=True, host="0.0.0.0", port=2000)
