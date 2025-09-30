import { FilesetResolver, LlmInference } from '@mediapipe/tasks-genai';
import { tools } from './AI-Tools.js';
import { 
    modelMeta, 
    mediapipeFolder, 
    getPromptForToolSelection, 
    getPromptForToolCheck, 
    getPromptForFinalResponse,
    getPromptForJSONValidation, 
    getPromptForToolValidation
} from './AI-Models.js';
let modelBuffer = {};

export class LLM {
    constructor(options = {}) {
        this.onResult = options?.onResult || (() => { });
        this.onComplete = options?.onComplete || (() => { });
        this.modelMeta = options?.modelMeta || modelMeta;
        this.llm = modelBuffer[this.modelMeta.Name];
    }

    /** Load model into memory */
    async loadModel() {
        let self = this;
        if(modelBuffer[self.modelMeta.Name])
            return modelBuffer[self.modelMeta.Name];
        console.log('Loading ' + self.modelMeta.Name);
        try {
            const mediapipe = await FilesetResolver.forGenAiTasks(mediapipeFolder);
            modelBuffer[self.modelMeta.Name] = await LlmInference.createFromOptions(mediapipe, {
                baseOptions: { modelAssetPath: self.modelMeta.File },
                // maxTokens: 10000,
            });
            console.log('Model loaded successfully.');
            self.llm = modelBuffer[self.modelMeta.Name];
        } catch (e) {
            console.error('Failed to load model:', e);
        }

        return modelBuffer[self.modelMeta.Name];
    }

    
    /** Clean up and parse JSON response from LLM */
    async executeJSONcleanupLLM(JSONString) {
        let cleanJSON =  JSONString.trim().replace(/```json\n|```/g, '').trim();
        try{
            return {value: JSON.parse(cleanJSON)};
        } catch(e){
            let partialJSON = false;
            if(JSONString.includes('```JSON') || JSONString.includes('{') || JSONString.includes('[')){
                partialJSON = true;
            }
            return {error: 'parse error', partialJSON};
        }
    }

    /** Run LLM with prompt and return full response */
    async runLLM(prompt, status = 'Thinking'){
        let self = this;
        await self.loadModel();
        console.log(`-----${status}-----`);
        let resp = await this.llm?.generateResponse(prompt,(partialResults, complete) => {
            let _state = status === 'Thinking' && complete ? 'Complete' : status;
            self.onResult(partialResults, _state);
        });
        return resp;
    }

    /** Execution flow for tool/function calling */
    async executeToolCheck(msg){
        let self = this;
        let instruct = getPromptForToolCheck(msg);
        let resp = await self.runLLM(instruct, 'Analysing');
        let JSONresp = await self.executeJSONcleanupLLM(resp);
        let tool =  JSONresp?.value?.value == 'yes' ? true : false;
        let error = JSONresp?.error ? 'Tool check parse error' : null;
        return {msg, tool, error};

    }

    async executeToolFinder(msg, prevResp){
        if(!prevResp.tool) return prevResp;
        let self = this;
        let instruct = getPromptForToolSelection(prevResp?.msg || msg, tools);
        let resp = await self.runLLM(instruct, 'Finding Tool');
        let toolInfo =  await self.executeJSONcleanupLLM(resp);
        if(!toolInfo?.value && toolInfo?.partialJSON){
            let instructRetry = getPromptForJSONValidation(resp);
            let respRetry = await self.runLLM(instructRetry, 'Finding Tool');
            toolInfo =  await self.executeJSONcleanupLLM(respRetry);
        }
        let error = toolInfo?.value ? null : 'No valid tool found';
        toolInfo = toolInfo?.value || null;

        return {...prevResp, toolInfo, error};

    }


    async validateToolResponse(toolResp){
        if(!toolResp?.toolInfo) return toolResp;
        let self = this;
        let validationField = toolResp.toolInfo[0].parameters.validation;
        let toolDescription = tools[toolResp.toolInfo[0].tool_name];
        let instruct = getPromptForToolValidation(validationField, toolDescription);
        let resp = await self.runLLM(instruct, 'Validating Tool Response');
        let json = await self.executeJSONcleanupLLM(resp);
        if(!json.value.valid){
            toolResp.toolInfo = null;
            toolResp.error = 'Tool response validation failed';
        }
        toolResp.validationScore = json.value.score;
        return toolResp;

    }

    async executeTool(prevResp){
        if(!prevResp.toolInfo) return prevResp;
        return {...prevResp, toolResult:10}
    }

    async executeFinalResponse(msg, prevResp){
        let self = this;
        let instruct = getPromptForFinalResponse(msg, prevResp?.toolInfo, prevResp?.toolResult);
        let resp = await self.runLLM(instruct, 'Finalizing');
        return resp;
    }

    async execute(msg){
        await this.loadModel();
        let toolCheck = await this.executeToolCheck(msg);   // check if tool needed
        let toolResp = await this.executeToolFinder(msg, toolCheck); // find tool
        let toolRespValid = await this.validateToolResponse(toolResp); // validate tool response
        let toolResult = await this.executeTool(toolRespValid);     // execute tool
        let aiResp = await this.executeFinalResponse(msg, toolRespValid);   // get final response
        this.onComplete({resp: aiResp, toolUsed: toolRespValid?.toolInfo, toolResult: toolResult?.toolResult});
        return aiResp;
    }

    async test(msg) {
        let response = await this.execute(msg || "What is the temperature in Berlin?");
        console.log("Model response:", response);
    }
}
