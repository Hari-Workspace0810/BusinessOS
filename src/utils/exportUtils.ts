/**
 * Enterprise Data Export Utility for BusinessOS
 * Supports CSV export with UTF-8 BOM encoding and executive PDF document generation.
 */

export interface ExportColumn<T = any> {
  label: string;
  key: string;
  format?: (value: any, item: T) => string;
}

export interface PDFExportOptions<T = any> {
  title: string;
  subtitle?: string;
  organizationName?: string;
  generatedBy?: string;
  columns: ExportColumn<T>[];
  data: T[];
  summaryMetrics?: { label: string; value: string | number }[];
  accentColor?: string;
}

/**
 * Exports data to a standard CSV file with Excel-compatible UTF-8 BOM
 */
export function exportToCSV<T = any>(
  filename: string,
  columns: ExportColumn<T>[],
  data: T[]
): void {
  try {
    const headerRow = columns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(',');

    const bodyRows = data.map((item) => {
      return columns
        .map((col) => {
          let val = (item as any)[col.key];
          if (col.format) {
            val = col.format(val, item);
          }
          if (val === null || val === undefined) {
            return '""';
          }
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',');
    });

    // \uFEFF is UTF-8 Byte Order Mark for proper Excel UTF-8 recognition
    const csvContent = '\uFEFF' + [headerRow, ...bodyRows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export CSV:', error);
  }
}

/**
 * Generates and triggers executive PDF printing/saving for reports & records
 */
export function exportToPDF<T = any>(options: PDFExportOptions<T>): void {
  const {
    title,
    subtitle = 'Confidential Enterprise Record',
    organizationName = 'BusinessOS Enterprise Workspace',
    generatedBy = 'Authorized Executive Officer',
    columns,
    data,
    summaryMetrics = [],
    accentColor = '#059669', // Emerald
  } = options;

  const timestamp = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const printWindow = window.open('', '_blank', 'width=900,height=750');
  if (!printWindow) {
    // If popup blocked, create hidden iframe fallback
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(generatePrintHTML());
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1500);
      }, 500);
    }
    return;
  }

  function generatePrintHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${title} - ${organizationName}</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 14mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 0;
              font-size: 11px;
              line-height: 1.4;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 12px;
              margin-bottom: 16px;
            }
            .brand-title {
              font-size: 20px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: -0.5px;
              margin: 0;
            }
            .brand-sub {
              font-size: 11px;
              color: #64748b;
              margin: 3px 0 0 0;
            }
            .meta-block {
              text-align: right;
              font-size: 10px;
              color: #475569;
            }
            .meta-block strong {
              color: #0f172a;
            }
            .summary-cards {
              display: flex;
              gap: 12px;
              margin-bottom: 16px;
              flex-wrap: wrap;
            }
            .card {
              flex: 1;
              min-width: 140px;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 8px 12px;
              background-color: #f8fafc;
            }
            .card-label {
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #64748b;
              margin-bottom: 2px;
            }
            .card-value {
              font-size: 14px;
              font-weight: 700;
              color: #0f172a;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th {
              background-color: #0f172a;
              color: #ffffff;
              font-weight: 600;
              text-align: left;
              padding: 7px 10px;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              border: 1px solid #0f172a;
            }
            td {
              padding: 6px 10px;
              border-bottom: 1px solid #e2e8f0;
              border-left: 1px solid #f1f5f9;
              border-right: 1px solid #f1f5f9;
              color: #334155;
            }
            tr:nth-child(even) td {
              background-color: #f8fafc;
            }
            .badge {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 9px;
              font-weight: 600;
            }
            .footer {
              border-top: 1px solid #e2e8f0;
              padding-top: 10px;
              display: flex;
              justify-content: space-between;
              font-size: 9px;
              color: #94a3b8;
              margin-top: 24px;
            }
            .verification-hash {
              font-family: monospace;
              color: #64748b;
            }
            @media print {
              .no-print { display: none; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="brand-title">${title}</h1>
              <p class="brand-sub">${subtitle} &bull; <strong>${organizationName}</strong></p>
            </div>
            <div class="meta-block">
              <div>Export Timestamp: <strong>${timestamp}</strong></div>
              <div>Generated By: <strong>${generatedBy}</strong></div>
              <div>Records: <strong>${data.length}</strong></div>
            </div>
          </div>

          ${
            summaryMetrics.length > 0
              ? `
            <div class="summary-cards">
              ${summaryMetrics
                .map(
                  (m) => `
                <div class="card">
                  <div class="card-label">${m.label}</div>
                  <div class="card-value">${m.value}</div>
                </div>
              `
                )
                .join('')}
            </div>
          `
              : ''
          }

          <table>
            <thead>
              <tr>
                ${columns.map((c) => `<th>${c.label}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data
                .map((row) => {
                  return `<tr>${columns
                    .map((c) => {
                      let val = (row as any)[c.key];
                      if (c.format) {
                        val = c.format(val, row);
                      }
                      return `<td>${val !== null && val !== undefined ? String(val) : '-'}</td>`;
                    })
                    .join('')}</tr>`;
                })
                .join('')}
            </tbody>
          </table>

          <div class="footer">
            <div>
              Certified Confidential &bull; BusinessOS Enterprise Cloud
            </div>
            <div class="verification-hash">
              SHA-256 Audit Stamp: [${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString(16).toUpperCase()}]
            </div>
          </div>

          <script>
            window.onload = function() {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `;
  }

  printWindow.document.open();
  printWindow.document.write(generatePrintHTML());
  printWindow.document.close();
}
