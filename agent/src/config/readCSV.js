import papaparse from "papaparse";
export function readCSV(result) {
  return papaparse.parse(result, {
    header: true,
    skipEmptyLines: "greedy",
    encoding:'UTF-8'
  }).data
}
