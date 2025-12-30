import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const combinedSlug = (name: string, maxLen = 80): string => {
  const base = name
  if (!base) return 'untitled'
  let s = base
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9-]/g, '')
  if (!s) s = 'untitled'
  if (s.length > maxLen) s = s.slice(0, maxLen)
  return s
}

export const generateGradientThumbnail = () => {
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    ]

    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

    const svgContent = `
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${randomGradient.match(/#[a-fA-F0-9]{6}/g)?.[0] || '#667eea'}" />
        <stop offset="100%" style="stop-color:${randomGradient.match(/#[a-fA-F0-9]{6}/g)?.[1] || '#764ba2'}" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad)" />
    <circle cx="150" cy="100" r="30" fill="white" opacity="0.8" />
    <path d="M140 90 L160 90 L160 110 Z" fill="white" opacity="0.6" />
    </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
}