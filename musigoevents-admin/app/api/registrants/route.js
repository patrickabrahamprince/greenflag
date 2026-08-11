import { NextResponse } from 'next/server';

// Minimal RFC 4180-ish CSV parser: handles quoted fields, escaped quotes
// ("" inside a quoted field), and commas/newlines inside quotes.
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\r') {
      // skip, \n handles the line break
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

export async function GET() {
  const sheetId = process.env.SHEET_ID;
  const gid = process.env.SHEET_GID || '0';

  if (!sheetId) {
    return NextResponse.json({ error: 'SHEET_ID is not configured' }, { status: 500 });
  }

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

  let res;
  try {
    res = await fetch(url, { cache: 'no-store' });
  } catch {
    return NextResponse.json({ error: 'Could not reach Google Sheets' }, { status: 502 });
  }

  if (!res.ok) {
    return NextResponse.json(
      {
        error:
          'Could not read the sheet (got a ' +
          res.status +
          '). Make sure it is shared as "Anyone with the link can view".',
      },
      { status: 502 }
    );
  }

  const text = await res.text();
  const rows = parseCSV(text);
  if (!rows.length) return NextResponse.json({ registrants: [] });

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = {
    timestamp: header.indexOf('timestamp'),
    name: header.indexOf('full name'),
    email: header.indexOf('email'),
    phone: header.indexOf('phone number'),
    gender: header.indexOf('gender'),
    age: header.indexOf('age'),
    location: header.indexOf('location'),
    instagram: header.indexOf('instagram handle'),
  };

  const registrants = rows.slice(1).map((r) => ({
    timestamp: idx.timestamp >= 0 ? r[idx.timestamp] || '' : '',
    name: idx.name >= 0 ? r[idx.name] || '' : '',
    email: idx.email >= 0 ? r[idx.email] || '' : '',
    phone: idx.phone >= 0 ? r[idx.phone] || '' : '',
    gender: idx.gender >= 0 ? (r[idx.gender] || '').trim() : '',
    age: idx.age >= 0 ? r[idx.age] || '' : '',
    location: idx.location >= 0 ? r[idx.location] || '' : '',
    instagram: idx.instagram >= 0 ? r[idx.instagram] || '' : '',
  }));

  return NextResponse.json({ registrants });
}
