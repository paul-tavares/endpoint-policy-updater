import merge from 'lodash/merge'
/**
 * Updates a package policy (mutates) to add/set the logging to stdout
 * @param packagePolicy
 */
export const setOutputToStdout = (packagePolicy) => {
    // items[0].inputs[0].config.policy.value.linux
    // linux.advanced.logging.stdout

    merge(packagePolicy.inputs[0].config.policy.value, {
        linux: {
            advanced: {
                logging: {
                    stdout: "trace"
                }
            }
        },
        mac: {
            advanced: {
                logging: {
                    stdout: "trace"
                }
            }
        },
        windows: {
            advanced: {
                logging: {
                    stdout: "trace"
                }
            }
        }
    });
};
