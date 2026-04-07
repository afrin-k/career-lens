import { getAssessments } from '@/actions/interview'
import React from 'react'
import StatsCards from './_components/stats-cards';
import PerformanceChart from './_components/performance-chart';
import QuizList from './_components/quiz-list';

const InterviewPage = async() => {

  const assessments = await getAssessments();
  return (
    <div>
      <div>
        <div className='space-y-6'>
          <StatsCards assessments={assessments} />
          <PerformanceChart assessments={assessments} />
          <QuizList assessments={assessments} />
        </div>
      </div>
    </div>
  )
}

export default InterviewPage