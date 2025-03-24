// src/components/curricula/CurriculaGrid.tsx
import CurriculumCard from './CurriculumCard';

// Mock data for curricula
const mockCurricula = [
  {
    id: '1',
    title: 'AP Calculus AB',
    level: 'Advanced Placement',
    subjectArea: 'Mathematics',
    questionCount: 324
  },
  {
    id: '2',
    title: 'IB Physics HL',
    level: 'International Baccalaureate',
    subjectArea: 'Physics',
    questionCount: 256
  },
  {
    id: '3',
    title: 'A-Level Chemistry',
    level: 'A Level',
    subjectArea: 'Chemistry',
    questionCount: 198
  },
  {
    id: '4',
    title: 'AP Biology',
    level: 'Advanced Placement',
    subjectArea: 'Biology',
    questionCount: 287
  },
  {
    id: '5',
    title: 'IB Economics SL',
    level: 'International Baccalaureate',
    subjectArea: 'Economics',
    questionCount: 175
  },
  {
    id: '6',
    title: 'AP Computer Science A',
    level: 'Advanced Placement',
    subjectArea: 'Computer Science',
    questionCount: 210
  }
];

const CurriculaGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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