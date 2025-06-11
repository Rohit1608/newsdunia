import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 

export function exportToCSV(data, filename = "payout_report.csv") {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(data, filename = "payout_report.pdf") {
  const doc = new jsPDF();

  doc.text("Payout Report", 14, 15);

  const tableData = data.map((entry) => [
    entry.author,
    entry.count,
    entry.total.toFixed(2),
  ]);

  autoTable(doc, {
    startY: 20,
    head: [["Author", "Articles", "Total Payout ($)"]],
    body: tableData,
  });

  doc.save(filename);
}
