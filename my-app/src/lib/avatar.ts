const PALETTE: string[] = [
  '#2563eb', 
  '#7c3aed', 
  '#db2777', 
  '#dc2626', 
  '#ea580c', 
  '#ca8a04', 
  '#16a34a', 
  '#0d9488', 
  '#0891b2', 
  '#475569', 
];

export function avatarColor(seed: string): string {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h) ^ seed.charCodeAt(i);
  }
  return PALETTE[Math.abs(h) % PALETTE.length]!;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 1).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}
