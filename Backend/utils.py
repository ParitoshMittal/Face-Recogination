import face_recognition
import os
import pickle
from PIL import Image
import csv
from datetime import datetime

def load_encodings(encoding_file):
    if os.path.exists(encoding_file):
        with open(encoding_file, "rb") as f:
            known_face_encodings, known_face_names, known_face_enrollment = pickle.load(f)
            print("Loaded encodings from file.")
            return known_face_encodings, known_face_names, known_face_enrollment
    else:
        print(f"Encoding file {encoding_file} not found!")
        return [], [], []

def save_new_face(image_path, encoding_file, known_faces_folder, name, enrollment_no):
    known_face_encodings, known_face_names, known_face_enrollment = load_encodings(encoding_file)

    image = face_recognition.load_image_file(image_path)
    encodings = face_recognition.face_encodings(image)

    if not encodings:
        return "No Person found in the image."

    new_encoding = encodings[0]

    for existing_encoding in known_face_encodings:
        if face_recognition.compare_faces([existing_encoding], new_encoding)[0]:
            return "This person is already registered."

    known_face_encodings.append(new_encoding)
    known_face_names.append(name)
    known_face_enrollment.append(enrollment_no)

    with open(encoding_file, "wb") as f:
        pickle.dump((known_face_encodings, known_face_names, known_face_enrollment), f)
        print(f"Updated encodings saved to {encoding_file}.")

    # Save the image with enrollment number in the filename
    new_image_path = os.path.join(known_faces_folder, f"{name}-{enrollment_no}.jpg")
    pil_image = Image.fromarray(image)
    pil_image.save(new_image_path)

    return f"New Face saved for {name} with Enrollment No. {enrollment_no}."

def recognize_faces_and_mark_attendance(target_image_path, known_face_encodings, known_face_names, known_face_enrollment, attendance_file):
    target_image = face_recognition.load_image_file(target_image_path)
    target_face_encodings = face_recognition.face_encodings(target_image)

    if len(target_face_encodings) == 0:
        return "No Face found in the Image."

    recognized_names = []
    recognized_enrollment_nos = []

    for target_encoding in target_face_encodings:
        if len(known_face_encodings) == 0:
            return "No Face encoding is available for comparison."

        matches = face_recognition.compare_faces(known_face_encodings, target_encoding)

        if not any(matches):
            continue
        
        face_distances = face_recognition.face_distance(known_face_encodings, target_encoding)

        if len(face_distances) == 0:
            continue

        best_match_index = face_distances.argmin()

        if matches[best_match_index]:
            recognized_name = known_face_names[best_match_index]
            recognized_enrollment_no = known_face_enrollment[best_match_index]
            recognized_names.append(recognized_name)
            recognized_enrollment_nos.append(recognized_enrollment_no)

    if recognized_names and recognized_enrollment_nos:
        attendance_results = []
        for name, enrollment_no in zip(recognized_names, recognized_enrollment_nos):
            attendance_results.append(mark_attendance(name, enrollment_no, attendance_file))
        return "; ".join(attendance_results)
    else:
        return "Face not recognized."

def mark_attendance(name, enrollment_no, attendance_file):
    now = datetime.now()
    timestamp = now.strftime("%Y-%m-%d %H:%M:%S")

    with open(attendance_file, mode="a", newline="") as file:
        writer = csv.writer(file)
        writer.writerow([name, enrollment_no, timestamp])  # Include enrollment number in attendance
        return f"Attendance marked for {name} (Enrollment No. {enrollment_no}) at {timestamp}."
