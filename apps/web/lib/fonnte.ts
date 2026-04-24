export async function sendWhatsApp(phone: string, message: string) {
  // Normalisasi nomor: 08xxx → 628xxx
  const normalized = phone.startsWith("0")
    ? "62" + phone.slice(1)
    : phone;

  const response = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      Authorization: process.env.FONNTE_TOKEN!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target: normalized,
      message,
      countryCode: "62",
    }),
  });

  const data = await response.json();
  return data;
}

export function templateTagihanBaru(
  namaOrtu: string,
  namaSiswa: string,
  nominal: number,
  jatuhTempo: string
) {
  const rupiah = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(nominal);

  return `Halo ${namaOrtu} 👋

Berikut tagihan les untuk *${namaSiswa}*:

💰 *Nominal:* ${rupiah}
📅 *Jatuh Tempo:* ${jatuhTempo}

Mohon segera melakukan pembayaran sebelum jatuh tempo.

Terima kasih 🙏`;
}

export function templateReminder(
  namaOrtu: string,
  namaSiswa: string,
  nominal: number,
  sisaHari: number
) {
  const rupiah = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(nominal);

  return `Halo ${namaOrtu} 👋

Mengingatkan tagihan les *${namaSiswa}* sebesar *${rupiah}* akan jatuh tempo dalam *${sisaHari} hari*.

Mohon segera melakukan pembayaran.

Terima kasih 🙏`;
}

export function templateTerlambat(
  namaOrtu: string,
  namaSiswa: string,
  nominal: number
) {
  const rupiah = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(nominal);

  return `Halo ${namaOrtu} 👋

Tagihan les *${namaSiswa}* sebesar *${rupiah}* sudah *melewati jatuh tempo*.

Mohon segera menyelesaikan pembayaran.

Terima kasih 🙏`;
}