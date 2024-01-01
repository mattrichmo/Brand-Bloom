import OpenAIFunctionCall from "../../utils/openai/OpenAiFunctionCall.mjs";



let brand = {
    brandNameIdeation: {
        nameOptions: [{
            nameUUID: ``,
            nameText: ``,
            nameScore: {
                creativity: 0,
                brandability: 0,
                uniqueness: 0,
                cleverness: 0,
                memorability: 0,
                length: 0,
                conveysMeaning: 0,
                marketability: 0,
            },
            availability: {
                domain: {
                    whosis: {},
                    availability: false,
                },
                socialMedia: {
                    instagram: {
                        availability: false,
                        link: ``,
                    },
                    facebook: {
                        availability: false,
                        link: ``,
                    },
                    twitter: {
                        availability: false,
                        link: ``,
                    },
                    linkedin: {
                        availability: false,
                        link: ``,
                    },
                    pinterest: {
                        availability: false,
                        link: ``,
                    },
                    youtube: {
                        availability: false,
                        link: ``,
                    },
                    tiktok: {
                        availability: false,
                        link: ``,
                    },
                    hackernews: {
                        availability: false,
                        link: ``,
                    },
                    reddit: {
                        availability: false,
                        link: ``,
                    },
                    productHunt: {
                        availability: false,
                        link: ``,
                    },
                    snapchat: {
                        availability: false,
                        link: ``,
                    },
                    medium: {
                        availability: false,
                        link: ``,
                    },
                    tumblr: {
                        availability: false,
                        link: ``,
                    },
                    github: {
                        availability: false,
                        link: ``,
                    },
                    npmPackage: {
                        availability: false,
                        link: ``,
                    },

                },

            },
        }],
    }
};


export const genInitialBrandNames = async (query) => {

    let parsedText = query.parsedUserQuery.parsedText;

    let systemPrompt = `You are the top naming expert in the world. You are tasked with naming a new company based on a set of parameters given to you. You are being graded and scored on the responses you give so make sure your brand name choices reflect what the input parameters are. AND NEVER TAKE THE LAZY ROUTE. `;
    let userPrompt = `Here are the input parameters:<START INPUT PARAMETERS> ${parsedText} <END INPUT PARAMETERS> Please give me 10 of your absolute best brand name ideas.`;

    let responseSchema = {
        type: 'object',
        properties: {
            brandNameOptions: {
                type: 'array',
                items: {
                    type: 'string'
                }
            }
        },
        required: ['brandNameOptions']
    };

    let responseText = await OpenAIFunctionCall(
        'gpt-3.5-turbo-1106',
        [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        [{ name: 'respondJSON', parameters: responseSchema }],
        { name: 'respondJSON' },
        0.1,
        2000
    );

    const response = JSON.parse(responseText);

};





export const brandNameIdeation = async (query) => {


};