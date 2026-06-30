# design-system
- Use Tailwind utility classes directly in markup; do not use CSS custom properties (--tokens) or semantic abstractions like bg-brand. Confidence: 0.85
- Locked color palette: primary green-800 (#166534), hover green-900, light green-50 bg with green-800 text; borders gray-200 only; text gray-900/gray-600/gray-500; backgrounds white/gray-50. Confidence: 0.85
- Use p-5 padding for all cards. Confidence: 0.80
- Use rounded-md for buttons, cards, and inputs; no rounded-lg, rounded-xl, or rounded-full. Confidence: 0.80
- Use border-gray-200 for all borders; no other border colors. Confidence: 0.80
- Apply focus:border-green-800 focus:outline-none consistently on every input, select, and textarea. Confidence: 0.80
- Button text color rule: solid dark background (green-800, gray-900, amber, red) must use text-white; light/outline background (white, gray-50) must use dark text (gray-900 or green-800). Confidence: 0.75
- All links must use text-green-800 with hover:text-green-900 or hover:underline; only nav links in dark headers/footers or button-styled links may use alternate colors. Confidence: 0.70
