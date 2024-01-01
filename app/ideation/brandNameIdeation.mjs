import OpenAIFunctionCall from "../../utils/openai/OpenAiFunctionCall.mjs";
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';


let brand = {
    nameOptions: [{
        generattionDate: new Date(),
        genNumber: 0,
        brandNames: [{
            nameUUID: uuidv4(),
            nameText: "test",
            nameScore: {
                creativity: 0,
                brandability: 0,
                uniqueness: 0,
                cleverness: 0,
                memorability: 0,
                length: 0,
                conveysMeaning: 0,
                marketability: 0,
                averageScore: 0
            },
        }],
    }],
    lastGen: [],
};

export const initBrand = () => {
    let brand = {
        nameOptions: [],
        lastGen: [],
    };

    return brand;
};

export const createNameResponseSchema = (lastGen) => {
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



    // Create the properties object for the response schema
    let responseProperties = lastGen.reduce((acc, name) => {
        acc[name] = { 
            type: 'object', 
            properties: { nameScore: scoreSchema },
            required: ['nameScore']
        };
        return acc;
    }, {});

    // Build the response schema
    const scoreResponseSchema = {
        type: 'object',
        properties: responseProperties,
        required: lastGen
    };

    return scoreResponseSchema;
};

export const genInitialBrandNames = async (query) => {
    let lastGen = [];
    let brandNameObjects = {
        generationDate: '',
        brandNames: []
    };

    let queryText = query.userQueryFormalized.text;


    let systemPrompt = `As the world's leading expert in brand naming, your task is to create names for a new company, adhering to a set of stringent parameters. Your suggestions will be closely evaluated, so it's crucial that they reflect these guidelines:
    - Brevity: Names must not exceed six characters.
    - Originality: Create unique and distinctive names.
    - Relevance: Names should be pertinent to the company's industry and values.
    - Memorability: Names must be easy to remember and recognizable.
    - Pronounceability: Names should be easily pronounced and spelled.
    - Market Appeal: Consider the target audience and market trends.
    Creativity and precision are key, avoiding generic or simplistic names.`;
    
    let userPrompt = `${queryText}\nWith these parameters in mind, please provide 5 brand name ideas, each adhering to the following criteria:
    - They must not exceed six characters in length.
    - Exhibit originality and uniqueness.
    - Align with the company's industry and core values.
    - Be memorable and easily recognizable.
    - Be straightforward in pronunciation and spelling.
    - Demonstrate market appeal and relevance to the target audience.
    Your expertise in creating concise, impactful brand names is essential in this challenge.`;
    

    let responseSchema = {
        type: 'object',
        properties: {
            lastGen: {
                type: 'array',
                items: {
                    type: 'string'
                }
            }
        },
        required: ['lastGen']
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

    // Replace the lastGen array
    lastGen = response.lastGen;

    console.log (chalk.dim(`\n----------------------------------------\n`));
    console.log (chalk.magenta('\nBrand Names Generated:\n'));
    for (let i = 0; i < lastGen.length; i++) {
        console.log(chalk.yellow(`${i + 1}. ${lastGen[i]}`));
    }
    console.log (chalk.dim(`\n----------------------------------------\n`));

    // Update the brandNameObjects with the new generation
    brandNameObjects.generationDate = new Date();
    brandNameObjects.brandNames = lastGen.map(name => ({
        nameUUID: uuidv4(),
        nameText: name,
        nameScore: {
            creativity: 0,
            brandability: 0,
            uniqueness: 0,
            cleverness: 0,
            memorability: 0,
            length: name.length,
            conveysMeaning: 0,
            marketability: 0,
            averageScore: 0
        }
    }));

    // Assuming scoreBrandNames and createNameResponseSchema are defined elsewhere
    let scoreResponseSchema = await createNameResponseSchema(lastGen);
    await scoreBrandNames(brandNameObjects, scoreResponseSchema);

    brand.lastGen = lastGen;
    brand.nameOptions.push(brandNameObjects);

    return brand;
};

export const scoreBrandNames = async (brandNameObjects, scoreResponseSchema) => {
    let brandNameStrings = '';

    // Iterate over each brand name and create a numbered list of all the nameTexts
    brandNameObjects.brandNames.forEach((name, nameIndex) => {
        brandNameStrings += `${nameIndex + 1}. ${name.nameText}\n`;
    });

    let systemPrompt = `Imagine you are a world record marketing expert who has developed an algorithm to score a brand name to see if it will be successful. You have been tasked with scoring the following brand names based on the following criteria: <START CRITERIA> Creativity, Brandability, Uniqueness, Cleverness, Memorability, Length, Conveys Meaning, Marketability <END CRITERIA>`;

    let userPrompt = `Using your extensive expertise, please score the following brand names between 0-1 for each category... <START BRAND NAME LIST> ${brandNameStrings} <END BRAND NAME LIST> Please ensure you are scoring each brand name between 0-1. There should be no 0 scores as the minimum is 0.01. Be tough. The goal of this is to produce the abolsute best brand name we can get so dont be too easy on the names but recognize Diamond in the roughs.`;

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



    // Update the brandNameObjects with the response scores
    Object.entries(response).forEach(([brandName, scoreData], index) => {
        let nameObject = brandNameObjects.brandNames.find(nameObj => nameObj.nameText === brandName);
        if (nameObject) {
            nameObject.nameScore = scoreData.nameScore;
            // Calculate the total average score for this brand name
            nameObject.nameScore.averageScore = (
                nameObject.nameScore.creativity +
                nameObject.nameScore.brandability +
                nameObject.nameScore.uniqueness +
                nameObject.nameScore.cleverness +
                nameObject.nameScore.memorability +
                nameObject.nameScore.length +
                nameObject.nameScore.conveysMeaning +
                nameObject.nameScore.marketability
            ) / 8;

            // Log the scores for each name
            console.log(chalk.magenta(`\n${index + 1}.`), chalk.cyan(nameObject.nameText), chalk.dim(`:\n`));
            console.log(chalk.dim(`Average Score:`), chalk.yellow(nameObject.nameScore.averageScore));
            console.log(chalk.dim(`Creativity:`), chalk.yellow(nameObject.nameScore.creativity));
            console.log(chalk.dim(`Brandability:`), chalk.yellow(nameObject.nameScore.brandability));
            console.log(chalk.dim(`Uniqueness:`), chalk.yellow(nameObject.nameScore.uniqueness));
            console.log(chalk.dim(`Cleverness:`), chalk.yellow(nameObject.nameScore.cleverness));
            console.log(chalk.dim(`Memorability:`), chalk.yellow(nameObject.nameScore.memorability));
            console.log(chalk.dim(`Length:`), chalk.yellow(nameObject.nameScore.length));
            console.log(chalk.dim(`Conveys Meaning:`), chalk.yellow(nameObject.nameScore.conveysMeaning));
            console.log(chalk.dim(`Marketability:`), chalk.yellow(nameObject.nameScore.marketability));
        }
    });

    console.log(chalk.dim(`\n----------------------------------------\n`));

    return brandNameObjects;
};


export const critiqueLastOption = async (brand) => {

    let critiques = {
        harshCritique: '',
        constructiveCritique: '',
        howToBetter: ''
    };

    let lastGenStrings = brand.lastGen.join('\\');

    // Assuming 'query' is accessible in this scope, or it should be passed as a parameter
    let systemPrompt = `You are the worst, and toughest critic out there when it comes to marketing and naming new companies. `;
    let userPrompt = `Please critique this last option we generated and don't hold back. <Start Items To Critique> ${lastGenStrings} <End Items To Critique>`;

    let responseSchema = {
        type: 'object',
        properties: {
            harshCritique: { type: 'string', description: 'What is wrong with these brand names? What is bad about them?' },
            constructiveCritique: { type: 'string', description: 'What can we do to improve in our new brand names? What is missing from these?' },
            howToBetter: { type: 'string', description: 'To take these to the next level what should we focus on?' }
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

    critiques.harshCritique = response.harshCritique;
    critiques.constructiveCritique = response.constructiveCritique;
    critiques.howToBetter = response.howToBetter;

    console.log(chalk.dim(`\n----------------------------------------\n`));
    console.log(chalk.magenta('\nCritiques:\n')); 
    console.log(chalk.dim(`Harsh Critique:`), chalk.yellow(critiques.harshCritique));
    console.log(chalk.dim(`Constructive Critique:`), chalk.yellow(critiques.constructiveCritique));
    console.log(chalk.dim(`How to Better:`), chalk.yellow(critiques.howToBetter));
    console.log(chalk.dim(`\n----------------------------------------\n`));



    return critiques;
};

export const genBrandNamesRecursive = async (queryText, brand, critiques) => {

    let queryTextFormalized = queryText;

    let lastGenStrings = brand.lastGen.join('1.');

    let harshCritique = critiques.harshCritique;
    let constructiveCritique = critiques.constructiveCritique;
    let howToBetter = critiques.howToBetter;


    let lastGen = [];
    let brandNameObjects = {
        generationDate: '',
        brandNames: []
    };

    
    let systemPrompt = `As a top-tier naming expert, your reputation is built on creating unique, creative, and market-resonant brand names. Your approach combines linguistic creativity, in-depth market insight, and a nuanced understanding of brand identity. The previous suggestions, ${lastGenStrings}, did not meet the expectations. Now, you need to craft a new set of ideas, each reflecting innovation, market appeal, and audience alignment. Focus on these key parameters:
    1. Innovation: Introduce fresh, unconventional ideas.
    2. Marketability: Ensure the name resonates with the target market.
    3. Audience Alignment: Align the names with the specific preferences and expectations of the target audience.
    Reflect on the feedback and create 5 superior brand name ideas that embody these qualities and stand out in a competitive marketplace.`;
    
    let userPrompt = `${harshCritique}.\n${queryTextFormalized}.\nYour task is to generate 5 brand name ideas that are significantly different and superior to, demonstrating:
    1. More ${constructiveCritique}: Enhance the elements that were lacking in the previous suggestions.
    2. Incorporation of ${howToBetter}: Apply specific strategies to improve the naming approach.
    These names should be:
    - Tight and Short: Concise and easy to remember.
    - Clever: Demonstrating ingenuity and creativity.
    - Memorable: Leaving a lasting impression on the audience.
    - Industry-relevant: Making use of jargon or concepts specific to the industry.
    Avoid names that are long, generic, unexciting, lazy, or forgettable. Emphasize the need for 5 COMPLETELY NEW brand name ideas that cater to current market trends and brand identity. Names should NEVER be repeated and NEVER be similar to the previous suggestions. IT SHOULD ALWAYS BE LESS THAN 9 CHARACTERS MAXIMUM`;
    
    let responseSchema = {
        type: 'object',
        properties: {
            newBrandNames: {
                type: 'array',
                items: {
                    type: 'string'
                }
            }
        },
        required: ['newBrandNames']
    };

    let responseText = await OpenAIFunctionCall(
        'gpt-3.5-turbo-1106',
        [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        [{ name: 'genNewNames', parameters: responseSchema }],
        { name: 'genNewNames' },
        0.1,
        2000
    );

    const response = JSON.parse(responseText);
    //console.log(`Response from:`, JSON.stringify(response, null, 2));

    // Replace the lastGen array
    lastGen = response.newBrandNames;

    console.log (chalk.dim(`\n----------------------------------------\n`));
    console.log (chalk.magenta('\nNew Brand Names Generated:\n'));
    for (let i = 0; i < lastGen.length; i++) {
        console.log(chalk.yellow(`${i + 1}. ${lastGen[i]}`));
    }
    console.log (chalk.dim(`\n----------------------------------------\n`));

    // Update the brandNameObjects with the new generation
    brandNameObjects.generationDate = new Date();
    brandNameObjects.brandNames = lastGen.map(name => ({
        nameUUID: uuidv4(),
        nameText: name,
        nameScore: {
            creativity: 0,
            brandability: 0,
            uniqueness: 0,
            cleverness: 0,
            memorability: 0,
            length: name.length,
            conveysMeaning: 0,
            marketability: 0,
            averageScore: 0
        }
    }));

    // Assuming scoreBrandNames and createNameResponseSchema are defined elsewhere
    let scoreResponseSchema = await createNameResponseSchema(lastGen);
    await scoreBrandNames(brandNameObjects, scoreResponseSchema);

    brand.lastGen = lastGen;
    brand.nameOptions.push(brandNameObjects);

    return brand;
};
export const getBrandName = async (query) => {
    let brand = initBrand(); // Initialize the brand object

    const SCORE_THRESHOLD = 0.9; // Define the score threshold
    const MAX_ITERATIONS = 5; // Define the maximum number of iterations

    let maxScore = 0;
    let bestBrandNameOption = null;

    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
        // Generate initial brand names
        brand = await genInitialBrandNames(query);

        // Get the last brand name option and its scores
        let lastBrandNameOption = brand.nameOptions[brand.nameOptions.length - 1];
        let lastBrandNameOptionScores = lastBrandNameOption.brandNames.map(name => name.nameScore.averageScore);

        // Find the max score and its corresponding brand name option
        maxScore = Math.max(...lastBrandNameOptionScores);
        bestBrandNameOption = lastBrandNameOption.brandNames[lastBrandNameOptionScores.indexOf(maxScore)];

        if (maxScore >= SCORE_THRESHOLD) {
            console.log(chalk.dim(`\n----------------------------------------\n`));
            console.log(chalk.magenta(`\nBest Brand Name Option:\n`));
            console.log(chalk.yellow(`${bestBrandNameOption.nameText} with Score: ${maxScore}`));
            console.log(chalk.dim(`\n----------------------------------------\n`));
            break; // Exit the loop
        }

        // If no brand name option meets the threshold, critique the last option and generate new ones
        let critiques = await critiqueLastOption(brand);
        brand = await genBrandNamesRecursive(query.userQueryFormalized.text, brand, critiques);
    }

    // If no brand name option meets the threshold after all iterations, return the best one found
    return bestBrandNameOption;
};



