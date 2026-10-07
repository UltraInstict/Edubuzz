/** Illustrative editorial photographs, not named institutions. */
export function editorialImage(topic: string) {
  const value = topic.toLowerCase();
  if (/nsfas|fund|matric|university/.test(value)) return { src: '/images/edubuzz-campus-small.webp', alt: 'Illustrative scene of students planning their next steps together' };
  if (/electric|plumb|artisan|nated|trade|engineering/.test(value)) return { src: '/images/workshop.jpg', alt: 'Equipment in a practical workshop' };
  if (/nurs|health|medical/.test(value)) return { src: '/images/healthcare.jpg', alt: 'Healthcare professional in a clinical setting' };
  if (/cv|interview|application|job|account|business|data|finance|retail|bank|government|logistic|security|hospitality/.test(value)) return { src: '/images/workspace.jpg', alt: 'Laptop and notes in a working space' };
  return { src: '/images/study.jpg', alt: 'Students working together on their studies' };
}
