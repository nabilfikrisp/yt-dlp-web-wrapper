export interface DownloadProgress {
  percentage: number;
  size: string;
  speed: string;
  eta: string;
}

const SIZE_UNITS = ["B", "KB", "MB", "GB", "TB"];

function extractSizeValueAndUnit(sizeStr: string): [number, string] {
  const match = sizeStr.match(/([\d.]+)\s*([KMGTP]?i?B)/i);
  if (!match) {
    return [0, "B"];
  }
  return [parseFloat(match[1]), match[2].toUpperCase()];
}

function formatSize(size: number, unit: string): string {
  const unitIndex = SIZE_UNITS.indexOf(unit);
  if (unitIndex === -1) {
    return `${size.toFixed(2)} ${unit}`;
  }

  for (let i = unitIndex; i >= 0; i--) {
    const unitValue = 1024 ** i;
    if (size >= unitValue || i === 0) {
      const formattedSize = size / unitValue;
      const formattedUnit = SIZE_UNITS[i];
      return `${formattedSize.toFixed(formattedSize >= 100 ? 0 : formattedSize >= 10 ? 1 : 2)} ${formattedUnit}`;
    }
  }

  return `${size.toFixed(2)} ${unit}`;
}

export function calculateCurrentSize(
  percentage: number,
  totalSize: string,
): string {
  if (!totalSize) {
    return "";
  }

  const [value, unit] = extractSizeValueAndUnit(totalSize);
  const currentValue = (percentage / 100) * value;
  return formatSize(currentValue, unit);
}

export function parseYtDlpProgress(raw: string): DownloadProgress | null {
  const percentageMatch = raw.match(/(\d+\.\d+)%/);
  const sizeMatch = raw.match(/of\s+([\d.]+\s*[KMGTP]?i?B)/i);
  const speedMatch = raw.match(/at\s+([\d.]+\s*[KMGTP]?i?B\/s)/i);
  const etaMatch = raw.match(/ETA\s+(\d+:\d+)/i);

  if (!percentageMatch) {
    return null;
  }

  return {
    percentage: parseFloat(percentageMatch[1]),
    size: sizeMatch?.[1] || "",
    speed: speedMatch?.[1] || "",
    eta: etaMatch?.[1] || "",
  };
}
