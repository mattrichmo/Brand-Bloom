import {OpenAIFunctionCall} from '../../utils/openai/OpenAiFunctionCall.mjs';
import {v4 as uuidv4} from 'uuid';
import chalk from 'chalk';
import {ColourizeAndLog} from '../../utils/logging/ColourizeAndLog.mjs';

const initQueryInit = async (queryText) => {
    let query = {
        userQueryRaw: {
            id: uuidv4(),
            text: queryText,
        },
        userQueryFormalized: {
            id: uuidv4(),
            text: '',
        },
        userQueryParsed: {},
    }

    return query;
};

const formalizeAndExpandQuery = async (query) => {
    let queryText = query.userQueryRaw.text;
    console.log (chalk.dim(`\nExpanding and Formalizing Query:`))
    console.log (chalk.dim(queryText), '\n')
    let systemPrompt = `You are going to recieve a user query and we are going to expand it out to be as detailed as possible and add details, where some are lacking. The purpose of this is to expand this out to give us more information to work with. The  user query to expand out is:\n\n "${queryText}"\n\nPlease expand in the first person.`
    let userPrompt = `Please expand out the query text and respond as if it your query. So in the first person with more details and information added. If the query mentions anything about the product, customer demographics or any business specifics then please be sure to include those specifics in your response.`


    let responseSchema = {
        type: 'object',
        properties: {
            expandedQueryFormalized: {
                type: 'string',
                description: 'The formalized and expanded query. This should include as much business, customer and product information as possible.',
            }
        },
        required: ['expandedQueryFormalized']
    }
    const responseText = await OpenAIFunctionCall(
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

    query.userQueryFormalized.text = response.expandedQueryFormalized;

    console.log(chalk.dim(`\n----------------------------------------\n`));
    console.log(chalk.magenta(`Expanded Query:`));
    console.log(chalk.yellow(query.userQueryFormalized.text));
    console.log(chalk.dim(`\n----------------------------------------\n`));


    return query;
};

const parseQuery = async (query) => {
    let queryText = query.userQueryFormalized.text;
    console.log (chalk.dim(`\nParsing Query:`))
    console.log (chalk.dim(queryText), '\n')
    let systemPrompt = `You will receive a detailed and expanded query. Your task is to parse this query to extract comprehensive information across multiple dimensions, including industry, product specifics, customer demographics, and market context. The objective is to gather as much detail as possible for each category. Here's the query for analysis:

    "${queryText}"
    
    <START RESPONSE FORMAT INSTRUCTIONS>
    When responding, ensure that you provide detailed information for every required property. If a particular piece of information is not available from the query, initialize the corresponding property with an empty array or an empty string, as appropriate. This includes returning empty arrays for list properties and empty strings for textual properties if no relevant data is present. Your response should cover all aspects of the query, leaving no property unaddressed. For any customer information, use your best guess on who this customer would be. For any product information, make sure you are looking at the original text and catching EVERYTHING. For any business information, make sure you are looking at the original text and catching EVERYTHING. For any market information, make sure you are looking at the original text and catching EVERYTHING.
    <END RESPONSE FORMAT INSTRUCTIONS>`
    let userPrompt = `Analyze the provided query text in detail and respond as if you are elaborating on your own query. Your response should enrich the original query with more specifics and nuanced information. Ensure to cover all aspects including any mentioned products, customer demographics, business specifics, and market context. If any aspect is not explicitly mentioned in the query, acknowledge its absence and provide an appropriate placeholder response. Your goal is to offer a comprehensive breakdown of the query, leaving no aspect unexplored.`

    let responseSchema = {
        type: 'object',
        properties: {
            queryDetails: { // Master object
                type: 'object',
                properties: {
                    mainIndustry: { 
                        type: 'string',
                        description: 'The main industry of the query.'
                    },
                    secondaryIndustries: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Secondary industries related to the query.'
                    },
                    keywords: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Keywords associated with the query.'
                    },
                    customerDetails: {
                        type: 'object',
                        properties: {
                            ageRangeMin: { 
                                type: 'number',
                                description: 'Minimum age range of the customer demographics.'
                            },
                            ageRangeMax: { 
                                type: 'number',
                                description: 'Maximum age range of the customer.'
                            },
                            genders: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Genders of the customers.'
                            },
                            locations: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Locations of the customers.'
                            },
                            incomeRanges: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Income ranges of the customers.'
                            },
                            interests: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Interests of the customers.'
                            },
                            culturalAspects: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Cultural aspects of the customers.'
                            }
                        },
                        required: ['ageRangeMin', 'ageRangeMax', 'genders', 'locations', 'incomeRanges', 'interests', 'culturalAspects'],
                        description: 'Details about the customer.'
                    },
                    productDetails: {
                        type: 'object',
                        properties: {
                            productType: { 
                                type: 'string',
                                description: 'Type of the product.'
                            },
                            priceRange: { 
                                type: 'string',
                                description: 'Price range of the product.'
                            },
                            features: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Features of the product.'
                            },
                            useCases: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Use cases of the product.'
                            },
                            qualityAspects: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Quality aspects of the product.'
                            }
                        },
                        required: ['productType', 'priceRange', 'features', 'useCases', 'qualityAspects'],
                        description: 'Details about the product.'
                    },
                    brandAspirations: {
                        type: 'object',
                        properties: {
                            desiredImage: { 
                                type: 'string',
                                description: 'Desired image of the brand.'
                            },
                            emotionalConnection: { 
                                type: 'string',
                                description: 'Emotional connection the brand aims to establish.'
                            },
                            uniqueStory: { 
                                type: 'string',
                                description: 'Unique story of the brand.'
                            }
                        },
                        required: ['desiredImage', 'emotionalConnection', 'uniqueStory'],
                        description: 'Aspirations of the brand.'
                    },
                    marketContext: {
                        type: 'object',
                        properties: {
                            competitors: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Competitors in the market.'
                            },
                            marketTrends: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Trends in the market.'
                            },
                            legalConstraints: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Legal constraints in the market.'
                            }
                        },
                        required: ['competitors', 'marketTrends', 'legalConstraints'],
                        description: 'Context of the market.'
                    }
                },
                required: ['mainIndustry', 'secondaryIndustries', 'keywords', 'customerDetails', 'productDetails', 'brandAspirations', 'marketContext'],
                description: 'Comprehensive details about the query.'
            }
        },
        required: ['queryDetails'],
        description: 'Schema for the structured response of the query.'
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

    query.userQueryParsed = response.queryDetails;

    parsedConsoleLog(query);

    let parsedQueryString = createParsedString(query.userQueryParsed);

    query.userQueryParsed.parsedQueryString = parsedQueryString;


    return query;
}

const parsedConsoleLog = (query) => {
        // Detailed logging for the entire response
        console.log(chalk.dim(`\n----------------------------------------\n`));
        console.log(chalk.dim(`Main Industry:`), chalk.yellow(query.userQueryParsed.mainIndustry));
    
        console.log(chalk.dim(`Secondary Industries:`));
        query.userQueryParsed.secondaryIndustries.forEach(industry => {
            console.log(chalk.yellow(`  - ${industry}`));
        });
    
        console.log(chalk.dim(`Keywords:`));
        query.userQueryParsed.keywords.forEach(keyword => {
            console.log(chalk.yellow(`  - ${keyword}`));
        });
    
        console.log(chalk.dim(`Customer Details:`));
        console.log(chalk.dim(`  Age Range:`), chalk.yellow(`${query.userQueryParsed.customerDetails.ageRangeMin} - ${query.userQueryParsed.customerDetails.ageRangeMax}`));
        console.log(chalk.dim(`  Genders:`));
        query.userQueryParsed.customerDetails.genders.forEach(gender => {
            console.log(chalk.yellow(`    - ${gender}`));
        });
        console.log(chalk.dim(`  Locations:`));
        query.userQueryParsed.customerDetails.locations.forEach(location => {
            console.log(chalk.yellow(`    - ${location}`));
        });
        console.log(chalk.dim(`  Income Ranges:`));
        query.userQueryParsed.customerDetails.incomeRanges.forEach(incomeRange => {
            console.log(chalk.yellow(`    - ${incomeRange}`));
        });
        console.log(chalk.dim(`  Interests:`));
        query.userQueryParsed.customerDetails.interests.forEach(interest => {
            console.log(chalk.yellow(`    - ${interest}`));
        });
        console.log(chalk.dim(`  Cultural Aspects:`));
        query.userQueryParsed.customerDetails.culturalAspects.forEach(culturalAspect => {
            console.log(chalk.yellow(`    - ${culturalAspect}`));
        });
    
        console.log(chalk.dim(`Product Details:`));
        console.log(chalk.dim(`  Product Type:`), chalk.yellow(query.userQueryParsed.productDetails.productType));
        console.log(chalk.dim(`  Price Range:`), chalk.yellow(query.userQueryParsed.productDetails.priceRange));
        console.log(chalk.dim(`  Features:`));
        query.userQueryParsed.productDetails.features.forEach(feature => {
            console.log(chalk.yellow(`    - ${feature}`));
        });
        console.log(chalk.dim(`  Use Cases:`));
        query.userQueryParsed.productDetails.useCases.forEach(useCase => {
            console.log(chalk.yellow(`    - ${useCase}`));
        });
        console.log(chalk.dim(`  Quality Aspects:`));
        query.userQueryParsed.productDetails.qualityAspects.forEach(qualityAspect => {
            console.log(chalk.yellow(`    - ${qualityAspect}`));
        });
    
        console.log(chalk.dim(`Brand Aspirations:`));
        console.log(chalk.dim(`  Desired Image:`), chalk.yellow(query.userQueryParsed.brandAspirations.desiredImage));
        console.log(chalk.dim(`  Emotional Connection:`), chalk.yellow(query.userQueryParsed.brandAspirations.emotionalConnection));
        console.log(chalk.dim(`  Unique Story:`), chalk.yellow(query.userQueryParsed.brandAspirations.uniqueStory));
    
        console.log(chalk.dim(`Market Context:`));
        console.log(chalk.dim(`  Competitors:`));
        query.userQueryParsed.marketContext.competitors.forEach(competitor => {
            console.log(chalk.yellow(`    - ${competitor}`));
        });
        console.log(chalk.dim(`  Market Trends:`));
        query.userQueryParsed.marketContext.marketTrends.forEach(marketTrend => {
            console.log(chalk.yellow(`    - ${marketTrend}`));
        });
        console.log(chalk.dim(`  Legal Constraints:`));
        query.userQueryParsed.marketContext.legalConstraints.forEach(legalConstraint => {
            console.log(chalk.yellow(`    - ${legalConstraint}`));
        });
    
        console.log(chalk.dim(`\n----------------------------------------\n`));
}   

const createParsedString = (parsedQuery) => {
    let parsedQueryString = '';

    // Concatenate main industry
    parsedQueryString += `Main Industry: ${parsedQuery.mainIndustry}\n`;

    // Concatenate secondary industries
    parsedQueryString += `Secondary Industries: ${parsedQuery.secondaryIndustries.join(', ')}\n`;

    // Concatenate keywords
    parsedQueryString += `Keywords: ${parsedQuery.keywords.join(', ')}\n`;

    // Concatenate customer details
    parsedQueryString += `Customer Details:\n`;
    parsedQueryString += `  Age Range: ${parsedQuery.customerDetails.ageRangeMin} - ${parsedQuery.customerDetails.ageRangeMax}\n`;
    parsedQueryString += `  Genders: ${parsedQuery.customerDetails.genders.join(', ')}\n`;
    parsedQueryString += `  Locations: ${parsedQuery.customerDetails.locations.join(', ')}\n`;
    parsedQueryString += `  Income Ranges: ${parsedQuery.customerDetails.incomeRanges.join(', ')}\n`;
    parsedQueryString += `  Interests: ${parsedQuery.customerDetails.interests.join(', ')}\n`;
    parsedQueryString += `  Cultural Aspects: ${parsedQuery.customerDetails.culturalAspects.join(', ')}\n`;

    // Concatenate product details
    parsedQueryString += `Product Details:\n`;
    parsedQueryString += `  Product Type: ${parsedQuery.productDetails.productType}\n`;
    parsedQueryString += `  Price Range: ${parsedQuery.productDetails.priceRange}\n`;
    parsedQueryString += `  Features: ${parsedQuery.productDetails.features.join(', ')}\n`;
    parsedQueryString += `  Use Cases: ${parsedQuery.productDetails.useCases.join(', ')}\n`;
    parsedQueryString += `  Quality Aspects: ${parsedQuery.productDetails.qualityAspects.join(', ')}\n`;

    // Concatenate brand aspirations
    parsedQueryString += `Brand Aspirations:\n`;
    parsedQueryString += `  Desired Image: ${parsedQuery.brandAspirations.desiredImage}\n`;
    parsedQueryString += `  Emotional Connection: ${parsedQuery.brandAspirations.emotionalConnection}\n`;
    parsedQueryString += `  Unique Story: ${parsedQuery.brandAspirations.uniqueStory}\n`;

    // Concatenate market context
    parsedQueryString += `Market Context:\n`;
    parsedQueryString += `  Competitors: ${parsedQuery.marketContext.competitors.join(', ')}\n`;
    parsedQueryString += `  Market Trends: ${parsedQuery.marketContext.marketTrends.join(', ')}\n`;
    parsedQueryString += `  Legal Constraints: ${parsedQuery.marketContext.legalConstraints.join(', ')}\n`;

    return parsedQueryString;
};


export const queryInitialization = async (queryText) => {


    let query = await initQueryInit(queryText);
    query = await formalizeAndExpandQuery(query);
    query = await parseQuery(query);


    return query;
};

export default queryInitialization;