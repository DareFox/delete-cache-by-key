const core = require('@actions/core');
const github = require('@actions/github');

const Modes = {
    Exact: "exact",
    StartsWith: "startsWith"
}

const Inputs = {
    mode: core.getInput("mode"),
    key: core.getInput("key"),
    attempts: parseInt(core.getInput("attempts")),
    delay: parseInt(core.getInput("delay")),
    token: core.getInput("token")
}

const { owner, repo } = github.context.repo;
const octokit = github.getOctokit(Inputs.token)

function delay(delayInms) {
    return new Promise(resolve => setTimeout(resolve, delayInms));
};

/**
 * @param {string} key 
 */
function deleteByExactKey(key) {
    return octokit.rest.actions.deleteActionsCacheByKey({
        key: key,
        owner: owner,
        repo: repo
    })
}

/**
 * @param {string} key 
 * @returns {string[]}
 */
async function getAllKeys(key) {
    const result = await octokit.rest.actions.getActionsCacheList({
        owner: owner,
        repo: repo,
        key: key
    })

    return result.data.actions_caches.map((value) => value.key).filter((value) => !!value)
}

/**
 * @param {number} max 
 * @param {number} delayMs 
 * @param {function} func
 */
async function attempts(max, delayMs, func) {
    for (let attempt = 0; attempt < max; attempt++) {
        try {
            if (attempt != 0) {
                core.warning(`Attempt ${attempt}. Delaying for ${delayMs}ms before start`)
                await delayMs(delayMs)
            }
            
            func()
            break
        } catch(err) {
            if (attempt + 1 == max) {
                core.setFailed(err)
            }
        }
    }
}

if (Inputs.key === "") {
    core.setFailed("Input argument 'key' is empty")
}

if (Object.values(Modes).includes(Inputs.mode) != true) {
    core.setFailed(`Invalid value (${Inputs.mode}) for argument 'mode'. Valid values: ${Object.values(Modes)}`)
}

attempts(Inputs.attempts, Inputs.delay, () => {
    core.info("Mode: " + Inputs.mode)
    if (Inputs.mode === Modes.Exact) {
        core.info(`Deleting key ${Inputs.key}`)
        deleteByExactKey(Inputs.key)
    } else if (Inputs.mode === Modes.StartsWith) {
        const keys = getAllKeys(Inputs.key)
        core.info(`Keys that starts with ${Inputs.key}: `)
        core.info(keys.join(", "))

        for (const key of keys) {
            core.info(`Deleting key ${key}`)
            deleteByExactKey(key)
        }
    }
}) 

