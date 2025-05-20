import { ai } from "../utils/gemini.js";

// Units is an array of objects:
// [
// {
//   name: "Unit 1",
//   description: "Description of Unit 1", (optional)
//   level: "year 1"
// }
// ]

// Function to assign each unit a level of hardness
export async function rank(units) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `I have provided an array of unit with their properties as follows: ${JSON.stringify(
        units
      )}. Rank each of them out of 10 based on their hardness and ease of learning. 
      Be precise and do not add any extra information. 
      The output should follow the format: [{unitName: "unitName", description: "description", level: "level", unitHardness: "unitHardness"}]. 
      It doesn't have to be json, it can be text, so long as it follows the format sepcified above. DO NOT ADD ANY EXTRA INFORMATION BEYOND THE FORMAT I'VE GIVEN.`,
    });
    const resText = response.candidates[0].content.parts[0].text;
    const startIndex = resText.indexOf("[") - 1;
    const endIndex = resText.lastIndexOf("]") + 1;
    const jsonString = resText.substring(startIndex, endIndex);
    const cleanedJsonString = JSON.parse(
      jsonString
        .replace(/unitName:/g, '"unitName":')
        .replace(/description:/g, '"description":')
        .replace(/level:/g, '"level":')
        .replace(/unitHardness:/g, '"unitHardness":')
        .replace(/'/g, '"')
    );
    return cleanedJsonString;
  } catch (error) {
    console.error("Error ranking units:", error);
    throw error;
  }
}
