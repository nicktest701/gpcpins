import * as XLSX from 'xlsx';
import { convertKeysToLowercase } from './validation';

export function readXLSX(result) {
  try {
    const data = new Uint8Array(result);
    let readData = XLSX.read(data, { type: 'array' });
    //work book
    const workBook = readData.SheetNames[0];
    const workSheet = readData.Sheets[workBook];
    /* Convert sheet to json*/
    const dataParse = XLSX.utils.sheet_to_json(workSheet, {
      header: 0,
    });

    return convertKeysToLowercase(dataParse);
  } catch (error) {
    throw error.messsage;
  }
}
