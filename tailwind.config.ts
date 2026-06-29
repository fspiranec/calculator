import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'], theme: { extend: { colors: { clean: { 50:'#f0fdf4',100:'#dcfce7',500:'#22c55e',600:'#16a34a',700:'#15803d' } }, boxShadow: { soft: '0 18px 45px rgba(15, 23, 42, 0.08)' } } }, plugins: [] };
export default config;
