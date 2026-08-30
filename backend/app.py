from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

import os
import sqlite3
from pathlib import Path

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

from werkzeug.utils import secure_filename

import time


# =====================================================
# CREATE FLASK APPLICATION
# =====================================================

app = Flask(__name__)

CORS(app)


# =====================================================
# DATABASE LOCATION
# =====================================================

DATABASE = (
    Path(__file__).resolve().parent
    / "civicvoice.db"
)


# =====================================================
# UPLOAD SETTINGS
# =====================================================

UPLOAD_FOLDER = (
    Path(__file__).resolve().parent
    / "uploads"
)

UPLOAD_FOLDER.mkdir(exist_ok=True)

app.config["UPLOAD_FOLDER"] = str(UPLOAD_FOLDER)


ALLOWED_EXTENSIONS = {

    "png",
    "jpg",
    "jpeg",
    "gif",
    "webp"

}


def allowed_file(filename):

    return (

        "." in filename

        and

        filename.rsplit(
            ".",
            1
        )[1].lower()

        in ALLOWED_EXTENSIONS

    )


# =====================================================
# DATABASE CONNECTION
# =====================================================

def get_db_connection():

    connection = sqlite3.connect(
        DATABASE,
        timeout=10
    )

    connection.row_factory = sqlite3.Row

    return connection


# =====================================================
# CREATE DATABASE TABLES
# =====================================================

def create_tables():

    connection = get_db_connection()

    cursor = connection.cursor()


    # -------------------------------------------------
    # USERS TABLE
    # -------------------------------------------------

    cursor.execute("""

        CREATE TABLE IF NOT EXISTS users (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT NOT NULL,

            username TEXT UNIQUE NOT NULL,

            phone TEXT UNIQUE,

            email TEXT UNIQUE,

            password_hash TEXT NOT NULL,

            verified INTEGER DEFAULT 1,

            created_at TIMESTAMP
                DEFAULT CURRENT_TIMESTAMP

        )

    """)


    # -------------------------------------------------
    # PROBLEMS TABLE
    # -------------------------------------------------

    cursor.execute("""

        CREATE TABLE IF NOT EXISTS problems (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            user_id INTEGER NOT NULL,

            category TEXT NOT NULL,

            location TEXT NOT NULL,

            description TEXT NOT NULL,

            image TEXT,

            status TEXT DEFAULT 'Reported',

            assigned_department TEXT,

            admin_reply TEXT,

            created_at TIMESTAMP
                DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
                REFERENCES users(id)

        )

    """)


    # -------------------------------------------------
    # COMMENTS TABLE
    # -------------------------------------------------

    cursor.execute("""

        CREATE TABLE IF NOT EXISTS comments (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            problem_id INTEGER NOT NULL,

            user_id INTEGER NOT NULL,

            comment TEXT NOT NULL,

            created_at TIMESTAMP
                DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (problem_id)
                REFERENCES problems(id),

            FOREIGN KEY (user_id)
                REFERENCES users(id)

        )

    """)


    # -------------------------------------------------
    # SUPPORTS TABLE
    # -------------------------------------------------

    cursor.execute("""

        CREATE TABLE IF NOT EXISTS supports (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            problem_id INTEGER NOT NULL,

            user_id INTEGER NOT NULL,

            UNIQUE(problem_id, user_id),

            FOREIGN KEY (problem_id)
                REFERENCES problems(id),

            FOREIGN KEY (user_id)
                REFERENCES users(id)

        )

    """)


    connection.commit()

    connection.close()


# =====================================================
# HOME
# =====================================================

@app.route("/")
def home():

    return "CivicVoice Backend is running!"


# =====================================================
# SERVE UPLOADED IMAGES
# =====================================================

@app.route("/uploads/<filename>")
def uploaded_file(filename):

    return send_from_directory(

        app.config["UPLOAD_FOLDER"],

        filename

    )


# =====================================================
# REGISTER USER
# =====================================================

@app.route(
    "/api/register",
    methods=["POST"]
)
def register():

    data = request.get_json()


    if not data:

        return jsonify({

            "status": "error",

            "message":
                "Invalid request data."

        }), 400


    name = data.get("name")

    username = data.get("username")

    phone = data.get("phone")

    email = data.get("email")

    password = data.get("password")


    if not name or not username or not password:

        return jsonify({

            "status": "error",

            "message":
                "Name, username and password are required."

        }), 400


    connection = get_db_connection()

    cursor = connection.cursor()


    existing_user = cursor.execute(

        "SELECT id FROM users WHERE username = ?",

        (username,)

    ).fetchone()


    if existing_user:

        connection.close()

        return jsonify({

            "status": "error",

            "message":
                "Username already exists."

        }), 409


    if phone:

        existing_phone = cursor.execute(

            "SELECT id FROM users WHERE phone = ?",

            (phone,)

        ).fetchone()


        if existing_phone:

            connection.close()

            return jsonify({

                "status": "error",

                "message":
                    "Phone number already exists."

            }), 409


    if email:

        existing_email = cursor.execute(

            "SELECT id FROM users WHERE email = ?",

            (email,)

        ).fetchone()


        if existing_email:

            connection.close()

            return jsonify({

                "status": "error",

                "message":
                    "Email already exists."

            }), 409


    password_hash = generate_password_hash(
        password
    )


    cursor.execute("""

        INSERT INTO users (

            name,
            username,
            phone,
            email,
            password_hash,
            verified

        )

        VALUES (?, ?, ?, ?, ?, ?)

    """, (

        name,
        username,
        phone,
        email,
        password_hash,
        1

    ))


    connection.commit()

    connection.close()


    return jsonify({

        "status": "success",

        "message":
            "Account created successfully."

    }), 201


# =====================================================
# LOGIN USER
# =====================================================

@app.route(
    "/api/login",
    methods=["POST"]
)
def login():

    data = request.get_json()


    if not data:

        return jsonify({

            "status": "error",

            "message":
                "Invalid request data."

        }), 400


    login_value = data.get("login")

    password = data.get("password")


    if not login_value or not password:

        return jsonify({

            "status": "error",

            "message":
                "Please enter login details."

        }), 400


    connection = get_db_connection()

    cursor = connection.cursor()


    user = cursor.execute("""

        SELECT *

        FROM users

        WHERE username = ?

        OR phone = ?

        OR email = ?

    """, (

        login_value,
        login_value,
        login_value

    )).fetchone()


    if user is None:

        connection.close()

        return jsonify({

            "status": "error",

            "message":
                "Account not found."

        }), 401


    if not check_password_hash(

        user["password_hash"],

        password

    ):

        connection.close()

        return jsonify({

            "status": "error",

            "message":
                "Incorrect password."

        }), 401


    connection.close()


    return jsonify({

        "status": "success",

        "message":
            "Login successful!",

        "username":
            user["username"],

        "name":
            user["name"]

    }), 200


# =====================================================
# REPORT A PROBLEM
# =====================================================

@app.route(
    "/api/problems",
    methods=["POST"]
)
def create_problem():

    username = request.form.get("username")

    category = request.form.get("category")

    location = request.form.get("location")

    description = request.form.get("description")


    if (

        not username
        or not category
        or not location
        or not description

    ):

        return jsonify({

            "status": "error",

            "message":
                "Please fill all required fields."

        }), 400


    connection = get_db_connection()

    cursor = connection.cursor()


    user = cursor.execute(

        "SELECT id FROM users WHERE username = ?",

        (username,)

    ).fetchone()


    if user is None:

        connection.close()

        return jsonify({

            "status": "error",

            "message":
                "User not found."

        }), 401


    # Handle image

    image = request.files.get("image")

    image_filename = None


    if image and image.filename:

        if not allowed_file(
            image.filename
        ):

            connection.close()

            return jsonify({

                "status": "error",

                "message":
                    "Invalid image type."

            }), 400


        original_filename = secure_filename(
            image.filename
        )


        image_filename = (

            f"{user['id']}_"

            f"{int(time.time())}_"

            f"{original_filename}"

        )


        image.save(

            UPLOAD_FOLDER
            /
            image_filename

        )


    cursor.execute("""

        INSERT INTO problems (

            user_id,
            category,
            location,
            description,
            image,
            status

        )

        VALUES (?, ?, ?, ?, ?, ?)

    """, (

        user["id"],
        category,
        location,
        description,
        image_filename,
        "Reported"

    ))


    connection.commit()

    problem_id = cursor.lastrowid

    connection.close()


    return jsonify({

        "status": "success",

        "message":
            "Problem reported successfully!",

        "problem_id":
            problem_id

    }), 201


# =====================================================
# GET ALL PROBLEMS
# =====================================================

@app.route(
    "/api/problems",
    methods=["GET"]
)
def get_problems():

    connection = get_db_connection()

    cursor = connection.cursor()


    problems = cursor.execute("""

        SELECT

            problems.id,
            problems.category,
            problems.location,
            problems.description,
            problems.image,
            problems.status,
            problems.assigned_department,
            problems.admin_reply,
            problems.created_at,
            users.username,
            users.name

        FROM problems

        JOIN users

        ON problems.user_id = users.id

        ORDER BY problems.created_at DESC

    """).fetchall()


    problem_list = []


    for problem in problems:


        support_count = cursor.execute("""

            SELECT COUNT(*)

            FROM supports

            WHERE problem_id = ?

        """, (

            problem["id"],

        )).fetchone()[0]


        # =================================================
        # FIXED IMAGE URL FOR RENDER DEPLOYMENT
        # =================================================

        image_url = None


        if problem["image"]:

            image_url = (

                "https://civicvoice-ymbf.onrender.com/uploads/"

                +

                problem["image"]

            )


        problem_list.append({

            "id":
                problem["id"],

            "category":
                problem["category"],

            "location":
                problem["location"],

            "description":
                problem["description"],

            "image":
                image_url,

            "status":
                problem["status"],

            "assigned_department":
                problem["assigned_department"],

            "admin_reply":
                problem["admin_reply"],

            "created_at":
                problem["created_at"],

            "username":
                problem["username"],

            "name":
                problem["name"],

            "support_count":
                support_count

        })


    connection.close()


    return jsonify({

        "status": "success",

        "problems":
            problem_list

    }), 200


# =====================================================
# SUPPORT A PROBLEM
# =====================================================

@app.route(
    "/api/problems/<int:problem_id>/support",
    methods=["POST"]
)
def support_problem(problem_id):

    data = request.get_json()

    username = data.get("username")


    connection = get_db_connection()

    cursor = connection.cursor()


    user = cursor.execute(

        "SELECT id FROM users WHERE username = ?",

        (username,)

    ).fetchone()


    if user is None:

        connection.close()

        return jsonify({

            "message":
                "User not found."

        }), 404


    try:

        cursor.execute("""

            INSERT INTO supports (

                problem_id,
                user_id

            )

            VALUES (?, ?)

        """, (

            problem_id,
            user["id"]

        ))


        connection.commit()


    except sqlite3.IntegrityError:

        support_count = cursor.execute("""

            SELECT COUNT(*)

            FROM supports

            WHERE problem_id = ?

        """, (

            problem_id,

        )).fetchone()[0]


        connection.close()


        return jsonify({

            "message":
                "You already supported this problem.",

            "support_count":
                support_count

        }), 409


    support_count = cursor.execute("""

        SELECT COUNT(*)

        FROM supports

        WHERE problem_id = ?

    """, (

        problem_id,

    )).fetchone()[0]


    connection.close()


    return jsonify({

        "status": "success",

        "support_count":
            support_count

    }), 201


# =====================================================
# ADD COMMENT
# =====================================================

@app.route(
    "/api/problems/<int:problem_id>/comments",
    methods=["POST"]
)
def add_comment(problem_id):

    data = request.get_json()

    username = data.get("username")

    comment = data.get("comment")


    connection = get_db_connection()

    cursor = connection.cursor()


    user = cursor.execute(

        "SELECT id FROM users WHERE username = ?",

        (username,)

    ).fetchone()


    if user is None:

        connection.close()

        return jsonify({

            "message":
                "User not found."

        }), 404


    cursor.execute("""

        INSERT INTO comments (

            problem_id,
            user_id,
            comment

        )

        VALUES (?, ?, ?)

    """, (

        problem_id,
        user["id"],
        comment

    ))


    connection.commit()

    connection.close()


    return jsonify({

        "status": "success",

        "message":
            "Comment added successfully!"

    }), 201


# =====================================================
# GET COMMENTS
# =====================================================

@app.route(
    "/api/problems/<int:problem_id>/comments",
    methods=["GET"]
)
def get_comments(problem_id):

    connection = get_db_connection()

    cursor = connection.cursor()


    comments = cursor.execute("""

        SELECT

            comments.id,
            comments.comment,
            comments.created_at,
            users.username,
            users.name

        FROM comments

        JOIN users

        ON comments.user_id = users.id

        WHERE comments.problem_id = ?

        ORDER BY comments.created_at ASC

    """, (

        problem_id,

    )).fetchall()


    connection.close()


    comment_list = []


    for comment in comments:

        comment_list.append({

            "id":
                comment["id"],

            "comment":
                comment["comment"],

            "created_at":
                comment["created_at"],

            "username":
                comment["username"],

            "name":
                comment["name"]

        })


    return jsonify({

        "status": "success",

        "comments":
            comment_list

    }), 200


# =====================================================
# ADMIN REPLY
# =====================================================

@app.route(
    "/api/problems/<int:problem_id>/reply",
    methods=["POST"]
)
def admin_reply(problem_id):

    data = request.get_json()

    reply = data.get("reply")


    connection = get_db_connection()

    cursor = connection.cursor()


    cursor.execute("""

        UPDATE problems

        SET admin_reply = ?

        WHERE id = ?

    """, (

        reply,
        problem_id

    ))


    connection.commit()

    connection.close()


    return jsonify({

        "status": "success",

        "message":
            "Admin reply sent successfully!"

    }), 200


# =====================================================
# ADMIN LOGIN
# =====================================================

@app.route(
    "/api/admin/login",
    methods=["POST"]
)
def admin_login():

    data = request.get_json()

    username = data.get("username")

    password = data.get("password")


    if (

        username == "admin"

        and

        password == "admin123"

    ):

        return jsonify({

            "status": "success",

            "message":
                "Admin login successful!"

        }), 200


    return jsonify({

        "status": "error",

        "message":
            "Invalid admin username or password."

    }), 401


# =====================================================
# GET PROBLEMS FOR ADMIN
# =====================================================

@app.route(
    "/api/admin/problems",
    methods=["POST"]
)
def admin_problems():

    data = request.get_json()

    username = data.get("username")

    password = data.get("password")


    if (

        username != "admin"

        or

        password != "admin123"

    ):

        return jsonify({

            "status": "error",

            "message":
                "Unauthorized admin access."

        }), 401


    return get_problems()


# =====================================================
# HEALTH CHECK
# =====================================================

@app.route("/api/health")
def health():

    return jsonify({

        "status": "success",

        "message":
            "CivicVoice backend is connected."

    })


# =====================================================
# START APPLICATION
# =====================================================

if __name__ == "__main__":

    create_tables()

    port = int(
        os.environ.get(
            "PORT",
            5000
        )
    )

    app.run(
        host="0.0.0.0",
        port=port,
        debug=True
    )