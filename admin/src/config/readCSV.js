import papaparse from "papaparse";
import { convertKeysToLowercase } from "./validation";
export function readCSV(result) {
  const results = papaparse.parse(result, {
    header: true,
    skipEmptyLines: "greedy",
    encoding: 'UTF-8',

  }).data
  return convertKeysToLowercase(results)
}

