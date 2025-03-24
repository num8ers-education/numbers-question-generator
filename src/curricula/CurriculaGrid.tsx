import CurriculumCard from './CurriculumCard';

// Mock data for curricula
const mockCurricula = [
  {
    id: '1',
    title: 'AP Calculus AB',
    description: 'Covers limits, derivatives, integrals, and the Fundamental Theorem of Calculus.',
    level: 'Advanced Placement',
    subjectArea: 'Mathematics',
    questionCount: 324,
    lastGenerated: '2 days ago'
  },
  {
    id: '2',
    title: 'IB Physics HL',
    description: 'Explores mechanics, thermodynamics, waves, electricity, nuclear physics, and energy production.',
    level: 'International Baccalaureate',
    subjectArea: 'Physics',
    questionCount: 256,
    lastGenerated: '5 days ago'
  },
  {
    id: '3',
    title: 'A-Level Chemistry',
    description: 'Covers physical chemistry, inorganic chemistry, and organic chemistry topics.',
    level: 'A Level',
    subjectArea: 'Chemistry',
    questionCount: 198,
    lastGenerated: '1 week ago'
  },
  {
    id: '4',
    title: 'AP Biology',
    description: 'Explores evolution, cellular processes, genetics, information transfer, ecology, and interactions.',
    level: 'Advanced Placement',
    subjectArea: 'Biology',
    questionCount: 287,
    lastGenerated: '3 days ago'
  },
  {
    id: '5',
    title: 'IB Economics SL',
    description: 'Covers microeconomics, macroeconomics, international economics, and development economics.',
    level: 'International Baccalaureate',
    subjectArea: 'Economics',
    questionCount: 175,
    lastGenerated: '2 weeks ago'
  },
  {
    id: '6',
    title: 'AP Computer Science A',
    description: 'Focuses on object-oriented programming methodology, with emphasis on problem solving and algorithm development.',
    level: 'Advanced Placement',
    subjectArea: 'Computer Science',
    questionCount: 210,
    lastGenerated: '4 days ago'
  }
];

const CurriculaGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockCurricula.map((curriculum) => (
        <CurriculumCard
          key={curriculum.id}
          {...curriculum}
        />
      ))}
    </div>
  );
};

export default CurriculaGrid;