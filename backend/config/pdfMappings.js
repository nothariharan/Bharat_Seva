const path = require('path');

const templateMap = {
    form_6b: path.join('Forms', 'FORM 6B.pdf'),
    kyc_updation: path.join('Forms', 'KYC Updation Form.pdf')
};

const fieldMappings = {
    form_6b: {
        electorNameTop: { type: 'text', x: 76, y: 688, maxWidth: 150, size: 8 },
        constituencyName: { type: 'text', x: 358, y: 688, maxWidth: 185, size: 8 },
        epicNumber: { type: 'text', x: 308, y: 666, maxWidth: 210, size: 8 },
        aadhaarChoice: {
            type: 'checkboxGroup',
            options: {
                has_aadhaar: { x: 68, y: 594 },
                no_aadhaar: { x: 68, y: 552 }
            }
        },
        aadhaarNumber: {
            type: 'digitBoxes',
            x: 166,
            y: 599,
            boxStep: 27,
            maxDigits: 12,
            size: 10
        },
        supportingDocument: {
            type: 'checkboxGroup',
            options: {
                mgnrega_job_card: { x: 64, y: 468 },
                bank_post_passbook: { x: 64, y: 441 },
                health_insurance_smart_card: { x: 64, y: 414 },
                driving_license: { x: 64, y: 387 },
                pan_card: { x: 64, y: 360 },
                rgi_npr_smart_card: { x: 64, y: 333 },
                indian_passport: { x: 64, y: 306 },
                pension_document: { x: 64, y: 279 },
                service_identity_card: { x: 64, y: 252 },
                official_identity_card: { x: 64, y: 214 },
                udid_card: { x: 64, y: 187 }
            }
        },
        electorNameBottom: { type: 'text', x: 449, y: 116, maxWidth: 128, size: 9 },
        mobileOrEmail: { type: 'text', x: 455, y: 89, maxWidth: 122, size: 8 },
        place: { type: 'text', x: 87, y: 62, maxWidth: 215, size: 9 },
        date: { type: 'text', x: 84, y: 35, maxWidth: 176, size: 9 }
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
