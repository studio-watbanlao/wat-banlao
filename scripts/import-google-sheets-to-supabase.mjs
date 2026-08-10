const SHEET_ID = '1FHH9HvMVDTvj7uSTs3RArzmKFA7TZKzHRI5sPG8Fzqs';
const RESOURCES = ['activity', 'architecture', 'banner', 'blog', 'fastival', 'sacred'];

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running the import.');
}

const headers = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  'Content-Type': 'application/json',
};

for (const resource of RESOURCES) {
  const sheetResponse = await fetch(`https://opensheet.elk.sh/${SHEET_ID}/${resource}`);
  if (!sheetResponse.ok) {
    throw new Error(`Could not read ${resource}: ${sheetResponse.status}`);
  }

  const sheetRows = await sheetResponse.json();
  const rows = sheetRows
    .filter((row) => row.id)
    .map(({ id, status = 'DRAFT', view = '0', ...data }) => ({
      resource,
      id: String(id),
      status: ['DRAFT', 'PUBLIC', 'ARCHIVED'].includes(status) ? status : 'DRAFT',
      view: Number.parseInt(view, 10) || 0,
      data,
    }));

  if (rows.length === 0) {
    console.log(`${resource}: no rows to import`);
    continue;
  }

  const importResponse = await fetch(
    `${supabaseUrl}/rest/v1/site_content?on_conflict=resource%2Cid`,
    {
      method: 'POST',
      headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(rows),
    }
  );

  if (!importResponse.ok) {
    throw new Error(`Could not import ${resource}: ${await importResponse.text()}`);
  }

  console.log(`${resource}: imported ${rows.length} rows`);
}
