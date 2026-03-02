// backend/config/pdfCoordinates.js

// This file maps the exact frontend field IDs (from formSchemas.js) to the X/Y coordinates on the PDF.
// For checkboxes/radios, the 'type' should be 'checkbox' and the code will draw a '✓' or 'X' at that spot.
// For text, the 'type' is 'text'.
// X and Y are calculated from the bottom-left corner of the PDF page.

const pdfCoordinates = {
    'aadhar_update_v1': {
        // 1. Basic Details
        "ResidentType": {
            "Resident": { x: 100, y: 750, type: 'checkbox' },
            "Non-Resident Indian (NRI)": { x: 200, y: 750, type: 'checkbox' }
        },
        "RequestType": {
            "New Enrolment": { x: 100, y: 730, type: 'checkbox' },
            "Update": { x: 200, y: 730, type: 'checkbox' }
        },
        "AadhaarNumber": { x: 150, y: 700, type: 'text' },

        // 2. Personal Information
        "FullName": { x: 150, y: 670, type: 'text' },
        "Gender": {
            "Male": { x: 150, y: 640, type: 'checkbox' },
            "Female": { x: 200, y: 640, type: 'checkbox' },
            "Transgender": { x: 270, y: 640, type: 'checkbox' }
        },
        "DOB": { x: 150, y: 610, type: 'text' }, // Assuming single text field for now, can be split if PDF has boxes
        "DOB_Status": {
            "Declared": { x: 300, y: 610, type: 'checkbox' },
            "Verified": { x: 370, y: 610, type: 'checkbox' }
        },

        // 3. Address
        "CareOf": { x: 100, y: 580, type: 'text' },
        "HouseNumber": { x: 100, y: 550, type: 'text' },
        "Street": { x: 300, y: 550, type: 'text' },
        "Landmark": { x: 100, y: 520, type: 'text' },
        "Area": { x: 300, y: 520, type: 'text' },
        "VillageTownCity": { x: 100, y: 490, type: 'text' },
        "PostOffice": { x: 300, y: 490, type: 'text' },
        "District": { x: 100, y: 460, type: 'text' },
        "SubDistrict": { x: 300, y: 460, type: 'text' },
        "State": { x: 100, y: 430, type: 'text' },
        "PINCode": { x: 300, y: 430, type: 'text' },
        "Mobile": { x: 100, y: 400, type: 'text' },
        "Email": { x: 300, y: 400, type: 'text' },

        // 4. Verification
        "POI_Document": { x: 100, y: 350, type: 'text' },
        "POA_Document": { x: 300, y: 350, type: 'text' },
        "PDB_Document": { x: 100, y: 320, type: 'text' }
    },
    'pan_49a_v1': {
        // Approximate mock coordinates for PAN
        "ApplicantTitle": {
            "Shri": { x: 50, y: 700, type: 'checkbox' },
            "Smt": { x: 100, y: 700, type: 'checkbox' },
            "Kumari": { x: 150, y: 700, type: 'checkbox' },
            "M/s": { x: 200, y: 700, type: 'checkbox' }
        },
        "LastName": { x: 50, y: 680, type: 'text' },
        "FirstName": { x: 200, y: 680, type: 'text' },
        "MiddleName": { x: 350, y: 680, type: 'text' },
        "NameOnCard": { x: 50, y: 650, type: 'text' },
        "Gender": {
            "Male": { x: 50, y: 600, type: 'checkbox' },
            "Female": { x: 100, y: 600, type: 'checkbox' },
            "Transgender": { x: 170, y: 600, type: 'checkbox' }
        },
        "DOB": { x: 50, y: 570, type: 'text' },
        // ... (Other fields follow the same pattern)
        "AddressType": {
            "Residence": { x: 50, y: 500, type: 'checkbox' },
            "Office": { x: 150, y: 500, type: 'checkbox' }
        },
        "HouseNumber": { x: 50, y: 470, type: 'text' },
        "City": { x: 50, y: 440, type: 'text' },
        "State": { x: 200, y: 440, type: 'text' },
        "PINCode": { x: 400, y: 440, type: 'text' },
        "Mobile": { x: 50, y: 400, type: 'text' },
        "AadhaarNumber": { x: 50, y: 350, type: 'text' }
    },
    'voter_form_8_v1': {
        // Approximate mock coordinates for Voter ID Form 8
        "ApplicationFor": {
            "Shifting of Residence": { x: 50, y: 720, type: 'checkbox' },
            "Correction of Entries": { x: 50, y: 700, type: 'checkbox' },
            "Issue of Replacement EPIC": { x: 50, y: 680, type: 'checkbox' },
            "Request for marking as Person with Disability": { x: 50, y: 660, type: 'checkbox' }
        },
        "EPICNumber": { x: 150, y: 600, type: 'text' },
        "FullName": { x: 150, y: 570, type: 'text' },
        "Mobile": { x: 150, y: 540, type: 'text' },
        "AadhaarNumber": { x: 150, y: 510, type: 'text' },

        "HouseNumber": { x: 150, y: 450, type: 'text' },
        "VillageTownCity": { x: 150, y: 420, type: 'text' },
        "State": { x: 150, y: 390, type: 'text' }
    }
};

const templatesMap = {
    'aadhar_update_v1': 'Aadhar_Update.pdf',
    'pan_49a_v1': 'PanCard.pdf',
    'voter_form_8_v1': 'Voter_ID.pdf'
};

module.exports = { pdfCoordinates, templatesMap };
