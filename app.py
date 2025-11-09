from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from artificial_intelligence import classify_image
import os

app = Flask(__name__)

CORS(app)

# Neon database connection string
DATABASE_URL = "postgresql://neondb_owner:npg_FvXsiOtq5M6c@ep-hidden-lab-afcfegj2-pooler.c-2.us-west-2.aws.neon.tech/civicfix?sslmode=require&channel_binding=require"


def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    return conn


@app.route('/', methods=['GET', 'POST'])
def contractor_endpoint():
    if request.method == 'POST':
        data = request.get_json()

        business_number = data.get('business_number')
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        phone_number = data.get('phone_number')
        company_website = data.get('company_website')
        description = data.get('description')

        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute(
                """
                INSERT INTO Contractors 
                (company_bn, company_name, email, company_password, phone_number, company_website, description)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (business_number, name, email, password, phone_number, company_website, description)
            )

            conn.commit()
            cursor.close()
            conn.close()

            return jsonify({'message': 'Contractor added successfully'}), 201

        except Exception as e:
            return jsonify({'error': str(e)}), 500


    elif request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            # Get the 'verified' query parameter (optional)

            verified_only = request.args.get('verified', '').lower() == 'true'

            if verified_only:
                cursor.execute(
                    """

                    SELECT company_bn, company_name, email, phone_number, 
                           company_website, description, verified
                    FROM Contractors
                    WHERE verified = TRUE
                    """
                )

            else:
                cursor.execute(
                    """
                    SELECT company_bn, company_name, email, phone_number, 
                           company_website, description, verified
                    FROM Contractors
                    """
                )

            contractors = cursor.fetchall()

            cursor.close()
            conn.close()

            # Convert to list of dictionaries for JSON response

            contractors_list = []

            for contractor in contractors:
                contractors_list.append({
                    'company_bn': contractor[0],
                    'company_name': contractor[1],
                    'email': contractor[2],
                    'phone_number': contractor[3],
                    'company_website': contractor[4],
                    'description': contractor[5],
                    'verified': contractor[6]
                })

            return jsonify({'contractors': contractors_list}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500


@app.route('/service', methods=['GET', 'POST'])
def service_endpoint():
    if request.method == 'GET':
        business_number = request.args.get('business_number')

        if not business_number:
            return jsonify({'error': 'business_number parameter required'}), 400

        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            # Get all report_ids for this business
            cursor.execute(
                """
                SELECT report_id FROM Service_Requests 
                WHERE company_bn = %s
                """,
                (business_number,)
            )

            results = cursor.fetchall()
            cursor.close()
            conn.close()

            # Extract report_ids from results
            report_ids = [row[0] for row in results]

            return jsonify({
                'business_number': business_number,
                'report_ids': report_ids,
                'count': len(report_ids)
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    elif request.method == 'POST':
        data = request.get_json()

        business_number = data.get('business_number')
        report_id = data.get('report_id')

        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            # Check if business exists and is verified
            cursor.execute(
                """
                SELECT verification FROM Contractors 
                WHERE company_bn = %s
                """,
                (business_number,)
            )

            result = cursor.fetchone()

            # If business doesn't exist
            if result is None:
                cursor.close()
                conn.close()
                return jsonify({'error': 'Business not found'}), 404

            # If business is not verified
            if not result[0]:  # result[0] is the verification column
                cursor.close()
                conn.close()
                return jsonify({'error': 'Unauthorized: Business not verified'}), 403

            # Business is verified, proceed with insert
            cursor.execute(
                """
                INSERT INTO Service_Requests 
                (company_bn, report_id)
                VALUES (%s, %s)
                """,
                (business_number, report_id)
            )

            conn.commit()
            cursor.close()
            conn.close()

            return jsonify({'message': 'Service added successfully'}), 201

        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/scan', methods=['POST'])
def classify_endpoint():
    """
    Endpoint to classify an uploaded image
    Expects: multipart/form-data with 'image' field
    Returns: JSON with classification result
    """
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Read image bytes
        img_bytes = file.read()

        # Determine mime type
        mime_type = file.content_type or 'image/jpeg'

        # Classify the image
        result = classify_image(img_bytes, file.filename, mime_type)

        return jsonify({
            'success': True,
            'result': result
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)