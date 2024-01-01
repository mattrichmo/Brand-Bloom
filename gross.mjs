

export const initBrand = () => {
    // Initialize nameOptions with an empty array
    brand.brandNameIdeation.nameOptions = [];

    // Initialize bestOption with a default structure
    brand.brandNameIdeation.bestOption = {
        nameUUID: '',
        nameText: '',
        nameScore: {

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

export const createNameResponseSchema = (brand, onlyLatest = false) => {
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

    // Filter to only include the latest options if required
    const optionsToInclude = onlyLatest 
        ? brand.brandNameIdeation.nameOptions.slice(-5) 
        : brand.brandNameIdeation.nameOptions;

    const responseProperties = optionsToInclude.reduce((acc, option) => {
        if (option.nameText.trim() !== '') {
            const key = option.nameText;
            acc[key] = { 
                type: 'object', 
                properties: { nameScore: scoreSchema },
                required: ['nameScore']
            };
            console.log(chalk.yellow(`  - ${key}`));
        }
        return acc;
    }, {});

    const responseSchema = {
        type: 'object',
        properties: responseProperties,
        required: optionsToInclude.map(option => option.nameText).filter(text => text.trim() !== '')
    };

    console.log(chalk.dim('Completed Response Schema:'));
    console.log(chalk.yellow(JSON.stringify(responseSchema, null, 2)));
    console.log(chalk.dim(`\n----------------------------------------\n`));

    return responseSchema;
};


export const scoreBrandNames = async (brand, scoreResponseSchema, onlyLatest = false) => {
    let brandNameStrings = '';
    console.log(chalk.dim(`\n----------------------------------------\n`));
    console.log(chalk.dim('Preparing Brand Names for Scoring:'));

    // Filter to only include the latest options if required
    const optionsToScore = onlyLatest 
        ? brand.brandNameIdeation.nameOptions.slice(-5) 
        : brand.brandNameIdeation.nameOptions;

    optionsToScore.forEach((option, index) => {
        brandNameStrings += `${index + 1}. ${option.nameText} \n`;
        console.log(chalk.yellow(`  - ${option.nameText}`));
    });
    console.log(chalk.dim(`\n----------------------------------------\n`));

    let systemPrompt = `Imagine you are a world-renowned expert in branding, combining the strategic insight of a seasoned brand strategist, the creative vision of a top advertising creative director, and the analytical prowess of a consumer psychologist. You have a deep understanding of market trends, cultural nuances, and consumer behavior. Your expertise is sought after for creating brand names that resonate deeply with target audiences, convey a brand's essence, and are memorable and unique. You are going to receive a list of brand names and you will score each brand name according to a list of categories.`;

    let userPrompt = `Using your extensive expertise, please score the following brand names between 0-1 for each category. Consider the following aspects: 
    - Creativity: How innovative and original is the name?
    - Brandability: Does the name effectively embody the essence of the brand?
    - Uniqueness: How distinctive is the name in the market?
    - Cleverness: Does the name engage intellectually, perhaps with a play on words?
    - Memorability: Is the name easily remembered?
    - Length: Is the name concise yet descriptive?
    - Conveys Meaning: Does the name communicate the intended message or value?
    - Marketability: What is the commercial potential of the name?
    <START BRAND NAME LIST> ${brandNameStrings} <END BRAND NAME LIST>`;

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

    console.log(chalk.dim(`\n----------------------------------------\n`));
    console.log(chalk.dim('Updating Brand Names with Scores:'));

    optionsToScore.forEach(option => {
        const safeKey = option.nameText.replace(/\s+/g, '');
        if (response.hasOwnProperty(safeKey)) {
            option.nameScore = response[safeKey].nameScore;
            console.log(chalk.yellow(`  - ${option.nameText}:`));
            console.log(chalk.dim(`    Creativity: `) + chalk.green(`${option.nameScore.creativity}`));
            console.log(chalk.dim(`    Brandability: `) + chalk.green(`${option.nameScore.brandability}`));
            console.log(chalk.dim(`    Uniqueness: `) + chalk.green(`${option.nameScore.uniqueness}`));
            console.log(chalk.dim(`    Cleverness: `) + chalk.green(`${option.nameScore.cleverness}`));
            console.log(chalk.dim(`    Memorability: `) + chalk.green(`${option.nameScore.memorability}`));
            console.log(chalk.dim(`    Length: `) + chalk.green(`${option.nameScore.length}`));
            console.log(chalk.dim(`    Conveys Meaning: `) + chalk.green(`${option.nameScore.conveysMeaning}`));
            console.log(chalk.dim(`    Marketability: `) + chalk.green(`${option.nameScore.marketability}`));
        }
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
export const critiqueLastOption = async (brand) => {
    const lastBestOption = brand.brandNameIdeation.bestOption.nameText;
    const lastBestOptionScore = JSON.stringify(brand.brandNameIdeation.bestOption.nameScore);

    // Assuming 'query' is accessible in this scope, or it should be passed as a parameter
    let systemPrompt = `You are the worst, and toughest critic out there when it comes to marketing and naming new companies. `;
    let userPrompt = `Please critique this last option we generated and don't hold back. The best option you produced last time was ${lastBestOption} with a score of ${lastBestOptionScore}`;

    let responseSchema = {
        type: 'object',
        properties: {
            harshCritique: { type: 'string' },
            constructiveCritique: { type: 'string' },
            howToBetter: { type: 'string' }
        },
        required: ['harshCritique', 'constructiveCritique', 'howToBetter']
    };

    let responseText = await OpenAIFunctionCall(
        'gpt-3.5-turbo-1106',
        [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        [{ name: 'respondJSON', parameters: responseSchema }],
        { name: 'respondJSON' },
        0.1,
        2000
    );

    const response = JSON.parse(responseText);

    // Set the critiques in the bestOption
    brand.brandNameIdeation.bestOption.critique = {
        harshCritique: response.harshCritique,
        constructiveCritique: response.constructiveCritique,
        howToBetter: response.howToBetter
    };

    // Logging critiques
    console.log(chalk.dim(`\n----------------------------------------\n`));
    console.log(chalk.dim(`Critiques For ${lastBestOption}:`));
    console.log(chalk.dim(`Harsh Critique: `), chalk.yellow(response.harshCritique));
    console.log(chalk.dim(`Constructive Critique: `), chalk.yellow(response.constructiveCritique));
    console.log(chalk.dim(`How To Better: `), chalk.yellow(response.howToBetter));
    console.log(chalk.dim(`\n----------------------------------------\n`));

    return brand;
};

export const getBrandNamesIfThresholdNotMet = async (query, brand, lastOptionsString) => {
    let parsedText = query.userQueryParsed.parsedQueryString;

    let systemPrompt = `You are the top naming expert in the world. ...`;
    let userPrompt = `Here are the input parameters:<START INPUT PARAMETERS> ${parsedText} <END INPUT PARAMETERS> Please give me 5 of your absolute best brand name ideas based on the last options: Give me 5 different options that are not these: ${lastOptionsString}.`;

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

export const genBrandNameRecursive = async (brand, query) => {
    // Extracting details from the brand object
    const lastBestOption = brand.brandNameIdeation.bestOption.nameText;
    const lastBestOptionScore = JSON.stringify(brand.brandNameIdeation.bestOption.nameScore);
    const { harshCritique, constructiveCritique, howToBetter } = brand.brandNameIdeation.bestOption.critique;
    let parsedText = query.userQueryParsed.parsedQueryString;

    let systemPrompt = `You are the top naming expert in the world. `;
    let userPrompt = `Here are the input parameters:<START INPUT PARAMETERS> ${parsedText} <END INPUT PARAMETERS> Please give me 5 of your absolute best brand name ideas. The best option you produced last time was ${lastBestOption} with a score of ${lastBestOptionScore}. We are aiming for a score of 0.95. Give me 5 more options. Here is some feedback from the last generation: <START CRITIQUE> ${harshCritique} <END CRITIQUE> <START CONSTRUCTIVE CRITIQUE> ${constructiveCritique} <END CONSTRUCTIVE CRITIQUE> <START HOW TO BETTER> ${howToBetter} <END HOW TO BETTER>`;

    let responseText = await OpenAIFunctionCall(
        'gpt-3.5-turbo-1106',
        [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        [{ name: 'respondJSON', parameters: { type: 'object', properties: { brandNameOptions: { type: 'array', items: { type: 'string' } } }, required: ['brandNameOptions'] } }],
        { name: 'respondJSON' },
        0.1,
        2000
    );

    const response = JSON.parse(responseText);

    // Updating brand object with new name options
    response.brandNameOptions.forEach(nameText => {
        const uuid = uuidv4();
        brand.brandNameIdeation.nameOptions.push({
            nameUUID: uuid,
            nameText: nameText,
            nameScore: { creativity: 0, brandability: 0, uniqueness: 0, cleverness: 0, memorability: 0, length: 0, conveysMeaning: 0, marketability: 0 }
        });
    });

    return brand;
};



export const brandNameIdeation = async (query) => {
    let brand = {},
    if (!brand) {
        brand = await initBrand();
        brand = await genInitialBrandNames(query);
    }

    const scoreResponseSchema = createNameResponseSchema(brand);
    await scoreBrandNames(brand, scoreResponseSchema);

    const averageScores = getAverageScores(brand);
    const bestOptionFound = getBestBrandName(brand, averageScores);

    if (bestOptionFound && brand.brandNameIdeation.bestOption.averageScore > 0.9) {
        console.log(chalk.green('Best Brand Name:'), chalk.yellow(brand.brandNameIdeation.bestOption.nameText));
        return brand;
    } else if (bestOptionFound) {
        await critiqueLastOption(brand);
        brand = await genBrandNameRecursive(brand, query);
        return await brandNameIdeation(query, brand);
    } else {
        console.log(chalk.red('No brand name met the threshold. Generating new brand names based on the last options.'));
        const lastOptionsString = getLastOptionsString(brand);
        brand = await getBrandNamesIfThresholdNotMet(query, brand, lastOptionsString);
        // Score only the latest options
        await scoreBrandNames(brand, scoreResponseSchema, true);
        return await brandNameIdeation(query, brand);
    }
};





