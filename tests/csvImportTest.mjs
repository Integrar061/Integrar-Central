import Papa from 'papaparse';

// Mock test data similar to real clinic CSV with extra columns & counts
const mockCsvContent = `Data,Nome completo,Whatsapp,Link do Whatsapp,Contato,Tratamento,Status,Contagem Lateral,Total
2026-08-20,Mariana Silva,(11) 98765-4321,https://wa.me/5511987654321,Instagram Ads,Harmonização Facial,Fechou,12,120
2026-08-21,Carlos Eduardo,11912345678,,Google,Botox,Achou Caro,8,80
2026-08-22,Fernanda Costa,(21) 99888-7766,,Indicação,Ozonioterapia,Convênio,5,50
2026-08-23,Mariana Silva,(11) 98765-4321,,Instagram,Harmonização,Sem resposta,2,20
,,,,,,,,
,,,,,,,Contagem Total,270`;

console.log('--- TESTE DE PROCESSAMENTO DE CSV DE LEADS ---');

const normalizeKey = (key) => {
  return key
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
};

const sanitizePhone = (phoneStr) => phoneStr.replace(/\D/g, '');

const generateWhatsAppLink = (phoneStr, customLink) => {
  if (customLink && customLink.trim().startsWith('http')) {
    return customLink.trim();
  }
  const digits = sanitizePhone(phoneStr);
  if (!digits) return '';
  const fullNumber = digits.length <= 11 && !digits.startsWith('55') ? `55${digits}` : digits;
  return `https://wa.me/${fullNumber}`;
};

const parsed = Papa.parse(mockCsvContent, {
  header: true,
  skipEmptyLines: 'greedy'
});

const existingPatients = [
  { id: 'pat-1', name: 'Mariana Silva', phone: '(11) 98765-4321' }
];

const existingPhoneMap = new Map();
existingPatients.forEach(p => {
  const clean = sanitizePhone(p.phone);
  if (clean) existingPhoneMap.set(clean, p);
});

const seenPhonesInCsv = new Set();
const processed = [];

parsed.data.forEach((row, index) => {
  let rawDate = '';
  let rawName = '';
  let rawPhone = '';
  let rawLink = '';
  let rawContact = '';
  let rawTreatment = '';
  let rawStatus = '';

  Object.entries(row).forEach(([key, val]) => {
    const normKey = normalizeKey(key);
    const strVal = String(val || '').trim();

    if (normKey === 'data' || normKey.includes('data')) {
      if (!rawDate) rawDate = strVal;
    } else if (normKey === 'nome' || normKey.includes('nomecompleto') || normKey.includes('nome')) {
      if (!rawName) rawName = strVal;
    } else if (normKey === 'whatsapp' || normKey === 'zap' || normKey === 'telefone' || normKey === 'celular') {
      if (!rawPhone) rawPhone = strVal;
    } else if (normKey.includes('link') || normKey.includes('linkdowhatsapp')) {
      if (!rawLink) rawLink = strVal;
    } else if (normKey === 'contato' || normKey.includes('contato')) {
      if (!rawContact) rawContact = strVal;
    } else if (normKey === 'tratamento' || normKey.includes('procedimento') || normKey.includes('servico')) {
      if (!rawTreatment) rawTreatment = strVal;
    } else if (normKey === 'status' || normKey.includes('situacao') || normKey.includes('motivo')) {
      if (!rawStatus) rawStatus = strVal;
    }
  });

  if (!rawName && !rawPhone) return;

  const cleanPhone = sanitizePhone(rawPhone);
  const existingPatient = cleanPhone ? existingPhoneMap.get(cleanPhone) : undefined;
  const isDuplicateInCsv = cleanPhone ? seenPhonesInCsv.has(cleanPhone) : false;

  if (cleanPhone) {
    seenPhonesInCsv.add(cleanPhone);
  }

  processed.push({
    name: rawName,
    phone: rawPhone,
    cleanPhone,
    whatsappLink: generateWhatsAppLink(rawPhone, rawLink),
    treatment: rawTreatment,
    status: rawStatus,
    isDuplicateWithExisting: Boolean(existingPatient),
    isDuplicateInCsv
  });
});

console.log('Total de linhas úteis processadas:', processed.length);
console.log('Linhas processadas:');
processed.forEach((p, i) => {
  console.log(`[${i+1}] ${p.name} | Tel: ${p.phone} | Status: ${p.status} | Tratamento: ${p.treatment} | WA Link: ${p.whatsappLink} | Dup Base: ${p.isDuplicateWithExisting} | Dup CSV: ${p.isDuplicateInCsv}`);
});

if (processed.length === 4 && processed[1].whatsappLink === 'https://wa.me/5511912345678') {
  console.log('✅ TODOS OS TESTES PASSARAM COM SUCESSO!');
} else {
  console.error('❌ Falha nos testes de validação');
}
