/**
 * Formatação de dados vindos da API para exibição na interface.
 * As datas chegam do Oracle (coluna DATE) serializadas em JSON como ISO 8601.
 */

const MONTHS_SHORT = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
];

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

/**
 * Data curta no padrão usado nos cartões de viagem: "21 AGO".
 */
export function formatTripDateShort(value?: string | null): string {
  const date = parseDate(value);
  if (!date) return "--";
  const day = String(date.getDate()).padStart(2, "0");
  return `${day} ${MONTHS_SHORT[date.getMonth()]}`;
}

/**
 * Data completa: "21 AGO 2025".
 */
export function formatTripDateFull(value?: string | null): string {
  const date = parseDate(value);
  if (!date) return "--";
  const day = String(date.getDate()).padStart(2, "0");
  return `${day} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Horário no formato "14:30".
 * A coluna TRIP_DATE do Oracle pode não conter componente de hora significativo;
 * nesse caso retorna "--" em vez de exibir 00:00 como se fosse um horário real.
 */
export function formatTripTime(value?: string | null): string {
  const date = parseDate(value);
  if (!date) return "--";
  const hours = date.getHours();
  const minutes = date.getMinutes();
  if (hours === 0 && minutes === 0) return "--";
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Extrai apenas o nome da cidade de campos como "São Paulo - Tietê".
 */
export function cityOf(place?: string | null): string {
  if (!place) return "--";
  return place.split(" - ")[0].trim() || "--";
}

/**
 * Abrevia identificadores hexadecimais longos (RAW 16 / RAW 32) para exibição.
 */
export function shortId(id?: string | null, size = 8): string {
  if (!id) return "--";
  return id.length > size ? id.slice(0, size).toUpperCase() : id.toUpperCase();
}

/**
 * Rótulo de situação da passagem a partir dos campos TICKET_SOLD / TICKET_USED.
 */
export function ticketStatus(sold?: number, used?: number): {
  label: string;
  kind: "success" | "warning" | "neutral";
} {
  if (used === 1) return { label: "Embarque realizado", kind: "neutral" };
  if (sold === 1) return { label: "Pronto para embarque", kind: "success" };
  return { label: "Não confirmada", kind: "warning" };
}
