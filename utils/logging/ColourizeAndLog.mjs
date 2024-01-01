
import chalk from 'chalk';


const colors = [chalk.redBright, chalk.greenBright, chalk.yellowBright, chalk.blueBright, chalk.magentaBright, chalk.cyanBright];
let colorIndex = 0;

export function ColourizeAndLog(obj, indent = '') {
    try {
        if (typeof obj !== 'object' || obj === null) {
            console.log(indent + colors[colorIndex % colors.length](String(obj)));
            return;
        }

        colorIndex++;
        let output = Array.isArray(obj) ? [] : {};

        for (let key in obj) {
            console.log(indent + colors[colorIndex % colors.length](key + ':'));
            ColourizeAndLog(obj[key], indent + '  ');
        }

        colorIndex--;
    } catch (error) {
        console.error(chalk.red('An error occurred:'), error);
    }
}
