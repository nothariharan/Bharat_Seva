const path = require('path');

const templateMap = {
    form_6b: path.join('Forms', 'FORM 6B.pdf'),
    kyc_updation: path.join('Forms', 'KYC Updation Form.pdf')
};

const fieldMappings = {
    form_6b: {
        voterName: { x: 451, y: 116, maxWidth: 125, size: 9 },
        epicNumber: { x: 360, y: 666, maxWidth: 210, size: 9 },
        aadhaarNumber: { x: 156, y: 599, maxWidth: 200, size: 9 },
        mobile: { x: 465, y: 89, maxWidth: 112, size: 8 },
        place: { x: 92, y: 62, maxWidth: 210, size: 9 },
        date: { x: 88, y: 35, maxWidth: 170, size: 9 }
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
