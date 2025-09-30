const modelMeta = {
    File: '/Models/gemma-3n/gemma-3n-E4B-it-int4-Web.litertlm',
    Name: 'Gemma 3n'
    // File: '/Models/gemma3-270m/gemma3-270m-it-q8-web.task',
    // Name: 'Gemma3 270m'

};
const mediapipeFolder = '/mediapipe_0_10_25';

function getPromptForToolCheck(prompt) {
        let instruct = 
`Check userPrompt against the following conditions.
Condition 1: Does the request require real-time information (e.g., current time, weather, live stock data)?
Condition 2: Does the request require access to private, dynamic, or non-public data (e.g., sales reports, personal files, user-specific metrics)?
Condition 3: Does the request require performing a specific external action or function (e.g., creating a file, sending an email, setting a timer, or running a calculation on external data)?

If ANY of the above conditions are true, respond STRICTLY with:
{ "value": "yes" }

If ALL of the above conditions are false and the request can be answered with general, static knowledge, respond STRICTLY with:
{ "value": "no" }

Do not generate any code, explanations, or additional text.
userPrompt ="${prompt}"`;
    return instruct;
}


function getPromptForToolSelection(msg, tools) {
    let toolDescriptions = '';
    for (const tool of Object.values(tools)) {
        toolDescriptions += `
### Tool Name: ${tool.name}
**Description:** ${tool.description}
**Parameters:`;
        for (const [paramName, paramDetails] of Object.entries(tool.parameters)) {
            toolDescriptions += `* **${paramName}** (${paramDetails.type}): ${paramDetails.description}`;
        }
    }

    let instruct = 
`${toolDescriptions}
Find a tool or a sequence of tools that can be used to solve the prompt. 
Only send a JSON object in the format: \`[{"tool_name": "...", "parameters": {"param1": "...", "param2": "..."}},{"tool_name": "...", "parameters": {"param1": "...", "param2": "..."}},...]\`.
If tool is found, make sure JSON is valid.

respond only if user prompt is 100% matching with tool description.

prompt: ${msg}
`;

    return instruct;
}


function getPromptForFinalResponse(msg, toolInfo, toolResult) {

    let instruct = '';
    if(!toolInfo || !toolResult){
        instruct = `userPromt:"${msg}"`;
    } else {
        instruct = 
`
userPrompt :${msg}
tools used: ${toolInfo.map(x => x.tool_name).join(',')}
output of tools: ${toolResult}

Keep the response short and to the point. 
Do not mention anything about tools or tool usage in the final response.
Do not generate any code or additional text unless asked for.
`;
        }

    return instruct;
}

function getPromptForJSONValidation(resp){
    let instruct = `The following JSON is incomplete or malformed. Please correct it and provide a valid JSON response only.
    ${resp}
    `;
    return instruct;
}

function getPromptForToolValidation(validationField, toolDescription){
    let instruct = `
check if validationPrompt have any relation with tool description or can be inferred from it. 
create a confidence score between 0 and 10, where 0 is no match and 10 is perfect match. 
if confidence is less than 8, respond with valid: false. if confidence is 8 or more, respond with valid: true.
response format: { "valid": true, "score":  } or { "valid": false, "score":  }
validationPrompt: "${validationField}"
toolDescription: ${toolDescription.description}
`;
    return instruct;
}

export {
    modelMeta,
    mediapipeFolder,
    getPromptForToolCheck,
    getPromptForToolSelection,
    getPromptForFinalResponse,
    getPromptForToolValidation,
    getPromptForJSONValidation
};