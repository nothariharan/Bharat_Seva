// src/config/formSchemas.js

export const formSchemas = {
    'aadhar_update_v1': {
        name: "Aadhaar Enrolment / Update Form",
        fields: [
            // 1. Basic & Request Details
            { id: "ResidentType", label: "Resident Type", type: "radio", options: ["Resident", "Non-Resident Indian (NRI)"], required: true },
            { id: "RequestType", label: "Request Type", type: "radio", options: ["New Enrolment", "Update"], required: true },
            { id: "AadhaarNumber", label: "Existing Aadhaar Number", type: "text", condition: (answers) => answers["RequestType"] === "Update", placeholder: "12-digit Aadhaar Number" },

            // 2. Personal Information
            { id: "FullName", label: "Full Name", type: "text", required: true },
            { id: "Gender", label: "Gender", type: "radio", options: ["Male", "Female", "Transgender"], required: true },
            { id: "DOB", label: "Date of Birth", type: "date", required: true },
            { id: "DOB_Status", label: "DOB Verification Status", type: "radio", options: ["Declared", "Verified"], required: true },

            // 3. Address Details
            { id: "CareOf", label: "C/o (Care Of Name)", type: "text" },
            { id: "HouseNumber", label: "House No. / Bldg / Apt", type: "text", required: true },
            { id: "Street", label: "Street / Road / Lane", type: "text" },
            { id: "Landmark", label: "Landmark", type: "text" },
            { id: "Area", label: "Area / Locality / Sector", type: "text", required: true },
            { id: "VillageTownCity", label: "Village / Town / City", type: "text", required: true },
            { id: "PostOffice", label: "Post Office", type: "text" },
            { id: "District", label: "District", type: "text", required: true },
            { id: "SubDistrict", label: "Sub-District", type: "text" },
            { id: "State", label: "State", type: "text", required: true },
            { id: "PINCode", label: "PIN Code", type: "text", required: true },
            { id: "Mobile", label: "Mobile Number", type: "text", required: true },
            { id: "Email", label: "Email Address", type: "text" },

            // 4. Verification Details (For Document Based)
            { id: "POI_Document", label: "Proof of Identity (POI) Document Name", type: "text", required: true },
            { id: "POA_Document", label: "Proof of Address (POA) Document Name", type: "text", required: true },
            { id: "PDB_Document", label: "Proof of Date of Birth (PDB) Document Name", type: "text" },
        ]
    },
    'pan_49a_v1': {
        name: "PAN Card Form 49A",
        fields: [
            { id: "ApplicantTitle", label: "Title", type: "radio", options: ["Shri", "Smt", "Kumari", "M/s"], required: true },
            { id: "LastName", label: "Last Name / Surname", type: "text", required: true },
            { id: "FirstName", label: "First Name", type: "text" },
            { id: "MiddleName", label: "Middle Name", type: "text" },
            { id: "NameOnCard", label: "Name you would like printed on the card", type: "text", required: true },
            { id: "OtherName_Check", label: "Have you ever been known by any other name?", type: "radio", options: ["Yes", "No"], required: true },
            { id: "Gender", label: "Gender", type: "radio", options: ["Male", "Female", "Transgender"], required: true },
            { id: "DOB", label: "Date of Birth", type: "date", required: true },

            { id: "ParentsName_SingleMother", label: "Are you a son/daughter of a single mother and wish to apply for PAN by furnishing the name of your mother only?", type: "radio", options: ["Yes", "No"], required: true },
            { id: "FatherLastName", label: "Father's Last Name / Surname", type: "text", condition: (answers) => answers["ParentsName_SingleMother"] === "No", required: true },
            { id: "FatherFirstName", label: "Father's First Name", type: "text", condition: (answers) => answers["ParentsName_SingleMother"] === "No" },
            { id: "MotherLastName", label: "Mother's Last Name", type: "text" },
            { id: "MotherFirstName", label: "Mother's First Name", type: "text" },

            { id: "AddressType", label: "Address for Communication", type: "radio", options: ["Residence", "Office"], required: true },
            { id: "HouseNumber", label: "Flat/Room/Door/Block No.", type: "text", required: true },
            { id: "Premises", label: "Name of Premises/Building/Village", type: "text", required: true },
            { id: "Street", label: "Road/Street/Lane/Post Office", type: "text" },
            { id: "Area", label: "Area / Locality / Taluka / Sub-Division", type: "text", required: true },
            { id: "City", label: "Town / City / District", type: "text", required: true },
            { id: "State", label: "State / Union Territory", type: "text", required: true },
            { id: "PINCode", label: "PIN Code", type: "text", required: true },

            { id: "ISDCode", label: "Country Code (ISD code)", type: "text", required: true },
            { id: "Mobile", label: "Mobile/Telephone Number", type: "text", required: true },
            { id: "Email", label: "Email ID", type: "text", required: true },
            { id: "AadhaarNumber", label: "Aadhaar Number", type: "text", required: true },
            { id: "AadhaarName", label: "Name as per Aadhaar", type: "text", required: true },
        ]
    },
    'voter_form_8_v1': {
        name: "Voter ID Form 8 (Correction/Shifting)",
        fields: [
            { id: "ApplicationFor", label: "Application is for", type: "radio", options: ["Shifting of Residence", "Correction of Entries", "Issue of Replacement EPIC", "Request for marking as Person with Disability"], required: true },
            { id: "EPICNumber", label: "Existing EPIC Number (Voter ID Number)", type: "text", required: true },
            { id: "FullName", label: "1. Name of the Elector", type: "text", required: true },
            { id: "RelativeName", label: "2. Name of Relative", type: "text" },
            { id: "RelationType", label: "Type of Relation", type: "radio", options: ["Father", "Mother", "Husband", "Wife", "Legal Guardian"] },
            { id: "Mobile", label: "3. Mobile Number", type: "text", required: true },
            { id: "AadhaarNumber", label: "4. Aadhaar Number", type: "text", required: true },
            { id: "Gender", label: "5. Gender", type: "radio", options: ["Male", "Female", "Third Gender"] },
            { id: "DOB", label: "6. Date of Birth", type: "date" },

            // Only required if shifting residence
            { id: "HouseNumber", label: "7. House / Building / Apartment No.", type: "text", condition: (answers) => answers["ApplicationFor"] === "Shifting of Residence" },
            { id: "Street", label: "Street / Area / Locality", type: "text", condition: (answers) => answers["ApplicationFor"] === "Shifting of Residence" },
            { id: "VillageTownCity", label: "Town / Village", type: "text", condition: (answers) => answers["ApplicationFor"] === "Shifting of Residence" },
            { id: "PostOffice", label: "Post Office", type: "text", condition: (answers) => answers["ApplicationFor"] === "Shifting of Residence" },
            { id: "PINCode", label: "PIN Code", type: "text", condition: (answers) => answers["ApplicationFor"] === "Shifting of Residence" },
            { id: "District", label: "District", type: "text", condition: (answers) => answers["ApplicationFor"] === "Shifting of Residence" },

            { id: "CorrectionType", label: "8. Details to be corrected", type: "radio", options: ["Name", "Gender", "DOB/Age", "Type of Relation", "Name of Relative", "Address", "Mobile Number", "Photo"], condition: (answers) => answers["ApplicationFor"] === "Correction of Entries" },
            { id: "CorrectedValue", label: "Corrected Value (Provide the right detail)", type: "text", condition: (answers) => answers["ApplicationFor"] === "Correction of Entries" },

            { id: "ReasonForReplacement", label: "9. Reason for Replacement of EPIC", type: "radio", options: ["Lost", "Destroyed due to reason beyond control", "Mutilated"], condition: (answers) => answers["ApplicationFor"] === "Issue of Replacement EPIC" },
        ]
    }
};
