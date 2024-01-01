
import { queryInitialization } from "./app/initialization/queryInitialization.mjs";
import { getBrandName } from "./app/ideation/brandNameIdeation.mjs";
import chalk from 'chalk';

import dotenv from 'dotenv';
dotenv.config();


let queryText = `I am creating a data business which caters to film production studios`


export const mainVein = async () => {

    console.log(chalk.dim(`\n----------------------------------------\n`));
    console.log(chalk.magenta(`Query Text:`));
    console.log(chalk.yellow(queryText));
    console.log(chalk.dim(`\n----------------------------------------\n`));


    let query = await queryInitialization(queryText);
   query =  await getBrandName(query);


};

mainVein();