import { utils, writeFile } from 'xlsx';
// import { Parser } from 'json2csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import _ from 'lodash'


export const exportToExcel = (data) => {
    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    writeFile(workbook, 'Verifiers.xlsx');
};

export const exportToCSV = (data) => {
    // const parser = new Parser();
    // const csv = parser.parse(data);
    // const blob = new Blob([csv], { type: 'text/csv' });
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = 'FilteredData.csv';
    // a.click();
    // URL.revokeObjectURL(url);

    const headers = Object.keys(data[0]); // Extract headers from first object

    // Combine headers and rows using map and join
    const csvRows = [
        headers.join(','),
        ...data.map((obj) =>
            headers.map((header) => (obj[header] || '')).join(',')
        ),
    ];
    const csvData = csvRows.join('\r\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'Verifiers.csv'; // Set filename

    link.click(); // Trigger the download

    // Clean up the temporary URL (optional)
    window.URL.revokeObjectURL(url);

};

export const exportToPDF = (data, columns) => {
    const doc = new jsPDF({
        orientation: 'landscape',
        format: 'a4',
         compress: true,
         
    });
    const tableColumn = Object.keys(data[0]);
    const modifiedColumns = _.difference(tableColumn, columns)
    const tableRows = data.map(item => Object.values(item));
 

    doc.autoTable({
        head: modifiedColumns,
        body: tableRows,
         styles: { overflow: 'linebreak' },


    });

    doc.save('Verifiers.pdf');
};