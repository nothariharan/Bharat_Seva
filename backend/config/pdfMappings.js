const path = require('path');

const templateMap = {
    form_6b: path.join('Forms', 'FORM 6B.pdf'),
    kyc_updation: path.join('Forms', 'KYC Updation Form.pdf')
};

const fieldMappings = {
    form_6b: {
        electorNameTop: { type: 'text', x: 70, y: 688, maxWidth: 180, size: 9 },
        constituencyName: { type: 'text', x: 270, y: 688, maxWidth: 290, size: 9 },
        epicNumber: { type: 'text', x: 360, y: 666, maxWidth: 210, size: 9 },
        aadhaarChoice: {
            type: 'checkboxGroup',
            options: {
                has_aadhaar: { x: 58, y: 599 },
                no_aadhaar: { x: 58, y: 557 }
            }
        },
        aadhaarNumber: { type: 'text', x: 156, y: 599, maxWidth: 205, size: 9 },
        supportingDocument: {
            type: 'checkboxGroup',
            options: {
                mgnrega_job_card: { x: 58, y: 477 },
                bank_post_passbook: { x: 58, y: 450 },
                health_insurance_smart_card: { x: 58, y: 423 },
                driving_license: { x: 58, y: 395 },
                pan_card: { x: 58, y: 368 },
                rgi_npr_smart_card: { x: 58, y: 341 },
                indian_passport: { x: 58, y: 314 },
                pension_document: { x: 58, y: 287 },
                service_identity_card: { x: 58, y: 261 },
                official_identity_card: { x: 58, y: 222 },
                udid_card: { x: 58, y: 195 }
            }
        },
        electorNameBottom: { type: 'text', x: 449, y: 116, maxWidth: 128, size: 9 },
        mobileOrEmail: { type: 'text', x: 465, y: 89, maxWidth: 112, size: 8 },
        place: { type: 'text', x: 92, y: 62, maxWidth: 210, size: 9 },
        date: { type: 'text', x: 88, y: 35, maxWidth: 170, size: 9 }
    },
    kyc_updation: {
        customerName: { x: 160, y: 717, maxWidth: 250, size: 9 },
        accountNumber: { x: 160, y: 611, maxWidth: 250, size: 9 },
        mobile: { x: 180, y: 365, maxWidth: 240, size: 9 },
        aadhaarNumber: { x: 370, y: 541, maxWidth: 190, size: 9 },
        address: { x: 170, y: 414, maxWidth: 390, size: 8, lineHeight: 10 }
    }
};

const numericFieldsByTemplate = {
    form_6b: ['aadhaarNumber', 'mobile'],
    kyc_updation: ['accountNumber', 'mobile', 'aadhaarNumber']
};

const textStyle = {
    size: 9,
    lineHeight: 10,
    maxChars: 120
};

module.exports = {
    templateMap,
    fieldMappings,
    numericFieldsByTemplate,
    textStyle
};
