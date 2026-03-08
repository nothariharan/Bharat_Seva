const { invokeModel } = require('../services/bedrockService');
const { buildQueryPrompt } = require('../prompts/queryPrompt');
const { getMatchingCommunitiesInternal } = require('../services/communityService');
const { getRelevantInsights } = require('../services/socialService');
const { saveLog } = require('./pulseController');

const SUPPORTED_FORMS = {
    form_6b: {
        name: 'Form 6B',
        fields_needed: ['electorNameTop', 'constituencyName', 'epicNumber', 'aadhaarChoice', 'aadhaarNumber', 'supportingDocument', 'mobileOrEmail', 'place', 'date']
    },
    kyc_updation: {
        name: 'Bank KYC Updation Form',
        fields_needed: ['customerName', 'accountNumber', 'mobile', 'aadhaarNumber', 'address']
    }
};

const inferTemplateFromText = (text = '') => {
    const lower = text.toLowerCase();
    const is6B = (lower.includes('6b') || lower.includes('form 6b')) &&
        (lower.includes('voter') || lower.includes('epic') || lower.includes('aadhaar') || lower.includes('aadhaar'));
    const isVoterAadhaar = (lower.includes('voter') || lower.includes('epic')) &&
        (lower.includes('aadhaar') || lower.includes('aadhar')) &&
        (lower.includes('link') || lower.includes('seed'));
    const isKyc = lower.includes('kyc') && (lower.includes('bank') || lower.includes('account') || lower.includes('updation') || lower.includes('update'));

    if (is6B || isVoterAadhaar) return 'form_6b';
    if (isKyc) return 'kyc_updation';
    return null;
};

const normalizeDocumentRequired = (rawDoc, transcript) => {
    const base = {
        name: null,
        supported_in_app: false,
        template_id: null,
        fields_needed: []
    };

    if (!rawDoc || typeof rawDoc !== 'object') {
        const inferredTemplate = inferTemplateFromText(transcript);
        if (!inferredTemplate) return base;
        return {
            name: SUPPORTED_FORMS[inferredTemplate].name,
            supported_in_app: true,
            template_id: inferredTemplate,
            fields_needed: SUPPORTED_FORMS[inferredTemplate].fields_needed
        };
    }

    const inferredTemplate = inferTemplateFromText(
        [transcript, rawDoc.name, rawDoc.template_id, (rawDoc.fields_needed || []).join(' ')].join(' ')
    );
    const requestedTemplate = rawDoc.template_id;
    const resolvedTemplate = SUPPORTED_FORMS[requestedTemplate] ? requestedTemplate : inferredTemplate;

    if (!resolvedTemplate) return base;

    return {
        name: SUPPORTED_FORMS[resolvedTemplate].name,
        supported_in_app: true,
        template_id: resolvedTemplate,
        fields_needed: SUPPORTED_FORMS[resolvedTemplate].fields_needed
    };
};

const normalizeSteps = (steps, documentRequired) => {
    const safeSteps = Array.isArray(steps) ? steps : [];
    const structured = safeSteps.map((step, idx) => {
        if (typeof step === 'string') {
            return {
                id: idx + 1,
                title: `Step ${idx + 1}`,
                description: step,
                type: 'info',
                status: 'pending',
                breakdown: [],
                formId: null,
                officeType: null
            };
        }

        return {
            id: step?.id || idx + 1,
            title: step?.title || `Step ${idx + 1}`,
            description: step?.description || '',
            type: step?.type || 'info',
            status: step?.status || 'pending',
            breakdown: Array.isArray(step?.breakdown) ? step.breakdown : [],
            formId: step?.formId || null,
            officeType: step?.officeType || null
        };
    });

    if (documentRequired.supported_in_app && documentRequired.template_id) {
        structured.forEach((s) => {
            if (s.type === 'form') {
                if (!s.formId) s.formId = documentRequired.template_id;
                if (!s.fieldsNeeded) s.fieldsNeeded = documentRequired.fields_needed;
            }
        });
        const hasFormStep = structured.some(
            (s) => s.type === 'form' && s.formId === documentRequired.template_id
        );
        if (!hasFormStep) {
            structured.unshift({
                id: 1,
                title: 'Fill this Form Digitally',
                description: 'Use the voice assistant to fill this form digitally.',
                type: 'form',
                status: 'pending',
                breakdown: [],
                formId: documentRequired.template_id,
                fieldsNeeded: documentRequired.fields_needed,
                officeType: null
            });
            structured.forEach((s, index) => {
                s.id = index + 1;
            });
        }
    }

    return structured;
};

const processQuery = async (req, res) => {
    try {
        const { transcript, language = 'hi', userContext = {} } = req.body;

        if (!transcript || transcript.trim().length === 0) {
            return res.status(400).json({ error: 'Transcript is required' });
        }

        const state = userContext.state || 'India';
        const district = userContext.district || '';

        const [matchingCommunities, communityInsights] = await Promise.all([
            getMatchingCommunitiesInternal(state, district, transcript),
            getRelevantInsights(transcript, state)
        ]);

        const prompt = buildQueryPrompt(
            transcript,
            language,
            state,
            district,
            userContext.latitude,
            userContext.longitude,
            communityInsights
        );

        const rawAIResponse = await invokeModel(prompt, true);
        const cleaned = rawAIResponse.replace(/```json|```/g, '').trim();
        const rawPlan = JSON.parse(cleaned);

        const document_required = normalizeDocumentRequired(rawPlan.document_required, transcript);
        const steps = normalizeSteps(rawPlan.steps, document_required);

        const actionPlan = {
            intent: rawPlan.intent || 'General Civic Help',
            document_required,
            steps,
            summary_speech: rawPlan.summary_speech || rawPlan.audioSummary || '',
            audioSummary: rawPlan.audioSummary || rawPlan.summary_speech || '',
            requiredDocuments: Array.isArray(rawPlan.requiredDocuments) ? rawPlan.requiredDocuments : [],
            problemAnalysis: rawPlan.problemAnalysis || null
        };

        const middlemanKeywords = ['rishwat', 'paisa', 'extra', 'charges', 'commission', 'ghoos', 'bribe', 'money', 'demand'];
        const includesMiddleman = middlemanKeywords.some((w) => transcript.toLowerCase().includes(w));
        const isHindi = String(language).toLowerCase().startsWith('hi');

        if (includesMiddleman) {
            actionPlan.proactiveAlert = {
                type: 'MIDDLEMAN_WARNING',
                title: isHindi ? 'सतर्क रहें: कोई अतिरिक्त शुल्क न दें' : 'Warning: Do Not Pay Extra',
                message: isHindi
                    ? 'भारत सेवा और सरकारी योजनाएं मुफ्त हैं। अगर कोई पैसे मांगता है, तो वह गैरकानूनी है।'
                    : 'Bharat Seva and government schemes are free. If anyone asks for money, it is illegal.',
                severity: 'CRITICAL'
            };
        }

        if (!actionPlan.proactiveAlert && actionPlan.audioSummary && /deadline/i.test(actionPlan.audioSummary)) {
            actionPlan.proactiveAlert = {
                type: 'SCHEME_EXPIRY',
                title: 'Deadline Approaching',
                message: 'This scheme has a deadline. Act fast to avoid missing out.',
                severity: 'AMBER'
            };
        }

        saveLog({
            transcript,
            topic: actionPlan.problemAnalysis ? actionPlan.problemAnalysis.detectedIssue : (actionPlan.intent || 'General'),
            state,
            district,
            latitude: userContext.latitude,
            longitude: userContext.longitude,
            language
        });

        return res.status(200).json({
            ...actionPlan,
            matchingCommunities
        });
    } catch (error) {
        console.error('Query processing error:', error);
        return res.status(500).json({
            error: 'Could not process query',
            message: 'Abhi jawab nahi mil raha. Thodi der mein dobara koshish karein.'
        });
    }
};

const notifyCitizen = async (req, res) => {
    try {
        const { phoneNumber, orgName } = req.body;
        console.log(`[Twilio Mock] Sending SMS to ${phoneNumber}: Bharat Seva: The ${orgName} has received your request and will call you shortly.`);
        res.json({ success: true, message: 'Notification sent to citizen' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send notification' });
    }
};

module.exports = { processQuery, notifyCitizen };
