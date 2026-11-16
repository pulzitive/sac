export interface CertificateDownloadInput {
  studentName: string;
  trackTitle: string;
  cohortLabel: string;
  certificateId: string;
  issuedDate?: string;
  provisional?: boolean;
}

export function downloadCohortCertificatePng(input: CertificateDownloadInput): void {
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1130;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Warm museum-grade cream background
  ctx.fillStyle = '#F8F7F4';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer charcoal architectural frame
  ctx.strokeStyle = '#111113';
  ctx.lineWidth = 4;
  ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

  // Inner subtle warm stone border
  ctx.strokeStyle = '#D4D2CA';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(68, 68, canvas.width - 136, canvas.height - 136);

  // Magenta top accent bar
  ctx.fillStyle = '#C026D3';
  ctx.fillRect(120, 120, 96, 6);

  // Top Header Text
  ctx.fillStyle = '#A21CAF';
  ctx.font = '600 20px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('PULZITIVE ACADEMY · LAGOS & LONDON', 120, 165);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#52525B';
  ctx.font = '500 18px "JetBrains Mono", monospace';
  ctx.fillText(`CERT ID: ${input.certificateId}`, 1480, 165);
  ctx.textAlign = 'left';

  // Certificate Title
  ctx.fillStyle = '#111113';
  ctx.font = '700 62px "Bricolage Grotesque", Georgia, serif';
  ctx.fillText(
    input.provisional
      ? 'Provisional Cohort Progress Record'
      : 'Certificate of Cohort Completion',
    120,
    275
  );

  // Subtitle
  ctx.fillStyle = '#52525B';
  ctx.font = '400 26px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(
    'This certifies that the creative fellow named below has successfully completed',
    120,
    355
  );

  // Student Name
  ctx.fillStyle = '#111113';
  ctx.font = '700 68px "Bricolage Grotesque", Georgia, serif';
  ctx.fillText(input.studentName, 120, 465);

  // Magenta underline under student name
  ctx.fillStyle = '#C026D3';
  ctx.fillRect(120, 492, 620, 3);

  // Fellowship Track Description
  ctx.fillStyle = '#52525B';
  ctx.font = '400 26px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('the executive studio curriculum & live agency capstone in', 120, 565);

  ctx.fillStyle = '#A21CAF';
  ctx.font = '700 40px "Bricolage Grotesque", Georgia, sans-serif';
  ctx.fillText(input.trackTitle, 120, 632);

  ctx.fillStyle = '#27272A';
  ctx.font = '500 24px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(`Cohort 06 · ${input.cohortLabel}`, 120, 685);

  // Verification Strip
  ctx.fillStyle = '#F1EFEA';
  ctx.fillRect(120, 745, 1360, 108);
  ctx.strokeStyle = '#E5E3DD';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(120, 745, 1360, 108);

  ctx.fillStyle = '#71717A';
  ctx.font = '600 16px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('CREDENTIAL STATUS', 156, 785);
  ctx.fillText('ISSUING STUDIO', 600, 785);
  ctx.fillText('DATE ISSUED', 1120, 785);

  ctx.fillStyle = '#111113';
  ctx.font = '600 22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(
    input.provisional ? 'Pending Admin Seal' : 'Verified Graduate Credential',
    156,
    823
  );
  ctx.fillText('Pulzitive Digital Branding & Media', 600, 823);
  ctx.font = '600 22px "JetBrains Mono", monospace';
  ctx.fillText(
    input.issuedDate || new Date().toISOString().slice(0, 10),
    1120,
    823
  );

  // Signature Footer
  ctx.strokeStyle = '#111113';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(120, 965);
  ctx.lineTo(520, 965);
  ctx.stroke();

  ctx.fillStyle = '#111113';
  ctx.font = '700 24px "Bricolage Grotesque", Georgia, serif';
  ctx.fillText('Salami Abiodun', 120, 998);

  ctx.fillStyle = '#52525B';
  ctx.font = '400 18px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Founder & Creative Director, Pulzitive Agency', 120, 1028);

  // Official Seal Circle on Bottom Right
  ctx.beginPath();
  ctx.arc(1380, 968, 66, 0, Math.PI * 2);
  ctx.fillStyle = '#111113';
  ctx.fill();
  ctx.strokeStyle = '#C026D3';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#F8F7F4';
  ctx.font = '700 16px "Bricolage Grotesque", sans-serif';
  ctx.fillText('PULZITIVE', 1380, 962);
  ctx.fillStyle = '#E879F9';
  ctx.font = '600 13px "JetBrains Mono", monospace';
  ctx.fillText('ACADEMY', 1380, 984);
  ctx.textAlign = 'left';

  const url = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = url;
  link.download = `Pulzitive-Academy-Certificate-${input.certificateId}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
