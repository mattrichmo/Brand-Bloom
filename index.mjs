
import { queryInitialization } from "./app/initialization/queryInitialization.mjs";
import { brandNameIdeation } from "./app/ideation/brandNameIdeation.mjs";
import chalk from 'chalk';

import dotenv from 'dotenv';
dotenv.config();


let queryText = `I'm building a company in the AI space. I like nature, trees and forests and my userbase is likely in the pacific northwest.`


export const mainVein = async () => {

    console.log(chalk.dim(`\n----------------------------------------\n`));
    console.log(chalk.magenta(`Query Text:`));
    console.log(chalk.yellow(queryText));
    console.log(chalk.dim(`\n----------------------------------------\n`));


    let query = await queryInitialization(queryText);
   query =  await brandNameIdeation(query);


};

mainVein();