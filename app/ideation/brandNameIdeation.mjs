import OpenAIFunctionCall from "../../utils/openai/OpenAiFunctionCall.mjs";
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';


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
            critique:{
                harshCritique: ``,
                constructiveCritique: ``,
                howToBetter: ``,
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
        bestOption: {
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
        },
    }
};

export const initBrand = () => {
    // Initialize nameOptions with an empty array
    brand.brandNameIdeation.nameOptions = [];

    // Initialize bestOption with a default structure
    brand.brandNameIdeation.bestOption = {
        nameUUID: '',
        nameText: '',
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
                instagram: { availability: false, link: '' },
                facebook: { availability: false, link: '' },
                twitter: { availability: false, link: '' },
                linkedin: { availability: false, link: '' },
                pinterest: { availability: false, link: '' },
                youtube: { availability: false, link: '' },
                tiktok: { availability: false, link: '' },
                hackernews: { availability: false, link: '' },
                reddit: { availability: false, link: '' },
                productHunt: { availability: false, link: '' },
                snapchat: { availability: false, link: '' },
                medium: { availability: false, link: '' },
                tumblr: { availability: false, link: '' },
                github: { availability: false, link: '' },
                npmPackage: { availability: false, link: '' },
            },
        },
    };

    return brand;
};




export const genInitialBrandNames = async (query) => {

    let parsedText = query.userQueryParsed.parsedQueryString;

    let systemPrompt = `You are the top naming expert in the world. You are tasked with naming a new company based on a set of parameters given to you. You are being graded and scored on the responses you give so make sure your brand name choices reflect what the input parameters are. AND NEVER TAKE THE LAZY ROUTE. `;
    let userPrompt = `Here are the input parameters:<START INPUT PARAMETERS> ${parsedText} <END INPUT PARAMETERS> Please give me 5 of your absolute best brand name ideas. `;

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

    console.log(chalk.dim(`\n----------------------------------------\n`));
    console.log(chalk.dim('Generated Brand Name Options:'));
    const updatedNameOptions = response.brandNameOptions.map(nameText => {
        const uuid = uuidv4();
        console.log(chalk.yellow(`  - ${nameText}`), chalk.dim(`(UUID: ${uuid})`));
        return {
            nameUUID: uuid,
            nameText: nameText,
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
        };
    });
    console.log(chalk.dim(`\n----------------------------------------\n`));

    brand.brandNameIdeation.nameOptions = updatedNameOptions;

    return brand;
};
export const createNameResponseSchema = (brand) => {
    const scoreSchema = {
        type: 'object',
        properties: {
            creativity: { type: 'number', description: 'Score between 0-1 for creativity' },
            brandability: { type: 'number', description: 'Score between 0-1 for brandability' },
            uniqueness: { type: 'number', description: 'Score between 0-1 for uniqueness' },
            cleverness: { type: 'number', description: 'Score between 0-1 for cleverness' },
            memorability: { type: 'number', description: 'Score between 0-1 for memorability' },
            length: { type: 'number', description: 'Score between 0-1 for length' },
            conveysMeaning: { type: 'number', description: 'Score between 0-1 for how well it conveys meaning' },
            marketability: { type: 'number', description: 'Score between 0-1 for marketability' },
        },
        required: ['creativity', 'brandability', 'uniqueness', 'cleverness', 'memorability', 'length', 'conveysMeaning', 'marketability']
    };

    console.log(chalk.dim(`\n----------------------------------------\n`));
    console.log(chalk.dim('Creating Response Schema for Brand Names:'));

    const validNameOptions = brand.brandNameIdeation.nameOptions.filter(option => option.nameText.trim() !== '');
    const responseProperties = validNameOptions.reduce((acc, option) => {
        // Use the nameText directly as the key
        const key = option.nameText;
        acc[key] = { 
            type: 'object', 
            properties: { nameScore: scoreSchema },
            required: ['nameScore']
        };
        console.log(chalk.yellow(`  - ${key}`));
        return acc;
    }, {});

    const responseSchema = {
        type: 'object',
        properties: responseProperties,
        required: validNameOptions.map(option => option.nameText)
    };

    console.log(chalk.dim('Completed Response Schema:'));
    console.log(chalk.dim(`\n----------------------------------------\n`));

    return responseSchema;
};


export const scoreBrandNames = async (brand, scoreResponseSchema) => {
    let brandNameStrings = '';
    console.log(chalk.dim(`\n----------------------------------------\n`));
    console.log(chalk.dim('Preparing Brand Names for Scoring:'));
    brand.brandNameIdeation.nameOptions.forEach((name, index) => {
        brandNameStrings += `${index + 1}. ${name.nameText} \n`;
        console.log(chalk.yellow(`${name.nameText}`));
    });
    console.log(chalk.dim(`\n----------------------------------------\n`));

    let systemPrompt = `Imagine you are a world-renowned expert in branding, combining the strategic insight of a seasoned brand strategist, the creative vision of a top advertising creative director, and the analytical prowess of a consumer psychologist. You have a deep understanding of market trends, cultural nuances, and consumer behavior. Your expertise is sought after for creating brand names that resonate deeply with target audiences, convey a brand's essence, and are memorable and unique. You are going to recieve a list of brand names and you will score each brand name according to a list of categories.`;
    let userPrompt = `Using your extensive expertise, please score the following brand names between 0-1 for each category. Consider the following aspects: 
    - Creativity: How innovative and original is the name?
    - Brandability: Does the name effectively embody the essence of the brand?
    - Uniqueness: How distinctive is the name in the market?
    - Cleverness: Does the name engage intellectually, perhaps with a play on words?
    - Memorability: Is the name easily remembered?
    - Length: Is the name concise yet descriptive?
    - Conveys Meaning: Does the name communicate the intended message or value?
    - Marketability: What is the commercial potential of the name?
    <START BRAND NAME LIST> ${brandNameStrings} <END BRAND NAME LIST> Please ensure each category iscore is filledout for each brandname object`;
    
    let responseText = await OpenAIFunctionCall(
        'gpt-3.5-turbo-1106',
        [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        [{ name: 'respondJson', parameters: scoreResponseSchema }],
        { name: 'respondJson' },
        0.1,
        2000
    );

    let response = JSON.parse(responseText);

    // Update scores for each brand name
    brand.brandNameIdeation.nameOptions.forEach(option => {
        const safeKey = option.nameText.replace(/\s+/g, '');
        if (response.hasOwnProperty(safeKey)) {
            option.nameScore = response[safeKey].nameScore;
        }
    });

    //console.log(`response`,JSON.stringify(response, null, 2));

    console.log(chalk.dim(`\n----------------------------------------\n`));
    console.log(chalk.dim('Updating Brand Names with Scores:'));
    brand.brandNameIdeation.nameOptions.forEach(option => {
        console.log(chalk.yellow(`  - ${option.nameText}:`));
        console.log(chalk.dim(`    Creativity: `) + chalk.green(`${option.nameScore.creativity}`));
        console.log(chalk.dim(`    Brandability: `) + chalk.green(`${option.nameScore.brandability}`));
        console.log(chalk.dim(`    Uniqueness: `) + chalk.green(`${option.nameScore.uniqueness}`));
        console.log(chalk.dim(`    Cleverness: `) + chalk.green(`${option.nameScore.cleverness}`));
        console.log(chalk.dim(`    Memorability: `) + chalk.green(`${option.nameScore.memorability}`));
        console.log(chalk.dim(`    Length: `) + chalk.green(`${option.nameScore.length}`));
        console.log(chalk.dim(`    Conveys Meaning: `) + chalk.green(`${option.nameScore.conveysMeaning}`));
        console.log(chalk.dim(`    Marketability: `) + chalk.green(`${option.nameScore.marketability}`));
    });
    console.log(chalk.dim(`\n----------------------------------------\n`));
    
};

export const getAverageScores = (brand) => {
    return brand.brandNameIdeation.nameOptions.map(option => {
        const scores = option.nameScore;
        const totalScore = Object.values(scores).reduce((acc, score) => acc + score, 0);
        const averageScore = totalScore / Object.keys(scores).length;
        return {
            nameText: option.nameText,
            averageScore: averageScore
        };
    });
};


export const getBestBrandName = (brand, averageScores) => {
    let bestOption = null;
    let highestAverageScore = 0;

    averageScores.forEach(option => {
        if (option.averageScore > highestAverageScore) {
            highestAverageScore = option.averageScore;
            bestOption = brand.brandNameIdeation.nameOptions.find(brandOption => brandOption.nameText === option.nameText);
        }
    });

    if (highestAverageScore > 0.8) {
        brand.brandNameIdeation.bestOption = bestOption;
        return true;
    } else {
        return false;
    }
};




export const brandNameIdeation = async (query) => {
    let brand = await genInitialBrandNames(query);
    const scoreResponseSchema = createNameResponseSchema(brand);
    await scoreBrandNames(brand, scoreResponseSchema);

    const averageScores = getAverageScores(brand);
    console.log(chalk.dim(`\n----------------------------------------\n`));
    console.log(chalk.blue('Average Scores:'));
    averageScores.forEach(score => {
        console.log(chalk.yellow(`  - ${score.nameText}: Average Score: `) + chalk.green(`${score.averageScore.toFixed(2)}`));
    });
    console.log(chalk.dim(`\n----------------------------------------\n`));

    const bestOptionFound = getBestBrandName(brand, averageScores);

    if (bestOptionFound) {
        console.log(chalk.green('Best Brand Name:'), chalk.yellow(brand.brandNameIdeation.bestOption.nameText));
    } else {
        console.log(chalk.red('No brand name met the threshold. Rerunning the ideation process.'));
        return await brandNameIdeation(query); // Rerun the ideation process
    }

    return brand;
};

