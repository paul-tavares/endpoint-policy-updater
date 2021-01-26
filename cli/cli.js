import minimist from 'minimist'
import {Kibana, promptUser} from "../lib";
import {red, bold} from 'kleur'; // reuse from prompts
import packageJson from '../package.json';
import {setOutputToStdout} from "../lib/actions";

const cliOptions = {
    default: {
        'kibana-url': 'http://localhost:5601',
        'kibana-user': 'elastic',
        'kibana-password': 'changeme'
    },
    alias: {
        'kibana-url': 'kibanaUrl',
        'kibana-user': 'kibanaUser',
        'kibana-password': 'kibanaPassword',
        'h': 'help',
        'v': 'version'
    },
    boolean: [ 'help', 'h', 'version', 'v' ]
};

const run = async () => {
    const runOptions = minimist(process.argv.slice(2), cliOptions);

    if (runOptions.help) {
        console.log(getHelp());
        process.exit(0);
    }

    if (runOptions.version) {
        console.log(getVersion());
        process.exit(0);
    }

    console.log(`
${getHeader()}
${red(`
  ${bold('WARNING!')} FOR DEVELOPMENT AND TESTING PURPOSES ONLY!`)}
${getSeparator()}
`);

    const kibana = new Kibana(runOptions);
    const userSelections = await promptUser(kibana);

    if (!userSelections.policy) {
        console.warn(`No Endpoint Policies found in Ingest`);
        console.info(`Go to here to add some: ${runOptions.kibanaUrl}/app/ingestManager#/policies`);
        return;
    }

    // Perform the actions
    setOutputToStdout(userSelections.policy);

    // Save the policy
    const updateResponse = await kibana.updateEndpointPolicy(userSelections.policy);

    console.log(`
Update done! Result:

${JSON.stringify(updateResponse, null, 4)}

${getSeparator()}
`);
};

const getSeparator = () => '-------------------------------------------------------------------';

const getHeader = () => '-[ ENDPOINT KIBANA ARTIFACT DOWNLOADER ]---------------------------';

const getHelp = () => (`
${packageJson.name} [options]

Options:
${Object.keys(cliOptions.default).map(opt => `    --${opt}`).join("\n")}
`);

const getVersion = () => {
    return `${packageJson.name} ${packageJson.version}`;
}

//==========[ RUN ]=================================
run();
